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
        :disabled="quotaExhausted"
        class="w-full rounded-xl px-4 py-3 text-base resize-none border focus:outline-none transition-colors duration-200 bg-transparent border-line text-primary leading-normal disabled:opacity-40 disabled:cursor-not-allowed"
        style="font-family: inherit;"
        @keydown.enter.exact.prevent="analyze"
      />

      <div class="flex justify-between items-center mt-4 flex-wrap gap-3">
        <span class="text-xs font-mono text-ghost">
          {{ $t('home.input.hint') }}
        </span>
        <button
          :disabled="loading || !query.trim() || quotaExhausted"
          class="btn btn-primary"
          @click="analyze()"
        >
          {{ loading ? $t('home.input.submitting') : $t('home.input.submit') }}
        </button>
      </div>
    </div>

    <!-- Quota indicator -->
    <div v-if="!result && !loading" class="mb-6">
      <!-- Quota exhausted -->
      <div
        v-if="quotaExhausted"
        class="rounded-xl px-4 py-3 border text-sm bg-amber-950/40 border-amber-800/40 text-amber-400"
      >
        ⏳ {{ $t('home.quota.exhausted') }}
      </div>

      <!-- Quota available -->
      <div v-else class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono text-ghost">
            {{ $t('home.quota.remaining', { remaining: quotaRemaining, total: quotaTotal }) }}
          </span>
          <button
            class="text-xs font-mono text-ghost hover:text-muted transition-colors underline underline-offset-2"
            @click="showQuotaInfo = !showQuotaInfo"
          >
            {{ $t('home.quota.why') }}
          </button>
        </div>

        <!-- Progress bar -->
        <div class="h-0.5 w-full rounded-full bg-line overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="quotaRemaining <= 2 ? 'bg-amber-500' : 'bg-accent'"
            :style="{ width: `${(quotaRemaining / quotaTotal) * 100}%` }"
          />
        </div>

        <!-- Explanation (togglable) -->
        <p v-if="showQuotaInfo" class="text-xs text-ghost mt-1 leading-relaxed">
          {{ $t('home.quota.whyExplain', { n: quotaTotal }) }}
        </p>
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

    <!-- Cache hit badge -->
    <div
      v-if="result && lastFromCache && !loading"
      class="text-center mt-2 mb-1"
    >
      <span class="text-xs font-mono text-ghost">
        ⚡ {{ $t('home.quota.cacheHit') }}
      </span>
    </div>

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

useSeoMeta({
  title:               t('app.name'),
  description:         t('seo.home.description'),
  ogTitle:             t('app.name'),
  ogDescription:       t('seo.home.description'),
  twitterTitle:        t('app.name'),
  twitterDescription:  t('seo.home.description'),
})

const query        = ref('')
const loading      = ref(false)
const result       = ref<AnalysisResultType | null>(null)
const analyzedAt   = ref<string | null>(null)
const analysisId   = ref<string | null>(null)
const error        = ref<string | null>(null)
const loadingStep  = ref(0)
const textareaRef  = ref<HTMLTextAreaElement | null>(null)
const lastFromCache = ref(false)
const showQuotaInfo = ref(false)

// Quota
const quotaRemaining = ref(10)
const quotaTotal     = ref(10)
const quotaExhausted = computed(() => quotaRemaining.value <= 0)

const { history, load: loadHistory, push: pushHistory } = useSearchHistory()

onMounted(async () => {
  loadHistory()
  try {
    const quota = await $fetch<{ remaining: number; total: number }>('/api/quota')
    quotaRemaining.value = quota.remaining
    quotaTotal.value     = quota.total
  } catch {
    // En cas d'erreur, on laisse les valeurs par défaut (10/10)
  }
})

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
  if (!query.value.trim() || loading.value || quotaExhausted.value) return
  loading.value = true
  result.value  = null
  error.value   = null

  try {
    const data = await $fetch<ApiAnalyzeResponse>('/api/analyses', {
      method: 'POST',
      body:   { query: query.value.trim() },
    })
    const now         = new Date().toISOString()
    result.value      = data
    analysisId.value  = data.id ?? null
    analyzedAt.value  = now
    lastFromCache.value = data.fromCache
    quotaRemaining.value = data.quota.remaining
    pushHistory({
      analysisId: data.id,
      query:      query.value.trim(),
      verdict:    data.verdict,
      score:      data.score,
      analyzedAt: now,
      result:     data,
    })
  } catch (e: unknown) {
    const status = (e as { status?: number; statusCode?: number })?.status
                ?? (e as { status?: number; statusCode?: number })?.statusCode
    if (status === 429) {
      const serverMsg = (e as { data?: { message?: string } })?.data?.message ?? ''
      // Distinguer quota épuisé (message serveur) du rate limit anti-burst
      error.value = serverMsg.includes('Quota')
        ? t('home.error.quotaExceeded', { n: quotaTotal.value })
        : t('home.error.rateLimit')
      if (serverMsg.includes('Quota')) quotaRemaining.value = 0
    } else {
      error.value = (e as { data?: { message?: string } })?.data?.message
                 ?? (e instanceof Error ? e.message : t('home.error.unexpected'))
    }
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value      = null
  analyzedAt.value  = null
  analysisId.value  = null
  error.value       = null
  query.value       = ''
  lastFromCache.value = false
  nextTick(() => textareaRef.value?.focus())
}

function restoreFromHistory(entry: { result: AnalysisResultType; analyzedAt: string; query: string; analysisId?: string }) {
  result.value      = entry.result
  analyzedAt.value  = entry.analyzedAt
  analysisId.value  = entry.analysisId ?? null
  query.value       = entry.query
  error.value       = null
  lastFromCache.value = false
}
</script>
