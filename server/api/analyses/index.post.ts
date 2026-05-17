import { analyzeWithCache } from '../../services/analyzeOrchestrator'
import { checkRateLimit }   from '../../utils/rateLimiter'
import { logger }           from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const ip        = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const rateLimit = checkRateLimit(ip)
  if (!rateLimit.ok) {
    setResponseHeader(event, 'Retry-After', rateLimit.retryAfter)
    logger.warn('Rate limit dépassé', { handler: 'analyses', ip })
    throw createError({ statusCode: 429, message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    logger.error('Clé API Anthropic manquante', { handler: 'analyses' })
    throw createError({ statusCode: 500, message: 'Clé API Anthropic manquante côté serveur' })
  }

  const body = await readBody<{ query: string }>(event)
  if (!body?.query?.trim()) {
    logger.warn('Requête reçue sans affirmation', { handler: 'analyses', body })
    throw createError({ statusCode: 400, message: 'Affirmation manquante' })
  }

  try {
    return await analyzeWithCache(body.query.trim(), apiKey)
  } catch (err) {
    logger.error('Erreur lors de l\'analyse', {
      handler: 'analyses',
      query:   body.query.trim(),
      error:   err instanceof Error ? err.message : String(err),
    })
    throw createError({ statusCode: 502, message: 'Erreur lors de l\'analyse. Veuillez réessayer.' })
  }
})
