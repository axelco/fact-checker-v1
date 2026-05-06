<template>
  <div class="max-w-3xl mx-auto px-5 py-16">

    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-2xl font-light tracking-tight mb-1 text-primary">
        {{ $t('analyses.title') }}
      </h1>
      <p class="text-sm text-ghost m-0">{{ $t('analyses.total', { n: data?.total ?? 0 }) }}</p>
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 mb-6">

      <!-- Sort toggle -->
      <div class="flex rounded-lg overflow-hidden border border-line">
        <button
          class="px-3 py-1.5 text-xs font-mono transition-colors"
          :class="sort === 'recent' ? 'bg-accent text-canvas' : 'bg-surface text-ghost hover:text-muted'"
          @click="setSort('recent')"
        >
          {{ $t('analyses.sort.recent') }}
        </button>
        <button
          class="px-3 py-1.5 text-xs font-mono transition-colors"
          :class="sort === 'popular' ? 'bg-accent text-canvas' : 'bg-surface text-ghost hover:text-muted'"
          @click="setSort('popular')"
        >
          {{ $t('analyses.sort.popular') }}
        </button>
      </div>

    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-12">
      <div
        class="w-8 h-8 rounded-full border-4 mx-auto border-line-subtle border-t-accent"
        style="animation: spin 0.9s linear infinite;"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!data?.items?.length"
      class="text-center py-16 text-ghost text-sm font-mono"
    >
      {{ $t('analyses.empty') }}
    </div>

    <!-- List -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="item in data.items" :key="item.id"
        class="rounded-xl px-4 py-3 border bg-surface border-line flex items-center gap-3 flex-wrap"
      >
        <!-- Verdict badge -->
        <span
          class="flex-shrink-0 text-[10px] font-semibold tracking-widest uppercase font-mono rounded px-2 py-0.5 border"
          :style="verdictBadgeStyle(item.verdict)"
        >
          {{ verdictLabel(item.verdict) }}
        </span>

        <!-- Query -->
        <span class="flex-1 text-sm text-muted truncate min-w-0">
          {{ item.originalQuery }}
        </span>

        <!-- Popular badge -->
        <span
          v-if="item.hitCount >= POPULAR_THRESHOLD"
          class="flex-shrink-0 text-[10px] font-mono rounded px-2 py-0.5 border text-amber-500 bg-amber-500/10 border-amber-500/20"
        >
          {{ $t('analyses.popular') }}
        </span>

        <!-- Meta -->
        <div class="flex items-center gap-3 flex-shrink-0 text-[11px] font-mono text-ghost">
          <span>{{ item.score }}/100</span>
          <span>{{ timeAgo(item.updatedAt) }}</span>
        </div>

        <!-- Detail button -->
        <NuxtLink
          :to="`/analyses/${item.id}`"
          class="btn btn-secondary flex-shrink-0"
          style="font-size: 0.75rem; padding: 0.25rem 0.75rem;"
        >
          {{ $t('analyses.see') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="data && data.totalPages > 1" class="flex justify-center items-center gap-3 mt-8">
      <button
        class="btn btn-secondary"
        :disabled="page <= 1"
        @click="setPage(page - 1)"
      >
        ←
      </button>
      <span class="text-sm font-mono text-ghost">
        {{ $t('analyses.pagination', { page, total: data.totalPages }) }}
      </span>
      <button
        class="btn btn-secondary"
        :disabled="page >= data.totalPages"
        @click="setPage(page + 1)"
      >
        →
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { VERDICTS } from '~/types/analysis'
import { POPULAR_THRESHOLD } from '~/utils/constants'

const { t } = useI18n()
const route  = useRoute()

const page = ref(parseInt(String(route.query.page ?? '1')))
const sort = ref<'recent' | 'popular'>(route.query.sort === 'popular' ? 'popular' : 'recent')

const { data, pending, refresh } = await useAsyncData(
  () => `analyses-${page.value}-${sort.value}`,
  () => $fetch<{
    items:      { id: string; originalQuery: string; verdict: string; score: number; hitCount: number; createdAt: string; updatedAt: string }[]
    total:      number
    page:       number
    totalPages: number
  }>('/api/analyses', {
    query: { page: page.value, sort: sort.value },
  }),
)

useHead({ title: t('analyses.title') })

function setSort(s: 'recent' | 'popular') {
  sort.value = s
  page.value = 1
  refresh()
}

function setPage(p: number) {
  page.value = p
  refresh()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function verdictBadgeStyle(key: string) {
  const v = VERDICTS[key as keyof typeof VERDICTS] ?? VERDICTS.INCERTAIN
  return { color: v.color, background: `${v.color}22`, borderColor: `${v.color}55` }
}

function verdictLabel(key: string) {
  return (VERDICTS[key as keyof typeof VERDICTS] ?? VERDICTS.INCERTAIN).label
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return t('result.timeAgo.justNow')
  if (diff < 3600)  return t('result.timeAgo.minutes', { n: Math.floor(diff / 60) })
  if (diff < 86400) return t('result.timeAgo.hours',   { n: Math.floor(diff / 3600) })
  return t('result.timeAgo.days', { n: Math.floor(diff / 86400) })
}
</script>
