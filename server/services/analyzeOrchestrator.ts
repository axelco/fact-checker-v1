import { analyzeQuery } from './analyzeService'
import { getCanonicalTopic } from './canonicalService'
import { findByCanonicalTopic, saveAnalysis, incrementHitCount } from './analysisRepository'
import { logger } from '../utils/logger'
import type { AnalysisResult, ApiAnalyzeResponse } from '~/types/analysis'

export async function analyzeWithCache(query: string, apiKey: string): Promise<ApiAnalyzeResponse> {
  const canonicalTopic = await getCanonicalTopic(query, apiKey)

  const cached = await findByCanonicalTopic(canonicalTopic)
  if (cached) {
    logger.info('Cache hit', { service: 'analyzeOrchestrator', canonicalTopic, id: cached.id })
    await incrementHitCount(cached.id)
    return { ...(cached.result as object), fromCache: true, id: cached.id } as ApiAnalyzeResponse
  }

  logger.info('Cache miss — appel Claude Sonnet', { service: 'analyzeOrchestrator', canonicalTopic })
  const result = await analyzeQuery(query, apiKey)

  try {
    const saved = await saveAnalysis(canonicalTopic, query, result)
    return { ...result, fromCache: false, id: saved.id }
  } catch (err) {
    logger.error('Échec de la sauvegarde en base', {
      service: 'analyzeOrchestrator',
      canonicalTopic,
      error: err instanceof Error ? err.message : String(err),
    })
  }

  return { ...result, fromCache: false }
}
