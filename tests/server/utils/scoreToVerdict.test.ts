// @vitest-environment node
import { describe, it, expect } from "vitest";
import { scoreToVerdict } from "~/server/utils/scoreToVerdict";

describe("scoreToVerdict", () => {
  describe("bornes exactes", () => {
    it("score 0  → FAUX",      () => expect(scoreToVerdict(0)).toBe("FAUX"))
    it("score 10 → FAUX",      () => expect(scoreToVerdict(10)).toBe("FAUX"))
    it("score 11 → TROMPEUR",  () => expect(scoreToVerdict(11)).toBe("TROMPEUR"))
    it("score 35 → TROMPEUR",  () => expect(scoreToVerdict(35)).toBe("TROMPEUR"))
    it("score 36 → INCERTAIN", () => expect(scoreToVerdict(36)).toBe("INCERTAIN"))
    it("score 50 → INCERTAIN", () => expect(scoreToVerdict(50)).toBe("INCERTAIN"))
    it("score 51 → NUANCE",    () => expect(scoreToVerdict(51)).toBe("NUANCE"))
    it("score 89 → NUANCE",    () => expect(scoreToVerdict(89)).toBe("NUANCE"))
    it("score 90 → VERIFIE",   () => expect(scoreToVerdict(90)).toBe("VERIFIE"))
    it("score 100 → VERIFIE",  () => expect(scoreToVerdict(100)).toBe("VERIFIE"))
  })

  describe("valeurs médianes", () => {
    it("score 5  → FAUX",      () => expect(scoreToVerdict(5)).toBe("FAUX"))
    it("score 20 → TROMPEUR",  () => expect(scoreToVerdict(20)).toBe("TROMPEUR"))
    it("score 43 → INCERTAIN", () => expect(scoreToVerdict(43)).toBe("INCERTAIN"))
    it("score 65 → NUANCE",    () => expect(scoreToVerdict(65)).toBe("NUANCE"))
    it("score 95 → VERIFIE",   () => expect(scoreToVerdict(95)).toBe("VERIFIE"))
  })
})
