import { analyzeWithCache } from '../services/analyzeOrchestrator'
import { logger } from '../utils/logger'

export default defineEventHandler(async (event) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    logger.error('Clé API Anthropic manquante', { handler: 'analyze' })
    throw createError({ statusCode: 500, message: 'Clé API Anthropic manquante côté serveur' })
  }

  const body = await readBody<{ query: string }>(event)
  if (!body?.query?.trim()) {
    logger.warn('Requête reçue sans affirmation', { handler: 'analyze', body })
    throw createError({ statusCode: 400, message: 'Affirmation manquante' })
  }

  try {
    return await analyzeWithCache(body.query.trim(), apiKey)
  } catch (err) {
    logger.error('Erreur lors de l\'analyse', {
      handler: 'analyze',
      query:   body.query.trim(),
      error:   err instanceof Error ? err.message : String(err),
    })
    throw createError({ statusCode: 502, message: 'Erreur lors de l\'analyse. Veuillez réessayer.' })
  }
})
