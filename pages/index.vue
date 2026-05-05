<template>
  <div class="max-w-2xl mx-auto px-5 py-16">

    <!-- Header -->
    <div class="text-center mb-14">
      <div class="text-7xl leading-none mb-4 select-none" style="color: var(--color-border);">⊕</div>
      <h1
        class="font-light tracking-tight mb-2"
        style="color: var(--color-text-primary); font-size: clamp(30px, 6vw, 48px);"
      >
        {{ $t('app.name') }}
      </h1>
      <p class="text-base italic m-0" style="color: var(--color-text-faint);">
        {{ $t('app.tagline') }}
      </p>
    </div>

    <!-- Input card -->
    <div
      v-if="!result"
      class="rounded-2xl p-6 mb-6 border"
      style="background: var(--color-bg-surface); border-color: var(--color-border);"
    >
      <textarea
        ref="textareaRef"
        v-model="query"
        :rows="3"
        :placeholder="$t('home.input.placeholder')"
        class="w-full rounded-xl px-4 py-3 text-base resize-none border focus:outline-none transition-colors duration-200"
        style="
          background: transparent;
          border-color: var(--color-border);
          color: var(--color-text-primary);
          font-family: inherit;
          line-height: 1.5;
          box-sizing: border-box;
        "
        @keydown.enter.exact.prevent="analyze"
      />

      <div class="flex justify-between items-center mt-4 flex-wrap gap-3">
        <span class="text-xs font-mono" style="color: var(--color-text-ghost);">
          {{ $t('home.input.hint') }}
        </span>
        <button
          :disabled="loading || !query.trim()"
          class="px-5 py-2 rounded-lg text-sm font-semibold tracking-wide border-none transition-all duration-200"
          :style="submitStyle"
          @click="analyze()"
        >
          {{ loading ? $t('home.input.submitting') : $t('home.input.submit') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="w-10 h-10 rounded-full border-4 mx-auto mb-5"
        style="border-color: var(--color-border-subtle); border-top-color: var(--color-accent); animation: spin 0.9s linear infinite;"
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
      class="fade-in rounded-xl px-5 py-4 border text-sm"
      style="background: #200a0a; border-color: #7f1d1d; color: #fca5a5;"
    >
      ⚠ {{ error }}
    </div>

    <!-- Result -->
    <AnalysisResult
      v-if="result && analyzedAt && !loading"
      :result="result"
      :analyzed-at="analyzedAt"
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
import type { AnalysisResult as AnalysisResultType } from '~/types/analysis'

const { t } = useI18n()

const query       = ref('')
const loading     = ref(false)
const result      = ref<AnalysisResultType | null>(null)
const analyzedAt  = ref<string | null>(null)
const error       = ref<string | null>(null)
const loadingStep = ref(0)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const { history, load: loadHistory, push: pushHistory } = useSearchHistory()
onMounted(loadHistory)

const submitStyle = computed(() => {
  const disabled = !query.value.trim() || loading.value
  return {
    background: disabled ? '#1e293b' : '#0ea5e9',
    color:      disabled ? 'var(--color-text-faint)' : '#fff',
    cursor:     disabled ? 'not-allowed' : 'pointer',
  }
})

function stepStyle(i: number) {
  if (i === loadingStep.value) return { color: 'var(--color-text-muted)' }
  if (i < loadingStep.value)   return { color: 'var(--color-text-ghost)' }
  return { color: 'var(--color-border-subtle)' }
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
    const data = await $fetch<AnalysisResultType>('/api/analyze', {
      method: 'POST',
      body:   { query: query.value.trim() },
    })
    const now        = new Date().toISOString()
    result.value     = data
    analyzedAt.value = now
    pushHistory({
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
  error.value      = null
  query.value      = ''
  nextTick(() => textareaRef.value?.focus())
}

function restoreFromHistory(entry: { result: AnalysisResultType; analyzedAt: string; query: string }) {
  result.value     = entry.result
  analyzedAt.value = entry.analyzedAt
  query.value      = entry.query
  error.value      = null
}
</script>
