<template>
  <div>
    <!-- Hero -->
    <section class="text-center py-20 relative">
      <!-- Glow derrière le titre -->
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
        style="
          background: radial-gradient(
            ellipse,
            rgba(126, 78, 172, 0.2) 0%,
            transparent 70%
          );
        "
      />

      <div class="relative z-10">
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border"
          style="
            background: rgba(126, 78, 172, 0.15);
            border-color: rgba(174, 119, 213, 0.3);
            color: #af77d5;
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-quality-uncommon animate-pulse-slow"
          />
          Live data from Blizzard API
        </div>

        <h1
          class="font-display text-5xl sm:text-7xl font-bold mb-6 leading-tight"
        >
          <span class="text-white">WoW Auction</span><br />
          <span class="text-gradient">House Tracker</span>
        </h1>

        <p
          class="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Track prices, discover arbitrage opportunities and analyze the economy
          across all realms in real time.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <NuxtLink to="/search" class="btn-primary text-base px-8 py-3">
            Search Items →
          </NuxtLink>
          <NuxtLink
            to="/realms"
            class="text-arcane-100 hover:text-arcane-50 text-base font-medium transition-colors"
          >
            Browse Realms
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats globales -->
    <section class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
      <UiStatCard
        v-for="stat in globalStats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :subtitle="stat.subtitle"
      />
    </section>

    <!-- Features -->
    <section class="grid sm:grid-cols-3 gap-6 mb-16">
      <UiCard
        v-for="feature in features"
        :key="feature.title"
        :padding="true"
        hoverable
        class="group"
      >
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl transition-all duration-300 group-hover:scale-110"
          style="
            background: linear-gradient(
              135deg,
              rgba(126, 78, 172, 0.3),
              rgba(46, 22, 91, 0.5)
            );
          "
        >
          {{ feature.icon }}
        </div>
        <h3 class="font-display font-semibold text-white mb-2">
          {{ feature.title }}
        </h3>
        <p class="text-gray-400 text-sm leading-relaxed">
          {{ feature.description }}
        </p>
      </UiCard>
    </section>
  </div>
</template>

<script setup lang="ts">
const { getStats } = useApi();
const { data: stats } = await useAsyncData("stats", () => getStats());

const globalStats = computed(() => [
  {
    label: "Active Realms",
    value: stats.value?.realmCount.toLocaleString() ?? "153",
    subtitle: "EU + US + KR",
  },
  {
    label: "Items Tracked",
    value: stats.value?.itemCount.toLocaleString() ?? "—",
    subtitle: "Enriched & searchable",
  },
  {
    label: "Auctions Live",
    value: stats.value
      ? `${(stats.value.auctionCount / 1_000_000).toFixed(1)}M`
      : "—",
    subtitle: "Across all realms",
  },
  {
    label: "Sync Interval",
    value: "1h",
    subtitle: "Blizzard API limit",
  },
]);

const features = [
  {
    icon: "📈",
    title: "Price History",
    description:
      "Track price evolution over 7, 30 or 90 days with interactive charts.",
  },
  {
    icon: "🔍",
    title: "Live Search",
    description:
      "Search any item and get real-time prices across all connected realms.",
  },
  {
    icon: "⚡",
    title: "Arbitrage",
    description: "Detect buy/sell opportunities between realms automatically.",
  },
];
</script>
