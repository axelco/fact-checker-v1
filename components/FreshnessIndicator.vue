<template>
  <div
    v-if="maxYear"
    class="flex items-center gap-2 rounded-lg px-3 py-2 border text-xs bg-dim"
    :style="{ borderColor: `${color}33` }"
  >
    <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: color }" />
    <span class="font-semibold font-mono" :style="{ color }">{{ label }}</span>
    <span class="font-mono text-ghost">
      {{ $t('result.freshness.sourcesUpTo', { year: maxYear }) }}
    </span>
    <span
      v-if="age >= 2"
      class="ml-auto px-1.5 py-0.5 rounded text-[11px] font-mono whitespace-nowrap border text-amber-500 bg-amber-500/10 border-amber-500/20"
    >
      {{ $t('result.freshness.checkNewer') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { AnalysisResult } from '~/types/analysis'

const { t } = useI18n()
const props  = defineProps<{ result: AnalysisResult }>()

const currentYear = new Date().getFullYear()

const maxYear = computed(() => {
  const allText = [
    ...(props.result.sources_consultees ?? []),
    ...(props.result.points_cles ?? []).map(p => p.source ?? ''),
  ].join(' ')
  const years = [...allText.matchAll(/20\d{2}/g)].map(m => parseInt(m[0]))
  return years.length ? Math.max(...years) : null
})

const age   = computed(() => maxYear.value ? currentYear - maxYear.value : 0)
const color = computed(() => {
  const a = age.value
  if (a === 0) return '#22c55e'
  if (a === 1) return '#84cc16'
  if (a <= 3)  return '#f59e0b'
  return '#ef4444'
})
const label = computed(() => {
  const a = age.value
  if (a === 0) return t('result.freshness.recent')
  if (a === 1) return t('result.freshness.lastYear')
  if (a <= 3)  return t('result.freshness.dated')
  return t('result.freshness.old')
})
</script>
