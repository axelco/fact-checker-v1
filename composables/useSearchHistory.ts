import type { AnalysisResult } from '~/types/analysis'

export type HistoryEntry = {
  id:          string
  analysisId?: string
  query:       string
  verdict:     string
  score:       number
  analyzedAt:  string
  result:      AnalysisResult
}

const STORAGE_KEY = 'fc_history'
const MAX_ENTRIES = 10

export function useSearchHistory() {
  const history = ref<HistoryEntry[]>([])

  function load() {
    if (!import.meta.client) return
    try {
      history.value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      history.value = []
    }
  }

  function push(entry: Omit<HistoryEntry, 'id'>) {
    const newEntry: HistoryEntry = { ...entry, id: Date.now().toString() }
    history.value = [newEntry, ...history.value].slice(0, MAX_ENTRIES)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
    }
  }

  return { history, load, push }
}
