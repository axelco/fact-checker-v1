<template>
  <footer
    class="w-full border-t mt-auto"
    style="background-color: var(--color-bg-surface); border-color: var(--color-border);"
  >
    <div class="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between flex-wrap gap-3">
      <span class="text-xs font-mono" style="color: var(--color-text-ghost);">
        {{ $t('footer.description') }}
      </span>
      <span class="text-xs font-mono" style="color: var(--color-text-ghost);">
        {{ $t('footer.poweredBy') }}
      </span>
    </div>
  </footer>
</template>
