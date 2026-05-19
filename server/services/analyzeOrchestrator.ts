import { analyzeQuery } from './analyzeService'
import { getCanonicalTopic } from './canonicalService'
import { findByCanonicalTopic, saveAnalysis, incrementHitCount } from './analysisRepository'
import { checkAndIncrementQuota, getQuotaRemaining, DAILY_LIMIT } from './quotaRepository'
import { logger } from '../utils/logger'
import type { ApiAnalyzeResponse } from '~/types/analysis'

export async function analyzeWithCache(query: string, apiKey: string, ip: string): Promise<ApiAnalyzeResponse> {
  const canonicalTopic = await getCanonicalTopic(query, apiKey)

  // Cache hit — quota non consommé
  const cached = await findByCanonicalTopic(canonicalTopic)
  if (cached) {
    logger.info('Cache hit', { service: 'analyzeOrchestrator', canonicalTopic, id: cached.id })
    await incrementHitCount(cached.id)
    const remaining = await getQuotaRemaining(ip)
    return {
      ...(cached.result as object),
      fromCache: true,
      id:        cached.id,
      quota:     { remaining, total: DAILY_LIMIT, consumed: false },
    } as ApiAnalyzeResponse
  }

  // Cache miss — vérifier et incrémenter le quota avant d'appeler Claude
  // Lève QuotaExceededError si la limite est atteinte (propagée au handler)
  logger.info('Cache miss — appel Claude Sonnet', { service: 'analyzeOrchestrator', canonicalTopic })
  const remaining = await checkAndIncrementQuota(ip)

  const result = await analyzeQuery(query, apiKey)

  try {
    const saved = await saveAnalysis(canonicalTopic, query, result)
    return { ...result, fromCache: false, id: saved.id, quota: { remaining, total: DAILY_LIMIT, consumed: true } }
  } catch (err) {
    logger.error('Échec de la sauvegarde en base', {
      service: 'analyzeOrchestrator',
      canonicalTopic,
      error: err instanceof Error ? err.message : String(err),
    })
  }

  return { ...result, fromCache: false, quota: { remaining, total: DAILY_LIMIT, consumed: true } }
}
