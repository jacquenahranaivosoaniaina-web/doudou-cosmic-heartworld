import { describe, expect, it } from "vitest";

import { COUNTDOWN_START, isSecretCode, PLANETS } from "@/lib/universe";

describe("secret code", () => {
  it("accepts DOUDOU regardless of case and surrounding spaces", () => {
    expect(isSecretCode("DOUDOU")).toBe(true);
    expect(isSecretCode("  doudou ")).toBe(true);
  });

  it("rejects any other code", () => {
    expect(isSecretCode("")).toBe(false);
    expect(isSecretCode("DOUDO")).toBe(false);
    expect(isSecretCode("DOUDOU2")).toBe(false);
  });
});

describe("universe content", () => {
  it("has the five planets in story order", () => {
    expect(PLANETS.map((p) => p.name)).toEqual([
      "Notre rencontre",
      "Nos souvenirs",
      "Notre petit monde",
      "Notre avenir",
      "Mon univers",
    ]);
  });

  it("starts the final countdown at 5", () => {
    expect(COUNTDOWN_START).toBe(5);
  });
});
