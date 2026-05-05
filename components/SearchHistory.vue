<template>
  <div v-if="entries.length" class="mt-10">
    <div class="text-[11px] uppercase tracking-widest font-mono mb-4" style="color: var(--color-text-faint);">
      {{ $t('history.title') }}
    </div>
    <div class="flex flex-col gap-2">
      <button
        v-for="entry in entries"
        :key="entry.id"
        class="w-full text-left rounded-xl px-4 py-3 border transition-colors duration-150 cursor-pointer"
        style="background: var(--color-bg-surface); border-color: var(--color-border); font-family: inherit;"
        @click="$emit('select', entry)"
      >
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="flex-shrink-0 text-[10px] font-semibold tracking-widest uppercase font-mono rounded px-2 py-0.5 border"
              :style="verdictStyle(entry.verdict)"
            >
              {{ verdictLabel(entry.verdict) }}
            </span>
            <span class="text-sm truncate" style="color: var(--color-text-muted);">
              {{ entry.query }}
            </span>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <span class="text-xs font-mono" style="color: var(--color-text-ghost);">
              {{ $t('history.score', { score: entry.score }) }}
            </span>
            <span class="text-[11px] font-mono" style="color: var(--color-border-subtle);">
              {{ timeAgo(entry.analyzedAt) }}
            </span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VERDICTS } from '~/types/analysis'
import type { HistoryEntry } from '~/composables/useSearchHistory'

const { t } = useI18n()

defineProps<{ entries: HistoryEntry[] }>()
defineEmits<{ select: [entry: HistoryEntry] }>()

function verdictStyle(verdictKey: string) {
  const v = VERDICTS[verdictKey as keyof typeof VERDICTS] ?? VERDICTS.INCERTAIN
  return {
    color:       v.color,
    background:  `${v.color}22`,
    borderColor: `${v.color}55`,
  }
}

function verdictLabel(verdictKey: string) {
  const v = VERDICTS[verdictKey as keyof typeof VERDICTS] ?? VERDICTS.INCERTAIN
  return v.label
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return t('result.timeAgo.justNow')
  if (diff < 3600)  return t('result.timeAgo.minutes', { n: Math.floor(diff / 60) })
  if (diff < 86400) return t('result.timeAgo.hours',   { n: Math.floor(diff / 3600) })
  return t('result.timeAgo.days', { n: Math.floor(diff / 86400) })
}
</script>
