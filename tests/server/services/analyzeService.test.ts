// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Anthropic avant tout import ─────────────────────────────────────────
// Vitest v4 : le constructeur mocké doit être une vraie function (pas arrow)
// pour être utilisable avec `new Anthropic(...)`.

const mockCreate = vi.hoisted(() => vi.fn());

vi.mock("~/server/utils/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(function (this: { messages: unknown }) {
    this.messages = { create: mockCreate };
  }),
}));

import { analyzeQuery } from "~/server/services/analyzeService";

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_RESULT = {
  affirmation_reformulee: "Test reformulé",
  verdict:  "NUANCE",
  score:    55,
  synthese: "Synthèse factuelle.",
  points_cles: [{ categorie: "Données", fait: "Un fait", source: "INSEE 2023" }],
  nuances: ["Nuance A"],
  sources_consultees: ["INSEE 2023"],
};

function mockAnthropicText(json: unknown) {
  mockCreate.mockResolvedValueOnce({
    content: [{ type: "text", text: JSON.stringify(json) }],
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("analyzeQuery", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("appels Anthropic", () => {
    it("utilise le bon modèle", async () => {
      mockAnthropicText(VALID_RESULT);
      await analyzeQuery("Test", "sk-ant-test");
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: "claude-sonnet-4-6" })
      );
    });

    it("inclut l'outil web_search", async () => {
      mockAnthropicText(VALID_RESULT);
      await analyzeQuery("Test", "sk-ant-test");
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: expect.arrayContaining([
            expect.objectContaining({ name: "web_search" }),
          ]),
        })
      );
    });

    it("inclut la query dans le message utilisateur", async () => {
      mockAnthropicText(VALID_RESULT);
      await analyzeQuery("L'immigration est massive", "sk-ant-test");
      const call = mockCreate.mock.calls[0][0];
      expect(call.messages[0].content).toContain("L'immigration est massive");
    });
  });

  describe("traitement de la réponse", () => {
    it("retourne le résultat parsé correctement", async () => {
      mockAnthropicText(VALID_RESULT);
      const result = await analyzeQuery("Test", "sk-ant-test");
      expect(result).toMatchObject({ verdict: "NUANCE", score: 55 });
    });

    it("ignore les blocs tool_use et concatène les blocs texte", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [
          { type: "tool_use", id: "x", name: "web_search", input: {} },
          { type: "text", text: '{"verdict":"VERIFIE","score":90,' },
          { type: "text", text: '"synthese":"OK","points_cles":[],"affirmation_reformulee":"R"}' },
        ],
      });
      const result = await analyzeQuery("Test", "sk-ant-test");
      expect(result.verdict).toBe("VERIFIE");
      expect(result.score).toBe(90);
    });

    it("gère un JSON entouré de texte (réponse LLM typique)", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: `Voici le résultat : ${JSON.stringify(VALID_RESULT)} fin.` }],
      });
      const result = await analyzeQuery("Test", "sk-ant-test");
      expect(result.verdict).toBe("NUANCE");
    });
  });

  describe("propagation d'erreurs", () => {
    it("propage l'erreur si Anthropic échoue", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Anthropic rate limit"));
      await expect(analyzeQuery("Test", "sk-ant-test")).rejects.toThrow(
        "Anthropic rate limit"
      );
    });

    it("propage l'erreur si la réponse ne contient pas de JSON", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Je n'ai pas de données à ce sujet." }],
      });
      await expect(analyzeQuery("Test", "sk-ant-test")).rejects.toThrow(
        "Aucun JSON trouvé dans la réponse"
      );
    });
  });
});
