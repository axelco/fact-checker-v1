<template>
  <div class="mb-1">
    <div class="flex justify-between mb-1">
      <span class="text-xs uppercase tracking-widest font-mono" style="color: var(--color-text-ghost);">
        {{ $t('result.score.label') }}
      </span>
      <span class="text-sm font-bold font-mono" :style="{ color }">
        {{ $t('result.score.value', { score }) }}
      </span>
    </div>
    <div class="h-1.5 rounded-full overflow-hidden" style="background: var(--color-border-subtle);">
      <div
        class="h-full rounded-full transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        :style="{ width: `${animatedWidth}%`, background: `linear-gradient(90deg, #334155, ${color})` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ score: number; color: string }>()

const animatedWidth = ref(0)
onMounted(() => { setTimeout(() => { animatedWidth.value = props.score }, 100) })
</script>
