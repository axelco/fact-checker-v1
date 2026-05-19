import { getQuotaRemaining, DAILY_LIMIT } from '../../services/quotaRepository'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const remaining = await getQuotaRemaining(ip)
  return { remaining, total: DAILY_LIMIT }
})
