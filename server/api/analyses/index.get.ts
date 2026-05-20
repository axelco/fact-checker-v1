import { findPaginated } from '../../repositories/analysis.repository'
import { logger } from '../../utils/logger'

const LIMIT = 30

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Math.max(1, parseInt(String(query.page ?? '1')))
  const sort = query.sort === 'popular' ? 'popular' : 'recent'

  logger.info('Analyses list fetched', { handler: 'analyses', page, sort })

  return findPaginated({ page, limit: LIMIT, sort })
})
