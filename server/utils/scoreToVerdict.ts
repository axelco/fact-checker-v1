import type { VerdictKey } from '~/types/analysis'

/**
 * Dérive le verdict à partir du score factuel (0–100).
 *
 * Plages :
 *  0 – 10  → FAUX
 * 11 – 35  → TROMPEUR
 * 36 – 50  → INCERTAIN
 * 51 – 89  → NUANCE
 * 90 – 100 → VERIFIE
 */
export function scoreToVerdict(score: number): VerdictKey {
  if (score <= 10)  return 'FAUX'
  if (score <= 35)  return 'TROMPEUR'
  if (score <= 50)  return 'INCERTAIN'
  if (score <= 89)  return 'NUANCE'
  return 'VERIFIE'
}
