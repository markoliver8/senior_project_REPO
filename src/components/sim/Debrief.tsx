import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, CheckCircle2, Clock, Lightbulb, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Scenario, ScenarioResult } from "@/lib/sim/types";
import { DEFAULT_LABELS } from "./ActionBar";
import { cn } from "@/lib/utils";

export function Debrief({ scenario, result, onNext }: { scenario: Scenario; result: ScenarioResult; onNext: () => void }) {
  const ioc = (id: string) => scenario.iocs.find((i) => i.id === id)!;
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className={cn("flex flex-wrap items-center gap-6 rounded-2xl border p-6", result.passed ? "glow-primary" : "glow-danger")}>
        <div className="text-center">
          <div className={cn("font-mono text-6xl font-bold", result.passed ? "text-success" : "text-destructive")}>{result.score}</div>
          <div className="text-xs tracking-widest text-muted-foreground uppercase">Scenario score</div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-xl font-semibold">
            {result.passed ? <CheckCircle2 className="text-success" /> : <XCircle className="text-destructive" />}
            {result.passed ? "Threat handled" : "You were compromised"}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">You chose: {DEFAULT_LABELS[result.action]}</Badge>
            <Badge variant="secondary">Best response: {DEFAULT_LABELS[scenario.correctAction]}</Badge>
            <Badge variant="secondary"><Clock className="mr-1 size-3" />{(result.elapsedMs / 1000).toFixed(1)}s</Badge>
          </div>
          <div className="text-sm text-muted-foreground">Competency in this category is now <span className="font-mono text-foreground">{result.competencyAfter}/100</span>.</div>
        </div>
      </div>

      {result.tierChange !== 0 && (
        <div className={cn("flex items-center gap-3 rounded-xl border p-4", result.tierChange > 0 ? "border-success/50 bg-success/10" : "border-warning/50 bg-warning/10")}>
          {result.tierChange > 0 ? <ArrowUp className="text-success" /> : <ArrowDown className="text-warning" />}
          {result.tierChange > 0 ? "Three in a row — you've been promoted to a harder tier." : "Two misses in a row — difficulty lowered and guided hints switched on."}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 font-semibold">Indicators you caught ({result.hits.length}/{scenario.iocs.length})</h3>
          <ul className="space-y-3">
            {result.hits.length === 0 && <li className="text-sm text-muted-foreground">None flagged — turn on “Mark indicators” next time.</li>}
            {result.hits.map((id) => <IocRow key={id} hit label={ioc(id).label} explain={ioc(id).explain} />)}
          </ul>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 font-semibold">Indicators you missed</h3>
          <ul className="space-y-3">
            {result.missed.length === 0 && <li className="text-sm text-success">Nothing missed. Excellent eye.</li>}
            {result.missed.map((id) => <IocRow key={id} label={ioc(id).label} explain={ioc(id).explain} />)}
          </ul>
          {result.falseFlags > 0 && <p className="mt-3 text-xs text-muted-foreground">{result.falseFlags} item(s) flagged that weren't indicators (−5 each).</p>}
        </section>
      </div>

      <section className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><Lightbulb className="size-4 text-accent" /> Key takeaways</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">{scenario.takeaways.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={onNext}>Next scenario</Button>
        <Button size="lg" variant="outline" asChild><Link to="/">Back to dashboard</Link></Button>
      </div>
    </div>
  );
}

function IocRow({ label, explain, hit }: { label: string; explain: string; hit?: boolean }) {
  return (
    <li className="flex gap-2 text-sm">
      {hit ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />}
      <div><div className="font-medium">{label}</div><div className="text-muted-foreground">{explain}</div></div>
    </li>
  );
}
