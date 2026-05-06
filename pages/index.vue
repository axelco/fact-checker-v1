<template>
  <div class="max-w-2xl mx-auto px-5 py-16">

    <!-- Header -->
    <div class="text-center mb-14">
      <div class="text-7xl leading-none mb-4 select-none text-line">⊕</div>
      <h1
        class="font-light tracking-tight mb-2 text-primary"
        style="font-size: clamp(30px, 6vw, 48px);"
      >
        {{ $t('app.name') }}
      </h1>
      <p class="text-base italic m-0 text-faint">
        {{ $t('app.tagline') }}
      </p>
    </div>

    <!-- Input card -->
    <div
      v-if="!result"
      class="rounded-2xl p-6 mb-6 border bg-surface border-line"
    >
      <textarea
        ref="textareaRef"
        v-model="query"
        :rows="3"
        :placeholder="$t('home.input.placeholder')"
        class="w-full rounded-xl px-4 py-3 text-base resize-none border focus:outline-none transition-colors duration-200 bg-transparent border-line text-primary leading-normal"
        style="font-family: inherit;"
        @keydown.enter.exact.prevent="analyze"
      />

      <div class="flex justify-between items-center mt-4 flex-wrap gap-3">
        <span class="text-xs font-mono text-ghost">
          {{ $t('home.input.hint') }}
        </span>
        <button
          :disabled="loading || !query.trim()"
          class="btn btn-primary"
          @click="analyze()"
        >
          {{ loading ? $t('home.input.submitting') : $t('home.input.submit') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="w-10 h-10 rounded-full border-4 mx-auto mb-5 border-line-subtle border-t-accent"
        style="animation: spin 0.9s linear infinite;"
      />
      <div class="flex flex-col gap-2">
        <div
          v-for="i in 4" :key="i"
          class="text-sm font-mono flex items-center justify-center gap-2 transition-colors duration-500"
          :style="stepStyle(i - 1)"
        >
          <span>{{ stepIcon(i - 1) }}</span>
          {{ $t(`home.steps.${i - 1}`) }}
        </div>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="error && !loading"
      class="fade-in rounded-xl px-5 py-4 border text-sm bg-red-950 border-red-900 text-red-300"
    >
      ⚠ {{ error }}
    </div>

    <!-- Result -->
    <AnalysisResult
      v-if="result && analyzedAt && !loading"
      :result="result"
      :analyzed-at="analyzedAt"
    />

    <!-- Action bar -->
    <AnalysisActionBar
      v-if="result && !loading"
      :analysis-id="analysisId"
      @reset="reset"
    />

    <!-- History -->
    <SearchHistory
      v-if="!result && !loading"
      :entries="history"
      @select="restoreFromHistory"
    />

  </div>
</template>

<script setup lang="ts">
import type { AnalysisResult as AnalysisResultType, ApiAnalyzeResponse } from '~/types/analysis'

const { t } = useI18n()

const query       = ref('')
const loading     = ref(false)
const result      = ref<AnalysisResultType | null>(null)
const analyzedAt  = ref<string | null>(null)
const analysisId  = ref<string | null>(null)
const error       = ref<string | null>(null)
const loadingStep = ref(0)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const { history, load: loadHistory, push: pushHistory } = useSearchHistory()
onMounted(loadHistory)

function stepStyle(i: number) {
  if (i === loadingStep.value) return { color: 'var(--color-muted)' }
  if (i < loadingStep.value)   return { color: 'var(--color-ghost)' }
  return { color: 'var(--color-line)' }
}

function stepIcon(i: number) {
  if (i < loadingStep.value)   return '✓'
  if (i === loadingStep.value) return '›'
  return '·'
}

let stepTimer: ReturnType<typeof setInterval> | null = null

watch(loading, (val) => {
  if (val) {
    loadingStep.value = 0
    stepTimer = setInterval(() => {
      loadingStep.value = Math.min(loadingStep.value + 1, 3)
    }, 3000)
  } else {
    if (stepTimer) clearInterval(stepTimer)
  }
})

async function analyze() {
  if (!query.value.trim() || loading.value) return
  loading.value = true
  result.value  = null
  error.value   = null

  try {
    const data = await $fetch<ApiAnalyzeResponse>('/api/analyze', {
      method: 'POST',
      body:   { query: query.value.trim() },
    })
    const now        = new Date().toISOString()
    result.value     = data
    analysisId.value = data.id ?? null
    analyzedAt.value = now
    pushHistory({
      analysisId: data.id,
      query:      query.value.trim(),
      verdict:    data.verdict,
      score:      data.score,
      analyzedAt: now,
      result:     data,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : t('home.error.unexpected')
    error.value = msg
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value     = null
  analyzedAt.value = null
  analysisId.value = null
  error.value      = null
  query.value      = ''
  nextTick(() => textareaRef.value?.focus())
}

function restoreFromHistory(entry: { result: AnalysisResultType; analyzedAt: string; query: string; analysisId?: string }) {
  result.value     = entry.result
  analyzedAt.value = entry.analyzedAt
  analysisId.value = entry.analysisId ?? null
  query.value      = entry.query
  error.value      = null
}
</script>
