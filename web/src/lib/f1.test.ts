import { describe, expect, it } from "vitest";
import { f1 } from "./f1";

describe("f1", () => {
  it("is always 2PR/(P+R)", () => {
    expect(f1(1, 1)).toBe(1);
    expect(f1(0.5, 0.5)).toBe(0.5);
    expect(f1(0, 1)).toBe(0);
  });

  it("wallet_cio literature prior 0.36/0.44 is about 0.396", () => {
    const value = f1(0.36, 0.44);
    expect(value).toBeCloseTo(0.396, 3);
  });
});
