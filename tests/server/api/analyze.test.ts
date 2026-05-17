// @vitest-environment node
// Le handler est un thin wrapper autour de l'orchestrateur.
// On teste uniquement la validation d'entrée et la délégation.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockAnalyzeWithCache, mockReadBody } = vi.hoisted(() => {
  const mockAnalyzeWithCache = vi.fn();
  const mockReadBody         = vi.fn();

  // Globals Nitro server (pas injectés comme imports dans l'env node)
  (globalThis as Record<string, unknown>).defineEventHandler = (fn: unknown) => fn;
  (globalThis as Record<string, unknown>).readBody           = mockReadBody;
  (globalThis as Record<string, unknown>).createError        = (
    { statusCode, message }: { statusCode: number; message: string }
  ) => {
    const err      = new Error(message) as Error & { statusCode: number };
    err.statusCode = statusCode;
    return err;
  };

  return { mockAnalyzeWithCache, mockReadBody };
});

vi.mock("~/server/utils/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("~/server/services/analyzeOrchestrator", () => ({
  analyzeWithCache: mockAnalyzeWithCache,
}));

import handler from "~/server/api/analyses/index.post";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/analyses — validation", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...OLD_ENV, ANTHROPIC_API_KEY: "sk-ant-test" };
    mockReadBody.mockResolvedValue({ query: "L'immigration est massive" });
    mockAnalyzeWithCache.mockResolvedValue({ verdict: "NUANCE", score: 55, fromCache: false });
  });

  afterEach(() => { process.env = OLD_ENV; });

  it("délègue à l'orchestrateur avec la query et la clé API", async () => {
    await (handler as CallableFunction)({});
    expect(mockAnalyzeWithCache).toHaveBeenCalledWith(
      "L'immigration est massive",
      "sk-ant-test"
    );
  });

  it("lève une erreur 500 si la clé API est absente", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    await expect((handler as CallableFunction)({})).rejects.toThrow(
      "Clé API Anthropic manquante côté serveur"
    );
    expect(mockAnalyzeWithCache).not.toHaveBeenCalled();
  });

  it("lève une erreur 400 si la query est vide", async () => {
    mockReadBody.mockResolvedValue({ query: "   " });
    await expect((handler as CallableFunction)({})).rejects.toThrow(
      "Affirmation manquante"
    );
    expect(mockAnalyzeWithCache).not.toHaveBeenCalled();
  });

  it("lève une erreur 400 si le body ne contient pas de query", async () => {
    mockReadBody.mockResolvedValue({});
    await expect((handler as CallableFunction)({})).rejects.toThrow(
      "Affirmation manquante"
    );
    expect(mockAnalyzeWithCache).not.toHaveBeenCalled();
  });

  it("trim la query avant de la passer à l'orchestrateur", async () => {
    mockReadBody.mockResolvedValue({ query: "  immigration  " });
    await (handler as CallableFunction)({});
    expect(mockAnalyzeWithCache).toHaveBeenCalledWith("immigration", "sk-ant-test");
  });

  it("renvoie une erreur 502 générique si l'orchestrateur échoue", async () => {
    mockAnalyzeWithCache.mockRejectedValueOnce(new Error("Service down"));
    await expect((handler as CallableFunction)({})).rejects.toThrow(
      "Erreur lors de l'analyse. Veuillez réessayer."
    );
  });
});
