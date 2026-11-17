import { useEffect, useRef, useState } from "react";
import { Crosshair, Mic, MicOff, Pause, Play, RotateCcw, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ARTIFACT_TYPES, type Action, type ArtifactType, type DeepfakeContent } from "@/lib/sim/types";
import { speak, stopSpeech } from "@/lib/sim/speech";
import type { FlagApi } from "./Flaggable";
import { cn } from "@/lib/utils";
import cfo from "@/assets/deepfake-cfo.jpg";

interface Marker { type: ArtifactType; t: number; x: number; y: number; key: string }
const TOLERANCE = 1.5;

export function DeepfakePlayer({ df, api, onAction }: { df: DeepfakeContent; api: FlagApi; onAction: (a: Action) => void }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tool, setTool] = useState<ArtifactType>("lipsync");
  const [markers, setMarkers] = useState<Marker[]>([]);
  const spoken = useRef(new Set<number>());

  useEffect(() => () => stopSpeech(), []);
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setT((v) => {
      const n = Math.round((v + 0.1) * 10) / 10;
      if (n >= df.duration) { setPlaying(false); return df.duration; }
      return n;
    }), 100);
    return () => clearInterval(iv);
  }, [playing, df.duration]);

  useEffect(() => {
    if (!playing) return;
    df.script.forEach((line, i) => {
      if (t >= line.t && !spoken.current.has(i)) {
        spoken.current.add(i);
        const lagged = df.artifacts.some((a) => a.type === "lipsync" && line.t >= a.from - 0.5 && line.t <= a.to);
        setTimeout(() => speak(line.text, df.voice), lagged ? 900 : 0);
      }
    });
  }, [t, playing, df]);

  const active = (type: ArtifactType) => df.artifacts.some((a) => a.type === type && t >= a.from && t <= a.to);
  const caption = [...df.script].reverse().find((l) => t >= l.t);

  const keyFor = (type: ArtifactType, at: number) =>
    df.artifacts.some((a) => a.type === type && at >= a.from - TOLERANCE && at <= a.to + TOLERANCE) ? type : `fp-${type}-${at}`;

  const addMarker = (x: number, y: number) => {
    const key = keyFor(tool, t);
    setMarkers((m) => [...m, { type: tool, t, x, y, key }]);
    if (!api.flagged.has(key)) api.toggle(key);
  };
  const removeMarker = (i: number) => {
    const m = markers[i]!;
    const rest = markers.filter((_, j) => j !== i);
    setMarkers(rest);
    if (!rest.some((r) => r.key === m.key) && api.flagged.has(m.key)) api.toggle(m.key);
  };
  const restart = () => { stopSpeech(); spoken.current.clear(); setT(0); setPlaying(true); };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-4 text-sm">
        <div className="flex items-center gap-2 font-semibold"><Video className="size-4 text-primary" /> {df.meeting}</div>
        <p className="mt-1 text-muted-foreground">{df.context}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <div
            className="relative aspect-video cursor-crosshair overflow-hidden rounded-xl border bg-device"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              addMarker(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
            }}
            role="button" aria-label="Video — click to mark an artifact at the current time"
          >
            <img src={cfo} alt="Video feed of the CFO" width={1280} height={720}
              className={cn("size-full object-cover", playing && !active("stiffness") && "animate-breathe", active("lighting") && "animate-flicker")} />
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10"><div className="h-1/3 w-full animate-scan bg-gradient-to-b from-transparent via-foreground to-transparent" /></div>
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded bg-device/80 px-2 py-1 text-xs"><span className="size-2 rounded-full bg-destructive" /> {df.speaker}</div>
            <div className="absolute top-3 right-3 rounded bg-device/80 px-2 py-1 font-mono text-xs">00:{String(Math.floor(t)).padStart(2, "0")} / 00:{df.duration}</div>
            {caption && playing && <div className="absolute inset-x-8 bottom-4 rounded bg-device/80 px-3 py-2 text-center text-sm">{caption.text}</div>}
            {markers.map((m, i) => (
              <span key={i} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
                <Crosshair className="size-6 text-accent drop-shadow" />
              </span>
            ))}
            {!playing && t === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-device/60">
                <Button size="lg" onClick={(e) => { e.stopPropagation(); setPlaying(true); }}><Play /> Join & play</Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="secondary" aria-label={playing ? "Pause" : "Play"} onClick={() => { if (playing) { setPlaying(false); stopSpeech(); } else if (t >= df.duration) restart(); else setPlaying(true); }}>{playing ? <Pause /> : <Play />}</Button>
            <Button size="icon" variant="ghost" aria-label="Restart" onClick={restart}><RotateCcw /></Button>
            <div className="relative h-2 flex-1 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(t / df.duration) * 100}%` }} />
              {markers.map((m, i) => <span key={i} className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-accent" style={{ left: `${(m.t / df.duration) * 100}%` }} />)}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {df.attendees.map((a) => (
              <div key={a} className="flex aspect-video flex-col items-center justify-center rounded-lg border bg-secondary text-xs">
                <span className="text-lg font-semibold">{a[0]}</span>
                <span className="flex items-center gap-1 text-muted-foreground">{a.includes("muted") ? <MicOff className="size-3" /> : <Mic className="size-3" />}{a.replace(" (muted)", "")}</span>
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-3 rounded-xl border bg-card p-4">
          <div className="text-sm font-semibold">Artifact marker</div>
          <p className="text-xs text-muted-foreground">Pick an artifact type, then click the video at the moment you notice it.</p>
          <div className="space-y-1.5">
            {ARTIFACT_TYPES.map((a) => (
              <Button key={a.id} size="sm" variant={tool === a.id ? "default" : "outline"} className="w-full justify-start" onClick={() => setTool(a.id)}>{a.label}</Button>
            ))}
          </div>
          {markers.length > 0 && (
            <div className="space-y-1 border-t pt-3">
              <div className="text-xs text-muted-foreground">Your marks</div>
              {markers.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <Badge variant="secondary">{ARTIFACT_TYPES.find((a) => a.id === m.type)?.label}</Badge>
                  <span className="font-mono">0:{String(Math.floor(m.t)).padStart(2, "0")}</span>
                  <button type="button" aria-label="Remove mark" onClick={() => removeMarker(i)}><X className="size-3" /></button>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
      <div className="space-y-2">
        <div className="text-xs tracking-wider text-muted-foreground uppercase">Your decision</div>
        {df.options.map((o) => (
          <Button key={o.label} variant={o.action === "report" ? "success" : o.action === "comply" ? "destructive" : "outline"} className="w-full justify-start" onClick={() => { stopSpeech(); setPlaying(false); onAction(o.action!); }}>{o.label}</Button>
        ))}
      </div>
    </div>
  );
}
