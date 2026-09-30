import { describe, expect, it } from "vitest";
import actors from "../data/actors.json";
import { band, corroboration } from "./band";
import type { Actor } from "../types";

const seeded = actors as Actor[];

const expectedBand: Record<string, ReturnType<typeof band>> = {
  "ACT-0417": "high",
  "ACT-0233": "contested",
  "ACT-0102": "moderate",
  "ACT-0581": "exploratory",
  "ACT-0066": "moderate",
};

describe("seeded actor bands", () => {
  it("displayed band equals band(rows) for every seeded actor", () => {
    for (const actor of seeded) {
      expect(band(actor.ledger), actor.id).toBe(expectedBand[actor.id]);
    }
  });

  it("ShadowLedger is high with six independent supporting classes", () => {
    const hero = seeded.find((a) => a.id === "ACT-0417");
    expect(hero).toBeTruthy();
    expect(band(hero!.ledger)).toBe("high");
    expect(corroboration(hero!.ledger)).toBe(6);
  });
});
