import { findPaginated } from '../../services/analysisRepository'
import { logger } from '../../utils/logger'

const VALID_VERDICTS = ['VERIFIE', 'NUANCE', 'INCERTAIN', 'TROMPEUSE', 'FAUX']
const LIMIT = 30

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page    = Math.max(1, parseInt(String(query.page ?? '1')))
  const sort    = query.sort === 'popular' ? 'popular' : 'recent'
  const verdict = VALID_VERDICTS.includes(String(query.verdict ?? ''))
    ? String(query.verdict)
    : undefined

  logger.info('Analyses list fetched', { handler: 'analyses', page, sort, verdict })

  return findPaginated({ page, limit: LIMIT, sort, verdict })
})
