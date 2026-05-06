<template>
  <div class="min-h-screen flex flex-col bg-canvas">
    <AppHeader />

    <main class="flex-1 w-full">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
