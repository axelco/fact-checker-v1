// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit } from '~/server/utils/rateLimiter'

// Chaque test utilise une IP unique pour éviter les interférences
// (le store est un Map module-level qui persiste entre les tests)
let ipCounter = 0
const freshIp = () => `10.0.0.${++ipCounter}`

describe('checkRateLimit', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('autorise les 5 premières requêtes', () => {
    const ip = freshIp()
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip).ok).toBe(true)
    }
  })

  it('bloque la 6ème requête', () => {
    const ip = freshIp()
    for (let i = 0; i < 5; i++) checkRateLimit(ip)
    const result = checkRateLimit(ip)
    expect(result.ok).toBe(false)
  })

  it('retourne retryAfter en secondes lors du blocage', () => {
    const ip = freshIp()
    for (let i = 0; i < 5; i++) checkRateLimit(ip)
    const { ok, retryAfter } = checkRateLimit(ip)
    expect(ok).toBe(false)
    expect(retryAfter).toBeGreaterThan(0)
    expect(retryAfter).toBeLessThanOrEqual(60)
  })

  it('réinitialise le compteur après la fenêtre de 60 s', () => {
    const ip = freshIp()
    for (let i = 0; i < 5; i++) checkRateLimit(ip)
    expect(checkRateLimit(ip).ok).toBe(false)

    vi.advanceTimersByTime(61_000)

    expect(checkRateLimit(ip).ok).toBe(true)
  })

  it('repart de 1 après reset (pas de carry-over)', () => {
    const ip = freshIp()
    for (let i = 0; i < 5; i++) checkRateLimit(ip)
    vi.advanceTimersByTime(61_000)

    // 5 nouvelles requêtes doivent passer
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip).ok).toBe(true)
    }
    expect(checkRateLimit(ip).ok).toBe(false)
  })

  it('isole les compteurs par IP', () => {
    const ip1 = freshIp()
    const ip2 = freshIp()

    for (let i = 0; i < 5; i++) checkRateLimit(ip1)
    expect(checkRateLimit(ip1).ok).toBe(false)

    // ip2 n'est pas affectée par ip1
    expect(checkRateLimit(ip2).ok).toBe(true)
  })
})
