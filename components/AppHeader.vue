<template>
  <header
    class="w-full border-b"
    style="background-color: var(--color-bg-surface); border-color: var(--color-border);"
  >
    <div class="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3 no-underline group">
        <span class="text-2xl select-none" style="color: var(--color-border);">⊕</span>
        <span
          class="text-base font-light tracking-wide"
          style="color: var(--color-text-primary); font-family: 'Georgia', serif;"
        >
          {{ $t('app.name') }}
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-6">
        <NuxtLink
          to="/"
          class="text-sm transition-colors"
          style="color: var(--color-text-faint); font-family: monospace;"
          active-class="!text-sky-400"
        >
          {{ $t('header.nav.analyze') }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
