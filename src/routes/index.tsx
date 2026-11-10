import { createFileRoute, Link } from "@tanstack/react-router";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Bar, BarChart, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { AlertTriangle, ArrowRight, Mail, MessageSquare, Phone, Video, Briefcase, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/lib/sim/store";
import { weakestCategory } from "@/lib/sim/adaptive";
import { CATEGORIES, type Category } from "@/lib/sim/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel Range — AI social engineering defense training" },
      { name: "description", content: "Gamified phishing, smishing, vishing and deepfake simulations with adaptive difficulty and analytics." },
      { property: "og:title", content: "Sentinel Range — social engineering defense training" },
      { property: "og:description", content: "Train against AI-powered phishing, vishing and deepfakes with adaptive simulations." },
    ],
  }),
  component: Dashboard,
});

const ICONS: Record<Category, typeof Mail> = { phishing: Mail, smishing: MessageSquare, vishing: Phone, deepfake: Video, bec: Briefcase };

function Dashboard() {
  const { progress, reset } = useProgress();
  const cats = progress.categories;
  const weak = weakestCategory(cats);
  const totalAttempts = CATEGORIES.reduce((n, c) => n + cats[c.id].attempts, 0);
  const totalPasses = CATEGORIES.reduce((n, c) => n + cats[c.id].passes, 0);
  const overall = totalAttempts ? Math.round(CATEGORIES.reduce((n, c) => n + (cats[c.id].attempts ? cats[c.id].competency : 0), 0) / CATEGORIES.filter((c) => cats[c.id].attempts).length) : 0;
  const radar = CATEGORIES.map((c) => ({ cat: c.short, score: cats[c.id].attempts ? cats[c.id].competency : 0 }));
  const bars = CATEGORIES.map((c) => ({ cat: c.short, id: c.id, passed: cats[c.id].passes, failed: cats[c.id].attempts - cats[c.id].passes }));
  const recommended: Category = weak ?? (CATEGORIES.find((c) => cats[c.id].attempts === 0)?.id ?? "phishing");

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5 py-4">
          <Badge variant="outline" className="font-mono text-primary">THREAT RANGE // ONLINE</Badge>
          <h1 className="text-4xl leading-tight font-semibold md:text-5xl">Train against the attacks <span className="text-primary">AI makes convincing.</span></h1>
          <p className="max-w-xl text-muted-foreground">Phishing, smishing, vishing, BEC and deepfakes — sandboxed simulations that adapt to you and debrief every decision.</p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/train/$category" params={{ category: recommended }}>Start recommended: {CATEGORIES.find((c) => c.id === recommended)!.short} <ArrowRight /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/matrix">View requirements matrix</Link></Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 self-center">
          <Stat label="Overall competency" value={totalAttempts ? overall : "—"} />
          <Stat label="Scenarios run" value={totalAttempts} />
          <Stat label="Pass rate" value={totalAttempts ? `${Math.round((totalPasses / totalAttempts) * 100)}%` : "—"} />
        </div>
      </section>

      {weak && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <AlertTriangle className="text-destructive" />
          <div className="flex-1"><span className="font-semibold">Weakest vector: {CATEGORIES.find((c) => c.id === weak)!.label}</span> <span className="text-muted-foreground">— competency {cats[weak].competency}/100.</span></div>
          <Button variant="destructive" asChild><Link to="/train/$category" params={{ category: weak }}>Drill it now</Link></Button>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Competency radar</h2>
          <p className="text-xs text-muted-foreground">0–100 per attack category. Dents show weak vectors.</p>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radar} outerRadius="75%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="cat" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Pass / fail breakdown</h2>
          <p className="text-xs text-muted-foreground">Accuracy tracked separately per category.</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={bars}>
                <XAxis dataKey="cat" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} stroke="var(--border)" />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} stroke="var(--border)" />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="passed" stackId="a" fill="var(--success)" />
                <Bar dataKey="failed" stackId="a" radius={[4, 4, 0, 0]}>
                  {bars.map((b) => <Cell key={b.id} fill={b.id === weak ? "var(--destructive)" : "var(--chart-2)"} fillOpacity={b.id === weak ? 1 : 0.6} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Attack categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((c) => {
            const s = cats[c.id]; const Icon = ICONS[c.id];
            return (
              <div key={c.id} className={cn("flex flex-col gap-3 rounded-xl border bg-card p-4", c.id === weak && "border-destructive/60")}>
                <div className="flex items-center justify-between"><Icon className="size-5 text-primary" /><Badge variant="secondary">Tier {s.tier}</Badge></div>
                <div className="font-semibold">{c.label}</div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Competency</span><span className="font-mono">{s.attempts ? s.competency : "—"}</span></div>
                  <Progress value={s.attempts ? s.competency : 0} />
                </div>
                <div className="text-xs text-muted-foreground">{s.passes}/{s.attempts} passed · streak {s.consecPass ? `+${s.consecPass}` : s.consecFail ? `−${s.consecFail}` : "0"}{s.hints && " · hints on"}</div>
                <Button size="sm" variant="outline" className="mt-auto" asChild><Link to="/train/$category" params={{ category: c.id }}>Train</Link></Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent debriefs</h2>
          {totalAttempts > 0 && <Button size="sm" variant="ghost" onClick={() => confirm("Reset all progress?") && reset()}><RotateCcw /> Reset progress</Button>}
        </div>
        {progress.history.length === 0 ? <p className="text-sm text-muted-foreground">No scenarios yet. Start one above.</p> : (
          <ul className="divide-y">
            {progress.history.slice(0, 8).map((h) => (
              <li key={h.at} className="flex items-center gap-3 py-2 text-sm">
                {h.passed ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}
                <span className="flex-1">{h.title}</span>
                <Badge variant="secondary">{CATEGORIES.find((c) => c.id === h.category)!.short} · T{h.tier}</Badge>
                <span className="text-xs text-muted-foreground">{h.hits.length}/{h.hits.length + h.missed.length} IoCs</span>
                <span className="w-10 text-right font-mono">{h.score}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <div className="font-mono text-3xl font-bold text-primary">{value}</div>
      <div className="mt-1 text-[11px] tracking-wide text-muted-foreground uppercase">{label}</div>
    </div>
  );
}
