<template>
  <header class="w-full border-b bg-surface border-line">
    <div class="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3 no-underline group">
        <span class="text-2xl select-none text-line">⊕</span>
        <span class="text-base font-light tracking-wide text-primary">
          {{ $t('app.name') }}
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-6">
        <NuxtLink
          to="/"
          class="text-sm transition-colors text-faint"
          active-class="!text-primary"
        >
          {{ $t('header.nav.analyze') }}
        </NuxtLink>
        <NuxtLink
          to="/analyses"
          class="text-sm transition-colors text-faint"
          active-class="!text-primary"
        >
          {{ $t('header.nav.analyses') }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
