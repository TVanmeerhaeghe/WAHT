<template>
  <footer
    class="mt-20 border-t"
    style="
      background: rgba(2, 0, 10, 0.9);
      border-color: rgba(174, 119, 213, 0.15);
    "
  >
    <div class="container mx-auto px-4 max-w-7xl py-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="font-display text-arcane-50 font-semibold">WAHT</span>
          <span class="text-gray-600 text-sm">— WoW Auction House Tracker</span>
        </div>
        <div class="flex items-center gap-6 text-gray-600 text-xs">
          <span>Powered by Blizzard API</span>
          <a
            href="https://github.com/TVanmeerhaeghe/WAHT"
            target="_blank"
            class="hover:text-arcane-50 transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
