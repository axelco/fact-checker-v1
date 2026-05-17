const LIMIT     = 5      // requêtes max par fenêtre
const WINDOW_MS = 60_000 // fenêtre glissante : 1 minute

interface Entry { count: number; resetAt: number }

const store = new Map<string, Entry>()

export function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now   = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true }
  }

  if (entry.count >= LIMIT) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { ok: true }
}
