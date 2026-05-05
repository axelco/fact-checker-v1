import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../utils/logger'

const SYSTEM_PROMPT = `Tu reçois une affirmation soumise par un utilisateur.
Retourne UNIQUEMENT un sujet canonique court (3-6 mots en minuscules, sans ponctuation) qui représente le sujet factuel central de cette affirmation.
Exemples :
- "L'immigration en France est massive" → "immigration france volume"
- "La délinquance a explosé ces dernières années" → "délinquance france évolution"
- "Les vaccins causent l'autisme" → "vaccins autisme lien causal"
Ne retourne que le sujet canonique, rien d'autre.`

export async function getCanonicalTopic(query: string, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 50,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: query }],
    })

    const topic = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim()
      .toLowerCase()

    logger.info('Canonical topic extrait', { service: 'canonicalService', query, canonicalTopic: topic })
    return topic
  } catch (err) {
    logger.error('Erreur extraction canonical topic', {
      service: 'canonicalService',
      query,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}
