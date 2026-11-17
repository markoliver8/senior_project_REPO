import { useEffect, useRef, useState } from "react";
import { Building2, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Action, VoiceCloneContent } from "@/lib/sim/types";
import { pauseSpeech, resumeSpeech, speak, stopSpeech } from "@/lib/sim/speech";
import { Flaggable, type FlagApi } from "./Flaggable";
import { AudioControls, Waveform } from "./AudioControls";
import { cn } from "@/lib/utils";

export function VoiceClone({ vc, api, onAction }: { vc: VoiceCloneContent; api: FlagApi; onAction: (a: Action) => void }) {
  const [line, setLine] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const volRef = useRef(volume); volRef.current = volume;
  const cancelled = useRef(false);
  useEffect(() => () => { cancelled.current = true; stopSpeech(); }, []);

  const playFrom = (i: number) => {
    if (i >= vc.lines.length) { setPlaying(false); return; }
    cancelled.current = false;
    setLine(i); setPlaying(true);
    speak(vc.lines[i]!.text, { ...vc.voice, volume: volRef.current }, () => { if (!cancelled.current) playFrom(i + 1); });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold"><Building2 className="size-4 text-primary" /> Organizational context</div>
        <p className="text-sm text-muted-foreground">{vc.org}</p>
        <div className="flex items-center gap-2 text-sm font-semibold"><Users className="size-4 text-primary" /> People</div>
        <ul className="space-y-1 text-sm">{vc.people.map((p) => <li key={p.name} className="flex justify-between"><span>{p.name}</span><span className="text-muted-foreground">{p.role}</span></li>)}</ul>
        <div className="flex items-start gap-2 rounded-md bg-accent/10 p-3 text-sm"><Info className="mt-0.5 size-4 shrink-0 text-accent" />{vc.situation}</div>
      </aside>
      <div className="space-y-5">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-xl font-semibold">{vc.caller[0]}</div>
            <div className="flex-1"><div className="font-semibold">{vc.caller}</div><div className="text-xs text-muted-foreground">{vc.channel}</div></div>
            <Waveform active={playing} bars={20} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {line === -1
              ? <Button onClick={() => playFrom(0)}>Play voice clip</Button>
              : <AudioControls playing={playing} volume={volume} setVolume={setVolume}
                  onPlay={() => { if (line >= vc.lines.length - 1 && !playing) playFrom(0); else { resumeSpeech(); setPlaying(true); } }}
                  onPause={() => { pauseSpeech(); setPlaying(false); }}
                  onReplay={() => { cancelled.current = true; stopSpeech(); setTimeout(() => playFrom(0), 50); }} />}
          </div>
          <div className="mt-4 space-y-2">
            {vc.lines.map((l, i) => (
              <p key={i} className={cn("text-sm transition-opacity", i <= line ? "opacity-100" : "opacity-30")}>
                <Flaggable id={l.ioc ?? `vc-${i}`} api={api}>{l.text}</Flaggable>
              </p>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs tracking-wider text-muted-foreground uppercase">What do you do?</div>
          {vc.options.map((o) => (
            <Button key={o.label} variant={o.action === "report" ? "success" : o.action === "comply" ? "destructive" : "outline"} className="w-full justify-start" onClick={() => { stopSpeech(); onAction(o.action!); }}>{o.label}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}
