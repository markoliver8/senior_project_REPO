import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function AudioControls({ playing, onPlay, onPause, onReplay, volume, setVolume }: {
  playing: boolean; onPlay: () => void; onPause: () => void; onReplay: () => void; volume: number; setVolume: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {playing
        ? <Button size="icon" variant="secondary" aria-label="Pause audio" onClick={onPause}><Pause /></Button>
        : <Button size="icon" variant="secondary" aria-label="Play audio" onClick={onPlay}><Play /></Button>}
      <Button size="icon" variant="ghost" aria-label="Replay line" onClick={onReplay}><RotateCcw /></Button>
      <Button size="icon" variant="ghost" aria-label={volume ? "Mute" : "Unmute"} onClick={() => setVolume(volume ? 0 : 1)}>{volume ? <Volume2 /> : <VolumeX />}</Button>
      <Slider className="w-24" value={[volume * 100]} max={100} step={5} onValueChange={(v) => setVolume(v[0] / 100)} aria-label="Volume" />
    </div>
  );
}

export function Waveform({ active, bars = 24 }: { active: boolean; bars?: number }) {
  return (
    <div className="flex h-10 items-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className={`w-1 rounded-full bg-primary ${active ? "animate-wave" : "scale-y-25 opacity-40"}`}
          style={{ height: "100%", animationDelay: `${(i * 73) % 900}ms` }} />
      ))}
    </div>
  );
}
