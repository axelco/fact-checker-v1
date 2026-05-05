import { analyzeQuery } from './analyzeService'
import { getCanonicalTopic } from './canonicalService'
import { findByCanonicalTopic, saveAnalysis, incrementHitCount } from './analysisRepository'
import { logger } from '../utils/logger'
import type { AnalysisResult } from '~/types/analysis'

export type OrchestratorResult = AnalysisResult & { fromCache: boolean }

export async function analyzeWithCache(query: string, apiKey: string): Promise<OrchestratorResult> {
  const canonicalTopic = await getCanonicalTopic(query, apiKey)

  const cached = await findByCanonicalTopic(canonicalTopic)
  if (cached) {
    logger.info('Cache hit', { service: 'analyzeOrchestrator', canonicalTopic, id: cached.id })
    await incrementHitCount(cached.id)
    return { ...(cached.result as object), fromCache: true } as OrchestratorResult
  }

  logger.info('Cache miss — appel Claude Sonnet', { service: 'analyzeOrchestrator', canonicalTopic })
  const result = await analyzeQuery(query, apiKey)

  try {
    await saveAnalysis(canonicalTopic, query, result)
  } catch (err) {
    logger.error('Échec de la sauvegarde en base', {
      service: 'analyzeOrchestrator',
      canonicalTopic,
      error: err instanceof Error ? err.message : String(err),
    })
  }

  return { ...result, fromCache: false }
}
