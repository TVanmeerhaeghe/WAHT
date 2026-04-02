<template>
  <div class="min-h-screen bg-void relative overflow-x-hidden">
    <!-- Grid background -->
    <div
      class="fixed inset-0 pointer-events-none"
      style="
        background-image:
          linear-gradient(rgba(174, 119, 213, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(174, 119, 213, 0.04) 1px, transparent 1px);
        background-size: 40px 40px;
      "
    />

    <!-- Ambient glow top -->
    <div
      class="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
      style="
        background: radial-gradient(
          ellipse at center top,
          rgba(126, 78, 172, 0.12) 0%,
          transparent 70%
        );
      "
    />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
