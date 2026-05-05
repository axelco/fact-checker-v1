// @vitest-environment node
import { describe, it, expect } from "vitest";
import { parseJson } from "~/server/utils/parseJson";

describe("parseJson", () => {
  describe("JSON valide", () => {
    it("parse un JSON simple", () => {
      const input = '{"verdict":"VERIFIE","score":80}';
      expect(parseJson(input)).toEqual({ verdict: "VERIFIE", score: 80 });
    });

    it("extrait le JSON entouré de texte (réponse LLM typique)", () => {
      const input = 'Voici le résultat :\n{"verdict":"FAUX","score":10}\nMerci.';
      expect(parseJson(input)).toEqual({ verdict: "FAUX", score: 10 });
    });

    it("extrait le JSON d'un bloc markdown", () => {
      const input = '```json\n{"verdict":"NUANCE","score":55}\n```';
      expect(parseJson(input)).toEqual({ verdict: "NUANCE", score: 55 });
    });

    it("parse un objet imbriqué complet", () => {
      const input = JSON.stringify({
        affirmation_reformulee: "Test",
        verdict: "INCERTAIN",
        score: 50,
        synthese: "Résumé.",
        points_cles: [{ categorie: "Données", fait: "Un fait", source: "INSEE 2023" }],
        nuances: ["Nuance A"],
        sources_consultees: ["INSEE 2023"],
      });
      const result = parseJson(input) as Record<string, unknown>;
      expect(result.verdict).toBe("INCERTAIN");
      expect(result.score).toBe(50);
      expect(Array.isArray(result.points_cles)).toBe(true);
    });
  });

  describe("réparation automatique", () => {
    it("supprime les virgules en trop (trailing commas)", () => {
      const input = '{"verdict":"VERIFIE","score":80,}';
      expect(parseJson(input)).toEqual({ verdict: "VERIFIE", score: 80 });
    });

    it("répare une accolade imbriquée non fermée dans le texte extrait", () => {
      // Le LLM entoure le JSON de texte : extraction donne {"verdict":"NUANCE","details":{"score":55}
      // lastIndexOf('}') trouve le } de l'objet interne → s manque le } externe
      // La réparation compte open=2, close=1 et ajoute }
      const input = 'Résultat : {"verdict":"NUANCE","details":{"score":55} -- fin';
      const result = parseJson(input) as Record<string, unknown>;
      expect(result.verdict).toBe("NUANCE");
      expect((result.details as Record<string, unknown>).score).toBe(55);
    });

    it("supprime les virgules et répare simultanément", () => {
      // Trailing comma ET accolade imbriquée non fermée
      const input = 'JSON: {"v":"FAUX","d":{"x":1,} texte après';
      const result = parseJson(input) as Record<string, unknown>;
      expect(result.v).toBe("FAUX");
    });
  });

  describe("cas d'erreur", () => {
    it("lève une erreur si aucun JSON n'est trouvé", () => {
      expect(() => parseJson("Aucune donnée structurée ici.")).toThrow(
        "Aucun JSON trouvé dans la réponse"
      );
    });

    it("lève une erreur sur une chaîne vide", () => {
      expect(() => parseJson("")).toThrow("Aucun JSON trouvé dans la réponse");
    });

    it("lève une erreur si le JSON est irréparable", () => {
      // { sans } correspondant = pas de } trouvé du tout
      expect(() => parseJson("{ clé sans valeur ni fermeture")).toThrow();
    });
  });
});
