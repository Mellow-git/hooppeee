import type { Band, LedgerRow, Polarity, Tier } from "../types";

export type BandInput = Pick<LedgerRow, "tier" | "polarity" | "independence_class">;

const TIER_TO_BAND: Record<1 | 2 | 3, Band> = {
  1: "high",
  2: "moderate",
  3: "exploratory",
};

/** Strongest supporting tier; contested if equal-or-stronger contradiction exists. */
export function band(rows: BandInput[]): Band {
  const sup = rows.filter((r) => r.polarity === "supporting");
  const con = rows.filter((r) => r.polarity === "contradicting");
  if (!sup.length) return "none";
  const top = Math.min(...sup.map((r) => r.tier)) as Tier;
  if (con.some((c) => c.tier <= top)) return "contested";
  return TIER_TO_BAND[top];
}

/** Distinct supporting independence classes. Never merged into the band. */
export function corroboration(rows: BandInput[]): number {
  return new Set(rows.filter((r) => r.polarity === "supporting").map((r) => r.independence_class))
    .size;
}

export function explainBand(rows: BandInput[]): string[] {
  const sup = rows.filter((r) => r.polarity === "supporting");
  const con = rows.filter((r) => r.polarity === "contradicting");
  if (!sup.length) {
    return ["No supporting rows, so band = NONE."];
  }
  const top = Math.min(...sup.map((r) => r.tier));
  const steps = [`Strongest supporting tier: ${top}.`];
  const blocking = con.filter((c) => c.tier <= top);
  if (blocking.length) {
    const t = Math.min(...blocking.map((c) => c.tier));
    steps.push(
      `Contradicting row at tier ${t} is equal or stronger, so band = CONTESTED.`,
    );
    return steps;
  }
  const label = TIER_TO_BAND[top as 1 | 2 | 3].toUpperCase();
  steps.push(`No contradicting row at equal or stronger tier, so band = ${label}.`);
  return steps;
}

export function bandLabel(value: Band): string {
  return value.toUpperCase();
}

export function polarityLabel(value: Polarity): string {
  return value === "contradicting" ? "contradicts" : "supporting";
}
