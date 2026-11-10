import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Action, CallContent } from "@/lib/sim/types";
import { pauseSpeech, resumeSpeech, speak, stopSpeech } from "@/lib/sim/speech";
import { Flaggable, type FlagApi } from "./Flaggable";
import { PhoneFrame } from "./SmsPhone";
import { AudioControls, Waveform } from "./AudioControls";
import { cn } from "@/lib/utils";

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function CallScreen({ call, api, onAction }: { call: CallContent; api: FlagApi; onAction: (a: Action) => void }) {
  const [state, setState] = useState<"ringing" | "active">("ringing");
  const [nodeId, setNodeId] = useState(call.start);
  const [transcript, setTranscript] = useState<{ who: "caller" | "you"; text: string; ioc?: string; key: string }[]>([]);
  const [secs, setSecs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const volRef = useRef(volume); volRef.current = volume;
  const node = call.nodes[nodeId];

  useEffect(() => () => stopSpeech(), []);
  useEffect(() => {
    if (state !== "active") return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const say = (text: string) => { setPlaying(true); speak(text, { ...call.voice, volume: volRef.current }, () => setPlaying(false)); };

  useEffect(() => {
    if (state !== "active") return;
    setTranscript((t) => [...t, { who: "caller", text: node.say, ioc: node.ioc, key: nodeId }]);
    say(node.say);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, state]);

  const choose = (label: string, next?: string, action?: Action) => {
    stopSpeech(); setPlaying(false);
    setTranscript((t) => [...t, { who: "you", text: label, key: `you-${t.length}` }]);
    if (action) onAction(action); else if (next) setNodeId(next);
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[auto_1fr]">
      <PhoneFrame>
        <div className="flex h-full flex-col items-center bg-gradient-to-b from-secondary to-device px-6 pt-20 pb-10">
          <div className="text-xs tracking-widest text-muted-foreground uppercase">{state === "ringing" ? "Incoming call" : "On call"}</div>
          <div className={cn("mt-6 flex size-24 items-center justify-center rounded-full bg-card text-3xl font-semibold", state === "ringing" && "animate-ring-pulse")}>{call.caller[0]}</div>
          <div className="mt-4 text-xl font-semibold">{call.caller}</div>
          <Flaggable id={call.numberIoc ?? "number-x"} api={api} className="font-mono text-sm text-muted-foreground">{call.number}</Flaggable>
          {state === "active" && <div className="mt-2 font-mono text-lg text-primary" aria-label="Call timer">{fmt(secs)}</div>}
          <div className="mt-6"><Waveform active={playing} /></div>
          <div className="mt-auto w-full">
            {state === "ringing" ? (
              <div className="flex justify-around">
                <div className="flex flex-col items-center gap-2"><Button size="icon" variant="destructive" className="size-16 rounded-full" aria-label="Decline" onClick={() => onAction("ignore")}><PhoneOff className="size-6" /></Button><span className="text-xs">Decline</span></div>
                <div className="flex flex-col items-center gap-2"><Button size="icon" variant="success" className="size-16 rounded-full" aria-label="Answer" onClick={() => setState("active")}><Phone className="size-6" /></Button><span className="text-xs">Answer</span></div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <AudioControls playing={playing} volume={volume} setVolume={setVolume}
                  onPlay={() => { resumeSpeech(); setPlaying(true); }} onPause={() => { pauseSpeech(); setPlaying(false); }} onReplay={() => say(node.say)} />
                <Button size="icon" variant="destructive" className="size-14 rounded-full" aria-label="Hang up" onClick={() => choose("(hung up)", undefined, "ignore")}><PhoneOff /></Button>
              </div>
            )}
          </div>
        </div>
      </PhoneFrame>

      <div className="space-y-4">
        {state === "ringing" ? (
          <p className="text-muted-foreground">An unknown caller is ringing. Answer to hear them, or decline.</p>
        ) : (
          <>
            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>Live transcript</span><span className="flex items-center gap-1"><Flag className="size-3" /> Use flag mode to mark suspicious lines</span></div>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {transcript.map((l) => (
                  <div key={l.key} className={cn("rounded-lg px-3 py-2 text-sm", l.who === "you" ? "ml-auto w-fit max-w-[80%] bg-primary/15" : "max-w-[90%] bg-secondary")}>
                    {l.who === "caller" ? <Flaggable id={l.ioc ?? `line-${l.key}`} api={api}>{l.text}</Flaggable> : l.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs tracking-wider text-muted-foreground uppercase">Your response</div>
              {node.options.map((o) => (
                <Button key={o.label} variant={o.action === "report" ? "success" : o.action === "comply" ? "destructive" : "outline"} className="w-full justify-start" onClick={() => choose(o.label, o.next, o.action)}>
                  {o.label}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
