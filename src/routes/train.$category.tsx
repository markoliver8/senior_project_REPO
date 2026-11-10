import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScenarioRunner } from "@/components/sim/ScenarioRunner";
import { SCENARIOS } from "@/lib/sim/scenarios";
import { selectScenario } from "@/lib/sim/adaptive";
import { useProgress } from "@/lib/sim/store";
import { CATEGORIES, type Category, type Scenario } from "@/lib/sim/types";

export const Route = createFileRoute("/train/$category")({
  beforeLoad: ({ params }) => { if (!CATEGORIES.some((c) => c.id === params.category)) throw notFound(); },
  head: ({ params }) => {
    const label = CATEGORIES.find((c) => c.id === params.category)?.label ?? "Training";
    return {
      meta: [
        { title: `${label} training — Sentinel Range` },
        { name: "description", content: `Adaptive ${label.toLowerCase()} simulation with live debrief.` },
        { property: "og:title", content: `${label} training — Sentinel Range` },
        { property: "og:description", content: `Practice spotting ${label.toLowerCase()} attacks in a safe simulation.` },
      ],
    };
  },
  component: Train,
});

function Train() {
  const { category } = Route.useParams() as { category: Category };
  const { progress, ready } = useProgress();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [run, setRun] = useState(0);
  const seen = progress.history.map((h) => h.scenarioId);
  const cs = progress.categories[category];

  useEffect(() => {
    if (!ready) return;
    setScenario(selectScenario(SCENARIOS, category, cs.tier, seen));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, category]);

  if (!scenario) return <div className="py-20 text-center text-muted-foreground">Preparing scenario…</div>;
  return (
    <ScenarioRunner
      key={`${scenario.id}-${run}`}
      scenario={scenario}
      showHints={cs.hints}
      onNext={() => { setScenario(selectScenario(SCENARIOS, category, cs.tier, seen, scenario.id)); setRun((r) => r + 1); window.scrollTo(0, 0); }}
    />
  );
}
