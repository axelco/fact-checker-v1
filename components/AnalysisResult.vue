<template>
  <div class="flex flex-col gap-4 fade-in">

    <!-- Meta bar -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <span class="text-[11px] font-mono text-ghost">
        {{ $t('result.meta.analyzedAt', { time: timeAgo(analyzedAt) }) }}
      </span>
      <FreshnessIndicator :result="result" />
    </div>

    <!-- Verdict card -->
    <div
      class="rounded-2xl p-6 border bg-surface"
      :style="{ borderColor: `${verdict.color}44`, boxShadow: `0 0 40px ${verdict.glow}` }"
    >
      <div class="mb-4">
        <span
          class="inline-block text-xs font-semibold tracking-widest uppercase font-mono rounded px-3 py-0.5 mb-3 border"
          :style="{ color: verdict.color, background: `${verdict.color}22`, borderColor: `${verdict.color}55` }"
        >
          {{ verdict.label }}
        </span>
        <h2 class="text-lg font-light italic leading-relaxed m-0 text-primary">
          « {{ result.affirmation_reformulee }} »
        </h2>
      </div>
      <ScoreBar :score="result.score" :color="verdict.color" />
      <div class="mt-4 pt-4 border-t border-line-subtle">
        <p class="text-sm leading-7 m-0 text-muted">{{ result.synthese }}</p>
      </div>
    </div>

    <!-- Points clés -->
    <div v-if="result.points_cles?.length">
      <div class="text-[11px] uppercase tracking-widest font-mono mb-3 text-faint">
        {{ $t('result.sections.keyData') }}
      </div>
      <div
        v-for="(point, i) in result.points_cles" :key="i"
        class="rounded-xl p-4 mb-2 border bg-dim border-line-subtle"
      >
        <div class="flex justify-between items-start gap-3 flex-wrap">
          <div class="flex-1">
            <div class="text-[11px] uppercase tracking-widest font-mono mb-1 text-accent">
              {{ point.categorie }}
            </div>
            <div class="text-sm leading-relaxed text-primary">{{ point.fait }}</div>
            <div v-if="point.source" class="text-[11px] font-mono mt-1 text-ghost">
              {{ $t('result.sections.source', { source: point.source }) }}
            </div>
          </div>
          <div
            v-if="point.chiffre"
            class="rounded-lg px-3 py-2 text-center flex-shrink-0 border bg-surface border-line"
          >
            <div class="text-xl font-bold font-mono leading-none text-primary">
              {{ point.chiffre }}
            </div>
            <div v-if="point.unite" class="text-[10px] mt-1 text-faint">
              {{ point.unite }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contexte comparatif -->
    <div
      v-if="result.contexte_comparatif"
      class="rounded-xl p-5 border bg-surface border-line"
    >
      <div class="text-[11px] uppercase tracking-widest font-mono mb-3 text-accent">
        {{ $t('result.sections.context') }}
      </div>
      <p class="text-sm leading-7 m-0 text-muted">{{ result.contexte_comparatif }}</p>
    </div>

    <!-- Nuances -->
    <div
      v-if="result.nuances?.length"
      class="rounded-xl p-5 border bg-surface border-line"
    >
      <div class="text-[11px] uppercase tracking-widest font-mono mb-3 text-amber-500">
        {{ $t('result.sections.nuances') }}
      </div>
      <div v-for="(nuance, i) in result.nuances" :key="i" class="flex gap-2 items-start mb-1.5">
        <span class="flex-shrink-0 text-amber-500">—</span>
        <span class="text-sm leading-relaxed text-muted">{{ nuance }}</span>
      </div>
    </div>

    <!-- Ce que dit vraiment la data -->
    <div
      v-if="result.ce_que_dit_vraiment_la_data"
      class="rounded-xl p-5 border"
      :style="{ background: `${verdict.color}0d`, borderColor: `${verdict.color}33` }"
    >
      <div class="text-[11px] uppercase tracking-widest font-mono mb-3" :style="{ color: verdict.color }">
        {{ $t('result.sections.dataConclusion') }}
      </div>
      <p class="text-sm leading-7 m-0 text-muted">
        {{ result.ce_que_dit_vraiment_la_data }}
      </p>
    </div>

    <!-- Sources -->
    <div v-if="result.sources_consultees?.length" class="py-4 border-t border-line-subtle">
      <div class="text-[11px] uppercase tracking-widest font-mono mb-3 text-ghost">
        {{ $t('result.sections.sources') }}
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(source, i) in result.sources_consultees" :key="i"
          class="text-[11px] font-mono rounded px-2 py-1 border bg-surface border-line text-faint"
        >
          {{ source }}
        </span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { VERDICTS } from '~/types/analysis'
import type { AnalysisResult } from '~/types/analysis'

const { t } = useI18n()

const props = defineProps<{
  result:     AnalysisResult
  analyzedAt: string
}>()

const verdict = computed(() => VERDICTS[props.result.verdict] ?? VERDICTS.INCERTAIN)

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return t('result.timeAgo.justNow')
  if (diff < 3600)  return t('result.timeAgo.minutes', { n: Math.floor(diff / 60) })
  if (diff < 86400) return t('result.timeAgo.hours',   { n: Math.floor(diff / 3600) })
  return t('result.timeAgo.days', { n: Math.floor(diff / 86400) })
}
</script>
