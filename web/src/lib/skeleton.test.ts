import { describe, expect, it } from "vitest";
import { skeleton } from "./skeleton";

describe("skeleton", () => {
  it("maps Cyrillic ѕ to Latin s", () => {
    expect(skeleton("\u0455")).toBe("s");
  });

  it("collides homoglyph handle with Latin handle", () => {
    expect(skeleton("\u0455hadowl3dger")).toBe(skeleton("shadowl3dger"));
    expect(skeleton("\u0455hadowl3dger")).toBe("shadowl3dger");
  });
});
