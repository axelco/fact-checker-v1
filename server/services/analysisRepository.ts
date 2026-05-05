import { prisma } from '../utils/prisma'
import type { AnalysisResult } from '~/types/analysis'

export async function findByCanonicalTopic(canonicalTopic: string) {
  return prisma.analysis.findUnique({ where: { canonicalTopic } })
}

export async function saveAnalysis(
  canonicalTopic: string,
  originalQuery:  string,
  result:         AnalysisResult,
) {
  return prisma.analysis.create({
    data: {
      canonicalTopic,
      originalQuery,
      verdict: result.verdict,
      score:   result.score,
      result:  result as object,
    },
  })
}

export async function incrementHitCount(id: string) {
  return prisma.analysis.update({
    where: { id },
    data:  { hitCount: { increment: 1 } },
  })
}
