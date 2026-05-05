// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock Logtail avant tout import ────────────────────────────────────────────

const mockLogtailError = vi.fn();
const mockLogtailWarn  = vi.fn();
const mockLogtailInfo  = vi.fn();

vi.mock("@logtail/node", () => ({
  Logtail: vi.fn(function (this: unknown) {
    Object.assign(this as object, {
      error: mockLogtailError,
      warn:  mockLogtailWarn,
      info:  mockLogtailInfo,
    });
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const OLD_ENV = process.env;

async function importFreshLogger() {
  // Invalide le cache du module pour récupérer une instance fraîche
  vi.resetModules();
  const { logger } = await import("~/server/utils/logger");
  return logger;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = OLD_ENV;
    vi.restoreAllMocks();
  });

  describe("sans token Betterstack (dev local)", () => {
    it("écrit dans console.error mais n'appelle pas Logtail", async () => {
      process.env = { ...OLD_ENV, BETTERSTACK_SOURCE_TOKEN: "" };
      const logger = await importFreshLogger();

      logger.error("Une erreur", { ctx: "test" });

      expect(console.error).toHaveBeenCalledWith("[ERROR]", "Une erreur", { ctx: "test" });
      expect(mockLogtailError).not.toHaveBeenCalled();
    });

    it("écrit dans console.warn mais n'appelle pas Logtail", async () => {
      process.env = { ...OLD_ENV, BETTERSTACK_SOURCE_TOKEN: "" };
      const logger = await importFreshLogger();

      logger.warn("Un avertissement");

      expect(console.warn).toHaveBeenCalledWith("[WARN]", "Un avertissement", "");
      expect(mockLogtailWarn).not.toHaveBeenCalled();
    });

    it("écrit dans console.info mais n'appelle pas Logtail", async () => {
      process.env = { ...OLD_ENV, BETTERSTACK_SOURCE_TOKEN: "" };
      const logger = await importFreshLogger();

      logger.info("Info");

      expect(console.info).toHaveBeenCalled();
      expect(mockLogtailInfo).not.toHaveBeenCalled();
    });
  });

  describe("avec token Betterstack (UAT / prod)", () => {
    it("appelle Logtail.error ET console.error", async () => {
      process.env = { ...OLD_ENV, BETTERSTACK_SOURCE_TOKEN: "tok-test" };
      const logger = await importFreshLogger();

      logger.error("Erreur grave", { code: 500 });

      expect(console.error).toHaveBeenCalledWith("[ERROR]", "Erreur grave", { code: 500 });
      expect(mockLogtailError).toHaveBeenCalledWith("Erreur grave", { code: 500 });
    });

    it("appelle Logtail.warn ET console.warn", async () => {
      process.env = { ...OLD_ENV, BETTERSTACK_SOURCE_TOKEN: "tok-test" };
      const logger = await importFreshLogger();

      logger.warn("Attention");

      expect(console.warn).toHaveBeenCalled();
      expect(mockLogtailWarn).toHaveBeenCalledWith("Attention", undefined);
    });

    it("appelle Logtail.info ET console.info", async () => {
      process.env = { ...OLD_ENV, BETTERSTACK_SOURCE_TOKEN: "tok-test" };
      const logger = await importFreshLogger();

      logger.info("Démarrage", { env: "uat" });

      expect(console.info).toHaveBeenCalled();
      expect(mockLogtailInfo).toHaveBeenCalledWith("Démarrage", { env: "uat" });
    });
  });
});
