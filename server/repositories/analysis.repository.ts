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
      score:  result.score,
      result: result as object,
    },
  })
}

export async function incrementHitCount(id: string) {
  return prisma.analysis.update({
    where: { id },
    data:  { hitCount: { increment: 1 } },
  })
}

export async function findById(id: string) {
  return prisma.analysis.findUnique({ where: { id } })
}

export async function findPaginated(opts: {
  page:  number
  limit: number
  sort:  'recent' | 'popular'
}) {
  const orderBy = opts.sort === 'popular'
    ? { hitCount: 'desc' as const }
    : { updatedAt: 'desc' as const }

  const [items, total] = await Promise.all([
    prisma.analysis.findMany({
      orderBy,
      skip:   (opts.page - 1) * opts.limit,
      take:   opts.limit,
      select: {
        id:            true,
        originalQuery: true,
        score:         true,
        hitCount:      true,
        createdAt:     true,
        updatedAt:     true,
      },
    }),
    prisma.analysis.count(),
  ])

  return { items, total, page: opts.page, totalPages: Math.ceil(total / opts.limit) }
}
