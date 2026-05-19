import { prisma } from '../utils/prisma'

export const DAILY_LIMIT = 10

function today(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD UTC
}

/**
 * Retourne le quota restant pour une IP sans le modifier.
 */
export async function getQuotaRemaining(ip: string): Promise<number> {
  const record = await prisma.dailyQuota.findUnique({
    where: { ip_date: { ip, date: today() } },
  })
  return Math.max(0, DAILY_LIMIT - (record?.count ?? 0))
}

/**
 * Vérifie le quota et l'incrémente si autorisé.
 * Lève une QuotaExceededError si la limite journalière est atteinte.
 * Retourne le nombre de requêtes restantes après incrément.
 */
export async function checkAndIncrementQuota(ip: string): Promise<number> {
  const date   = today()
  const record = await prisma.dailyQuota.findUnique({
    where: { ip_date: { ip, date } },
  })

  if (record && record.count >= DAILY_LIMIT) {
    throw new QuotaExceededError()
  }

  const updated = await prisma.dailyQuota.upsert({
    where:  { ip_date: { ip, date } },
    update: { count: { increment: 1 } },
    create: { ip, date, count: 1 },
  })

  return Math.max(0, DAILY_LIMIT - updated.count)
}

export class QuotaExceededError extends Error {
  readonly statusCode = 429
  constructor() {
    super('Quota journalier atteint. Revenez demain !')
    this.name = 'QuotaExceededError'
  }
}
