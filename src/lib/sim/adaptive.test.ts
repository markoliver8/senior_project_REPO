import { describe, expect, it } from "vitest";
import { applyOutcome, initialCategoryState, selectScenario } from "./adaptive";
import { SCENARIOS } from "./scenarios";

describe("adaptive progression", () => {
  it("promotes one tier after exactly 3 consecutive passes", () => {
    let s = initialCategoryState();
    s = applyOutcome(s, true, 90).next;
    s = applyOutcome(s, true, 90).next;
    expect(s.tier).toBe(1);
    const r = applyOutcome(s, true, 90);
    expect(r.next.tier).toBe(2);
    expect(r.tierChange).toBe(1);
  });

  it("drops one tier and enables hints after exactly 2 consecutive fails", () => {
    let s = { ...initialCategoryState(), tier: 3 as const };
    s = applyOutcome(s, false, 10).next;
    expect(s.tier).toBe(3);
    expect(s.hints).toBe(false);
    const r = applyOutcome(s, false, 10);
    expect(r.next.tier).toBe(2);
    expect(r.next.hints).toBe(true);
    expect(r.tierChange).toBe(-1);
  });

  it("a pass resets the fail streak", () => {
    let s = { ...initialCategoryState(), tier: 2 as const };
    s = applyOutcome(s, false, 10).next;
    s = applyOutcome(s, true, 80).next;
    s = applyOutcome(s, false, 10).next;
    expect(s.tier).toBe(2);
  });

  it("keeps competency within 0-100", () => {
    const r = applyOutcome(initialCategoryState(), true, 100);
    expect(r.next.competency).toBe(100);
  });

  it("serves a scenario at the current tier", () => {
    expect(selectScenario(SCENARIOS, "phishing", 3, []).tier).toBe(3);
    expect(selectScenario(SCENARIOS, "vishing", 1, []).tier).toBe(1);
  });
});
