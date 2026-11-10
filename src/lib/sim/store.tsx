import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { applyOutcome, initialCategoryState } from "./adaptive";
import { CATEGORIES, type Category, type CategoryState, type ScenarioResult } from "./types";

interface Progress { categories: Record<Category, CategoryState>; history: ScenarioResult[] }
const KEY = "sentinel-range-progress-v1";
const fresh = (): Progress => ({
  categories: Object.fromEntries(CATEGORIES.map((c) => [c.id, initialCategoryState()])) as Record<Category, CategoryState>,
  history: [],
});

interface Ctx {
  progress: Progress;
  ready: boolean;
  record: (r: Omit<ScenarioResult, "tierChange" | "competencyAfter" | "at">) => ScenarioResult;
  reset: () => void;
}
const ProgressCtx = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(fresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProgress({ ...fresh(), ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(progress)); }, [progress, ready]);

  const record: Ctx["record"] = useCallback((r) => {
    const { next, tierChange } = applyOutcome(progress.categories[r.category], r.passed, r.score);
    const full: ScenarioResult = { ...r, tierChange, competencyAfter: next.competency, at: Date.now() };
    setProgress((p) => ({ categories: { ...p.categories, [r.category]: next }, history: [full, ...p.history].slice(0, 100) }));
    return full;
  }, [progress]);

  const reset = useCallback(() => setProgress(fresh()), []);
  return <ProgressCtx.Provider value={{ progress, ready, record, reset }}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error("useProgress outside provider");
  return c;
}
