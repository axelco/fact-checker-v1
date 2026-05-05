<template>
  <div class="min-h-screen flex flex-col" style="background-color: var(--color-bg-base);">
    <AppHeader />

    <main class="flex-1 w-full">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
