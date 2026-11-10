import { useEffect, useRef, useState } from "react";
import { Flag, Lightbulb, Timer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Action, Scenario, ScenarioResult } from "@/lib/sim/types";
import { CATEGORIES } from "@/lib/sim/types";
import { scoreScenario } from "@/lib/sim/adaptive";
import { useProgress } from "@/lib/sim/store";
import { stopSpeech } from "@/lib/sim/speech";
import type { FlagApi } from "./Flaggable";
import { EmailClient } from "./EmailClient";
import { SmsPhone } from "./SmsPhone";
import { CallScreen } from "./CallScreen";
import { VoiceClone } from "./VoiceClone";
import { DeepfakePlayer } from "./DeepfakePlayer";
import { Debrief } from "./Debrief";

export function ScenarioRunner({ scenario, showHints, onNext }: { scenario: Scenario; showHints: boolean; onNext: () => void }) {
  const { record } = useProgress();
  const [phase, setPhase] = useState<"brief" | "live" | "debrief">("brief");
  const [flagMode, setFlagMode] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (phase !== "live") return;
    startRef.current = performance.now();
    const t = setInterval(() => setElapsed(performance.now() - startRef.current), 200);
    return () => clearInterval(t);
  }, [phase]);

  const api: FlagApi = {
    flagMode, flagged,
    toggle: (id) => setFlagged((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }),
  };

  // R8: the action is committed immediately, the timer stops, then the debrief opens.
  const onAction = (action: Action) => {
    const elapsedMs = performance.now() - startRef.current;
    stopSpeech();
    const s = scoreScenario(scenario, action, [...flagged]);
    const r = record({ scenarioId: scenario.id, title: scenario.title, category: scenario.category, tier: scenario.tier, action, elapsedMs, ...s });
    setElapsed(elapsedMs);
    setResult(r);
    setPhase("debrief");
  };

  const cat = CATEGORIES.find((c) => c.id === scenario.category)!;
  const guided = showHints || scenario.tier === 1;

  if (phase === "debrief" && result) return <Debrief scenario={scenario} result={result} onNext={onNext} />;

  if (phase === "brief") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border bg-card p-8 glow-primary">
        <div className="flex gap-2"><Badge>{cat.label}</Badge><Badge variant="secondary">Tier {scenario.tier}</Badge></div>
        <h1 className="text-3xl font-semibold">{scenario.title}</h1>
        <p className="text-muted-foreground">{scenario.brief}</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Investigate. Links and attachments are sandboxed — nothing leaves this app.</li>
          <li>Turn on <span className="text-foreground">Mark indicators</span> and click anything suspicious.</li>
          <li>Choose your response. The timer stops the moment you act.</li>
        </ol>
        <Button size="lg" onClick={() => setPhase("live")}>Start scenario</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-14 z-30 flex flex-wrap items-center gap-4 rounded-xl border bg-card/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2"><Badge>{cat.short}</Badge><Badge variant="secondary">Tier {scenario.tier}</Badge><span className="font-semibold">{scenario.title}</span></div>
        <div className="ml-auto flex items-center gap-2 font-mono text-sm" aria-label="Scenario timer"><Timer className="size-4 text-primary" />{(elapsed / 1000).toFixed(1)}s</div>
        <div className="flex items-center gap-2">
          <Switch id="flagmode" checked={flagMode} onCheckedChange={setFlagMode} />
          <Label htmlFor="flagmode" className="flex items-center gap-1"><Flag className="size-4 text-accent" /> Mark indicators</Label>
          <Badge variant="outline" className="font-mono">{flagged.size}</Badge>
        </div>
      </div>
      {guided && (
        <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <Lightbulb className="size-5 shrink-0 text-warning" />
          <div><div className="font-semibold">{showHints ? "Guided mode — hints are on after recent misses" : "Guided tips"}</div>
            <ul className="mt-1 list-disc pl-4">{scenario.hints.map((h) => <li key={h}>{h}</li>)}</ul></div>
        </div>
      )}
      {scenario.content.kind === "email" && <EmailClient email={scenario.content} api={api} onAction={onAction} />}
      {scenario.content.kind === "sms" && <SmsPhone sms={scenario.content} api={api} onAction={onAction} />}
      {scenario.content.kind === "call" && <CallScreen call={scenario.content} api={api} onAction={onAction} />}
      {scenario.content.kind === "voiceclone" && <VoiceClone vc={scenario.content} api={api} onAction={onAction} />}
      {scenario.content.kind === "deepfake" && <DeepfakePlayer df={scenario.content} api={api} onAction={onAction} />}
    </div>
  );
}
