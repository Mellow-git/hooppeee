import { describe, expect, it } from "vitest";
import { band, corroboration } from "./band";
import type { BandInput } from "./band";

function row(
  tier: 1 | 2 | 3,
  polarity: "supporting" | "contradicting",
  independence_class: string,
): BandInput {
  return { tier, polarity, independence_class };
}

describe("band", () => {
  it("is none with no rows", () => {
    expect(band([])).toBe("none");
  });

  it("is none with only contradicting rows", () => {
    expect(band([row(1, "contradicting", "pgp")])).toBe("none");
  });

  it("maps tier 1/2/3 to high/moderate/exploratory", () => {
    expect(band([row(1, "supporting", "tls")])).toBe("high");
    expect(band([row(2, "supporting", "wallet")])).toBe("moderate");
    expect(band([row(3, "supporting", "stylometry")])).toBe("exploratory");
  });

  it("uses strongest supporting tier", () => {
    expect(
      band([
        row(3, "supporting", "stylometry"),
        row(2, "supporting", "wallet"),
        row(1, "supporting", "tls"),
      ]),
    ).toBe("high");
  });

  it("is contested when contradiction equals top supporting tier", () => {
    expect(
      band([row(2, "supporting", "wallet"), row(2, "contradicting", "pgp")]),
    ).toBe("contested");
  });

  it("is contested when contradiction is stronger than top supporting tier", () => {
    expect(
      band([row(3, "supporting", "stylometry"), row(1, "contradicting", "pgp")]),
    ).toBe("contested");
  });

  it("is not contested when contradiction is weaker than top supporting tier", () => {
    expect(
      band([row(1, "supporting", "tls"), row(3, "contradicting", "behaviour")]),
    ).toBe("high");
  });
});

describe("corroboration", () => {
  it("counts distinct supporting classes and ignores contradicting rows", () => {
    expect(
      corroboration([
        row(1, "supporting", "tls"),
        row(1, "supporting", "tls"),
        row(2, "supporting", "webapp_stack"),
        row(2, "contradicting", "handle"),
        row(1, "contradicting", "custom_asset"),
      ]),
    ).toBe(2);
  });

  it("is zero without support", () => {
    expect(corroboration([row(2, "contradicting", "pgp")])).toBe(0);
  });
});
