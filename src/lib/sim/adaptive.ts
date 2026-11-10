import type { Action, Category, CategoryState, Scenario, Tier } from "./types";

export const PROMOTE_AFTER = 3;
export const DEMOTE_AFTER = 2;

export const initialCategoryState = (): CategoryState => ({
  tier: 1, consecPass: 0, consecFail: 0, attempts: 0, passes: 0, competency: 50, hints: false,
});

export function scoreScenario(s: Scenario, action: Action, flagged: string[]) {
  const ids = new Set(s.iocs.map((i) => i.id));
  const hits = s.iocs.filter((i) => flagged.includes(i.id)).map((i) => i.id);
  const missed = s.iocs.filter((i) => !flagged.includes(i.id)).map((i) => i.id);
  const falseFlags = flagged.filter((f) => !ids.has(f)).length;
  const correct = action === s.correctAction;
  const acceptable = !correct && (s.acceptable ?? []).includes(action);
  const passed = correct || acceptable;
  const actionPts = correct ? 60 : acceptable ? 40 : 0;
  const iocPts = s.iocs.length ? Math.round((40 * hits.length) / s.iocs.length) : 40;
  const score = Math.max(0, Math.min(100, actionPts + iocPts - falseFlags * 5));
  return { passed, score, hits, missed, falseFlags };
}

/** Applies one scenario outcome to a category: competency + tier rules (R23, R25, R26). */
export function applyOutcome(prev: CategoryState, passed: boolean, score: number) {
  const next: CategoryState = { ...prev, attempts: prev.attempts + 1 };
  next.competency =
    prev.attempts === 0 ? score : Math.round(prev.competency * 0.6 + score * 0.4);
  let tierChange: -1 | 0 | 1 = 0;
  if (passed) {
    next.passes = prev.passes + 1;
    next.consecPass = prev.consecPass + 1;
    next.consecFail = 0;
    if (next.consecPass >= PROMOTE_AFTER) {
      if (prev.tier < 3) { next.tier = (prev.tier + 1) as Tier; tierChange = 1; }
      next.consecPass = 0;
      next.hints = false;
    }
  } else {
    next.consecFail = prev.consecFail + 1;
    next.consecPass = 0;
    if (next.consecFail >= DEMOTE_AFTER) {
      if (prev.tier > 1) { next.tier = (prev.tier - 1) as Tier; tierChange = -1; }
      next.consecFail = 0;
      next.hints = true;
    }
  }
  return { next, tierChange };
}

/** Serves a scenario matching the learner's current tier, preferring unseen ones (R24). */
export function selectScenario(
  all: Scenario[], category: Category, tier: Tier, seen: string[], excludeId?: string,
): Scenario {
  const pool = all.filter((s) => s.category === category && s.id !== excludeId);
  const byDistance = [...pool].sort((a, b) => {
    const d = Math.abs(a.tier - tier) - Math.abs(b.tier - tier);
    if (d !== 0) return d;
    return Number(seen.includes(a.id)) - Number(seen.includes(b.id));
  });
  return byDistance[0] ?? all.find((s) => s.category === category)!;
}

export function weakestCategory(states: Record<Category, CategoryState>): Category | null {
  const tried = (Object.keys(states) as Category[]).filter((c) => states[c].attempts > 0);
  if (!tried.length) return null;
  return tried.reduce((a, b) => (states[b].competency < states[a].competency ? b : a));
}
