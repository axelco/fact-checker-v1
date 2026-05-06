<template>
  <!-- Natural bar (in document flow) -->
  <div ref="actionBarRef" class="flex justify-center gap-3 pt-2 pb-2">
    <button
      v-if="analysisId"
      class="btn btn-lg btn-secondary"
      @click="copyShareUrl"
    >
      <span>{{ copied ? '✓' : '⎘' }}</span>
      <span class="hidden sm:inline">{{ copied ? $t('share.copied') : $t('share.copy') }}</span>
    </button>
    <button class="btn btn-lg btn-primary" @click="$emit('reset')">
      <span>←</span>
      <span class="hidden sm:inline">{{ $t('result.reset') }}</span>
    </button>
  </div>

  <!-- Fixed bar (only when natural bar is out of viewport) -->
  <Teleport to="body">
    <div
      v-if="!actionBarVisible"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 fade-in flex gap-3"
    >
      <button
        v-if="analysisId"
        class="btn btn-lg btn-secondary shadow-lg"
        @click="copyShareUrl"
      >
        <span>{{ copied ? '✓' : '⎘' }}</span>
        <span class="hidden sm:inline">{{ copied ? $t('share.copied') : $t('share.copy') }}</span>
      </button>
      <button class="btn btn-lg btn-primary shadow-lg" @click="$emit('reset')">
        <span>←</span>
        <span class="hidden sm:inline">{{ $t('result.reset') }}</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ analysisId?: string | null }>()
defineEmits<{ reset: [] }>()

const actionBarRef     = ref<HTMLElement | null>(null)
const actionBarVisible = ref(false)
const copied           = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null
let observer:   IntersectionObserver | null = null

onMounted(() => {
  if (!actionBarRef.value) return
  observer = new IntersectionObserver(([entry]) => {
    actionBarVisible.value = entry.isIntersecting
  }, { threshold: 0.5 })
  observer.observe(actionBarRef.value)
})

onUnmounted(() => observer?.disconnect())

async function copyShareUrl() {
  if (!props.analysisId) return
  const url = `${window.location.origin}/analyses/${props.analysisId}`
  await navigator.clipboard.writeText(url)
  copied.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => { copied.value = false }, 2000)
}
</script>
