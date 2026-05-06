<template>
  <div class="max-w-2xl mx-auto px-5 py-16">

    <!-- Loading -->
    <div v-if="pending" class="text-center py-12">
      <div
        class="w-10 h-10 rounded-full border-4 mx-auto border-line-subtle border-t-accent"
        style="animation: spin 0.9s linear infinite;"
      />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="fade-in rounded-xl px-5 py-4 border text-sm bg-red-950 border-red-900 text-red-300"
    >
      ⚠ {{ $t('analysis.error') }}
    </div>

    <!-- Result -->
    <template v-else-if="data">
      <div class="text-center mb-10">
        <NuxtLink to="/" class="text-sm font-mono text-faint hover:text-muted transition-colors">
          ← {{ $t('analysis.backHome') }}
        </NuxtLink>
      </div>

      <AnalysisResult
        :result="data"
        :analyzed-at="data.createdAt"
      />

      <div class="flex justify-center gap-3 mt-6">
        <button class="btn btn-lg btn-secondary" @click="copyShareUrl">
          <span>{{ copied ? '✓' : '⎘' }}</span>
          <span class="hidden sm:inline">{{ copied ? $t('share.copied') : $t('share.copy') }}</span>
        </button>
        <NuxtLink to="/" class="btn btn-lg btn-primary">
          <span>←</span>
          <span class="hidden sm:inline">{{ $t('analysis.newAnalysis') }}</span>
        </NuxtLink>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import type { AnalysisResult } from '~/types/analysis'

const route  = useRoute()
const id     = route.params.id as string
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

async function copyShareUrl() {
  await navigator.clipboard.writeText(window.location.href)
  copied.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => { copied.value = false }, 2000)
}

const { data, pending, error } = await useAsyncData(
  `analysis-${id}`,
  () => $fetch<AnalysisResult & { id: string; originalQuery: string; createdAt: string }>(
    `/api/analysis/${id}`
  ),
)

useHead({
  title: data.value?.affirmation_reformulee ?? 'Analyse',
  meta: [
    { name: 'description',    content: data.value?.synthese ?? '' },
    { property: 'og:title',   content: data.value?.affirmation_reformulee ?? 'Analyse' },
    { property: 'og:description', content: data.value?.synthese ?? '' },
  ],
})
</script>
