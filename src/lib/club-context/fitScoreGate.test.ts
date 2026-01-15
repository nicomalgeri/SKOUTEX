import { describe, expect, it } from "vitest";
import { getFitScoreGate } from "./fitScoreGate";
import { clubContextDefaults } from "../club/context";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildCompleteContext() {
  const context = clone(clubContextDefaults);
  context.club_id = "club-1";
  context.updated_at = "2026-01-15T00:00:00.000Z";
  context.identity.club_name = "SKOUTEX FC";
  context.identity.league = "La Liga";
  context.identity.tier = "top_flight";
  context.finances.transfer_budget_eur = 5000000;
  context.finances.wage_budget_weekly_eur = 200000;
  context.playing_style.formation_primary = "4-3-3";
  context.playing_style.style = "balanced";
  context.recruitment.priority_positions = ["RB"];
  context.recruitment.age_preference = { min: 18, max: 28, ideal: 23 };
  context.squad.foreign_player_limit = 10;
  context.strategy.season_objective = "top_half";
  context.strategy.risk_appetite = "moderate";
  return context;
}

describe("getFitScoreGate", () => {
  it("unlocks with a complete context", () => {
    const gate = getFitScoreGate(buildCompleteContext());
    expect(gate.unlocked).toBe(true);
    expect(gate.missing_required_fields).toEqual([]);
    expect(gate.blocking_missing_fields).toEqual([]);
  });

  it("locks when required fields are missing", () => {
    const context = buildCompleteContext();
    context.identity.club_name = "";
    context.playing_style.style = "";
    const gate = getFitScoreGate(context);
    expect(gate.unlocked).toBe(false);
    expect(gate.missing_required_fields).toContain("identity.club_name");
    expect(gate.missing_required_fields).toContain("playing_style.style");
  });

  it("locks when transfer budget is zero", () => {
    const context = buildCompleteContext();
    context.finances.transfer_budget_eur = 0;
    const gate = getFitScoreGate(context);
    expect(gate.unlocked).toBe(false);
    expect(gate.blocking_missing_fields).toContain("finances.transfer_budget_eur");
  });

  it("locks when age preference ideal is missing", () => {
    const context = buildCompleteContext() as Record<string, unknown>;
    const recruitment = context.recruitment as Record<string, unknown>;
    const agePreference = recruitment.age_preference as Record<string, unknown>;
    delete agePreference.ideal;
    recruitment.age_preference = agePreference;
    context.recruitment = recruitment;

    const gate = getFitScoreGate(context);
    expect(gate.unlocked).toBe(false);
    expect(gate.missing_required_fields).toContain(
      "recruitment.age_preference.ideal"
    );
  });
});
