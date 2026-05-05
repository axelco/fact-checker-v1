import Anthropic from '@anthropic-ai/sdk'
import { parseJson } from '../utils/parseJson'
import { logger } from '../utils/logger'
import type { AnalysisResult } from '~/types/analysis'

const SYSTEM_PROMPT = `Tu es un expert en fact-checking, statistiques et données publiques.
L'utilisateur soumet une affirmation. Tu dois :
1. Utiliser web_search pour trouver données chiffrées, tendances, comparaisons internationales.
2. Faire plusieurs recherches : données historiques (10-20 ans), comparaisons pays, chiffres officiels (INSEE, Eurostat, ONU, OCDE).
3. Inclure l'année dans chaque source.
4. Retourner UNIQUEMENT un JSON valide sans markdown :
{
  "affirmation_reformulee": "Reformulation neutre",
  "verdict": "NUANCE",
  "score": 45,
  "synthese": "3-4 phrases résumant la réalité factuelle",
  "points_cles": [
    { "categorie": "Tendance historique", "fait": "Description précise", "chiffre": "320 000", "unite": "entrées/an", "source": "INSEE 2023" }
  ],
  "contexte_comparatif": "Comparaison 2-3 phrases",
  "nuances": ["Nuance 1", "Nuance 2", "Nuance 3"],
  "ce_que_dit_vraiment_la_data": "Conclusion honnête",
  "sources_consultees": ["INSEE 2023", "Eurostat 2022"]
}
Verdicts : VERIFIE, NUANCE, INCERTAIN, TROMPEUSE, FAUX. Score 0-100. Max 4 points_cles.`

export async function analyzeQuery(query: string, apiKey: string): Promise<AnalysisResult> {
  const client = new Anthropic({ apiKey })

  let text: string
  try {
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system:     [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }] as never,
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }] as never,
      messages:   [{
        role:    'user',
        content: `Affirmation à vérifier : "${query}"\n\nRecherche données chiffrées, évolution historique et comparaisons. Inclure l'année dans chaque source. Retourner uniquement le JSON.`,
      }],
    })

    text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')
  } catch (err) {
    logger.error('Erreur API Anthropic', {
      service: 'analyzeService',
      query,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }

  try {
    return parseJson(text) as AnalysisResult
  } catch (err) {
    logger.error('Échec du parsing JSON de la réponse Anthropic', {
      service:  'analyzeService',
      query,
      rawText:  text.slice(0, 300),
      error:    err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}
