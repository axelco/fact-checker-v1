export type VerdictKey = 'VERIFIE' | 'NUANCE' | 'INCERTAIN' | 'TROMPEUSE' | 'FAUX'

export interface VerdictMeta {
  label: string
  color: string
  glow:  string
}

export const VERDICTS: Record<VerdictKey, VerdictMeta> = {
  VERIFIE:   { label: 'Vérifié',               color: '#22c55e', glow: '#22c55e33' },
  NUANCE:    { label: 'Nuancé',                color: '#84cc16', glow: '#84cc1633' },
  INCERTAIN: { label: 'Incertain',             color: '#f59e0b', glow: '#f59e0b33' },
  TROMPEUSE: { label: 'Affirmation trompeuse', color: '#f97316', glow: '#f9731633' },
  FAUX:      { label: 'Faux',                  color: '#ef4444', glow: '#ef444433' },
}

export interface PointCle {
  categorie: string
  fait:      string
  chiffre?:  string
  unite?:    string
  source?:   string
}

export interface AnalysisResult {
  affirmation_reformulee:      string
  verdict:                     VerdictKey
  score:                       number
  synthese:                    string
  points_cles:                 PointCle[]
  contexte_comparatif?:        string
  nuances?:                    string[]
  ce_que_dit_vraiment_la_data?: string
  sources_consultees?:         string[]
}

export interface ApiAnalyzeResponse extends AnalysisResult {
  fromCache: boolean
  id?:       string
}
