import { findById } from '../../services/analysisRepository'
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID manquant' })
  }

  const record = await findById(id)
  if (!record) {
    throw createError({ statusCode: 404, message: 'Analyse introuvable' })
  }

  logger.info('Analysis fetched by ID', { handler: 'analyses/[id]', id })

  return {
    id:            record.id,
    originalQuery: record.originalQuery,
    createdAt:     record.createdAt,
    ...(record.result as object),
  }
})
