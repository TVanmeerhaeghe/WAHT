<template>
  <div>
    <!-- Back button -->
    <NuxtLink
      to="/search"
      class="inline-flex items-center gap-2 text-gray-400 hover:text-arcane-50 transition-colors mb-6 text-sm"
    >
      ← Back to Search
    </NuxtLink>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <!-- Error -->
    <div v-else-if="!itemData" class="text-center py-20">
      <p class="text-gray-400">Item not found</p>
    </div>

    <div v-else>
      <!-- Header item -->
      <div class="flex items-start gap-6 mb-8">
        <div
          class="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 overflow-hidden"
          :class="
            qualityBorder[itemData.quality?.toLowerCase()] ?? 'border-gray-700'
          "
          style="background: rgba(18, 6, 50, 0.8)"
        >
          <img
            v-if="itemData.iconUrl"
            :src="itemData.iconUrl"
            :alt="itemData.name"
            class="w-16 h-16 rounded-xl"
          />
          <span v-else class="text-gray-600 text-2xl">?</span>
        </div>

        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h1
              class="font-display text-3xl font-bold"
              :class="
                qualityColor[itemData.quality?.toLowerCase()] ?? 'text-white'
              "
            >
              {{ itemData.name }}
            </h1>
            <UiBadge :variant="itemData.quality?.toLowerCase() as any">
              {{ itemData.quality }}
            </UiBadge>
          </div>
          <p class="text-gray-500 text-sm">Item #{{ itemData.id }}</p>
        </div>
      </div>

      <!-- Contrôles -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Sélecteur realm -->
        <div class="flex-1 min-w-48">
          <select v-model="selectedRealm" class="input w-full">
            <option value="">All Realms</option>
            <optgroup
              v-for="region in ['eu', 'us', 'kr']"
              :key="region"
              :label="region.toUpperCase()"
            >
              <option
                v-for="realm in realmsByRegion[region] ?? []"
                :key="realm.slug"
                :value="realm.slug"
              >
                {{ realm.name }}
                <span v-if="realm.connectedRealms?.length > 1">
                  (+ {{ realm.connectedRealms.length - 1 }})
                </span>
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Sélecteur période -->
        <div
          class="flex items-center gap-1 rounded-xl p-1"
          style="
            background: rgba(18, 6, 50, 0.8);
            border: 1px solid rgba(174, 119, 213, 0.2);
          "
        >
          <button
            v-for="p in periods"
            :key="p.value"
            class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            :class="
              selectedPeriod === p.value
                ? 'bg-arcane-300 text-white'
                : 'text-gray-400 hover:text-white'
            "
            @click="selectedPeriod = p.value"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Stats rapides -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <UiCard :padding="true">
          <p class="text-gray-400 text-xs mb-1">Min Price</p>
          <p class="text-quality-uncommon font-display font-semibold text-lg">
            {{ formatGold(priceStats.min) }}
          </p>
        </UiCard>
        <UiCard :padding="true">
          <p class="text-gray-400 text-xs mb-1">Max Price</p>
          <p class="text-red-400 font-display font-semibold text-lg">
            {{ formatGold(priceStats.max) }}
          </p>
        </UiCard>
        <UiCard :padding="true">
          <p class="text-gray-400 text-xs mb-1">Avg Price</p>
          <p class="text-arcane-50 font-display font-semibold text-lg">
            {{ formatGold(priceStats.avg) }}
          </p>
        </UiCard>
        <UiCard :padding="true">
          <p class="text-gray-400 text-xs mb-1">Data Points</p>
          <p class="text-white font-display font-semibold text-lg">
            {{ priceStats.count }}
          </p>
        </UiCard>
      </div>

      <!-- Graphique -->
      <UiCard :padding="true" class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display font-semibold text-white">Price History</h2>
          <span class="text-gray-500 text-xs">
            {{ selectedRealm ? selectedRealm : "All Realms" }} ·
            {{ selectedPeriod }}
          </span>
        </div>

        <div v-if="pricesPending" class="flex items-center justify-center h-48">
          <UiSpinner />
        </div>

        <div
          v-else-if="!chartData.labels.length"
          class="flex items-center justify-center h-48"
        >
          <p class="text-gray-500">No price data available for this period</p>
        </div>

        <div v-else class="h-64">
          <Line v-if="isMounted" :data="chartData" :options="chartOptions" />
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
const route = useRoute();
const { searchItems, getRealms, getItemPrices } = useApi();

const itemId = computed(() => parseInt(route.params.id as string));
const selectedRealm = ref("");
const selectedPeriod = ref<"7d" | "30d" | "90d">("7d");

const periods = [
  { label: "7D", value: "7d" as const },
  { label: "30D", value: "30d" as const },
  { label: "90D", value: "90d" as const },
];

// Charge les infos de l'item
const { getItem } = useApi();
const { data: itemData, pending } = await useAsyncData(
  `item-${itemId.value}`,
  () => getItem(itemId.value),
);

// Charge les realms
const { data: realmsData } = await useAsyncData("realms", () => getRealms());

const realmsByRegion = computed(() => {
  const realms = realmsData.value ?? [];
  return realms.reduce(
    (acc, realm) => {
      if (!acc[realm.region]) acc[realm.region] = [];
      acc[realm.region].push(realm);
      return acc;
    },
    {} as Record<string, typeof realms>,
  );
});

// Charge les prix
const pricesKey = computed(
  () =>
    `item-prices-${itemId.value}-${selectedRealm.value}-${selectedPeriod.value}`,
);

const { data: pricesData, pending: pricesPending } = await useAsyncData(
  pricesKey.value,
  () =>
    getItemPrices(itemId.value, {
      realm: selectedRealm.value || undefined,
      period: selectedPeriod.value,
    }),
  { watch: [selectedRealm, selectedPeriod] },
);

// Stats prix
const priceStats = computed(() => {
  const snapshots = pricesData.value?.snapshots ?? [];
  if (!snapshots.length) return { min: 0, max: 0, avg: 0, count: 0 };

  return {
    min: Math.min(...snapshots.map((s) => s.minPrice)),
    max: Math.max(...snapshots.map((s) => s.maxPrice)),
    avg: Math.round(
      snapshots.reduce((a, s) => a + s.avgPrice, 0) / snapshots.length,
    ),
    count: snapshots.length,
  };
});

// Données du graphique
const chartData = computed(() => {
  const snapshots = pricesData.value?.snapshots ?? [];

  if (!snapshots.length) return { labels: [], datasets: [] };

  const sorted = [...snapshots].sort(
    (a, b) =>
      new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  );

  const labels = sorted.map((s) =>
    new Date(s.capturedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  );

  return {
    labels,
    datasets: [
      {
        label: "Min Price",
        data: sorted.map((s) => s.minPrice / 10000),
        borderColor: "#1eff00",
        backgroundColor: "rgba(30, 255, 0, 0.05)",
        fill: false,
        tension: 0.4,
        pointRadius: 2,
      },
      {
        label: "Avg Price",
        data: sorted.map((s) => s.avgPrice / 10000),
        borderColor: "#AF77D5",
        backgroundColor: "rgba(174, 119, 213, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      },
      {
        label: "Max Price",
        data: sorted.map((s) => s.maxPrice / 10000),
        borderColor: "#f87171",
        backgroundColor: "rgba(248, 113, 113, 0.05)",
        fill: false,
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  };
});

// Options du graphique
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#9ca3af", font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) =>
          `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}g`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#6b7280", font: { size: 10 } },
      grid: { color: "rgba(174, 119, 213, 0.08)" },
    },
    y: {
      ticks: {
        color: "#6b7280",
        font: { size: 10 },
        callback: (value: any) => `${value.toLocaleString()}g`,
      },
      grid: { color: "rgba(174, 119, 213, 0.08)" },
    },
  },
};

// Formate en gold/silver/copper
function formatGold(copper: number): string {
  if (!copper) return "—";
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  if (gold > 0) return `${gold.toLocaleString()}g ${silver}s`;
  return `${silver}s`;
}

// Couleurs qualité
const qualityColor: Record<string, string> = {
  common: "text-gray-300",
  uncommon: "text-quality-uncommon",
  rare: "text-quality-rare",
  epic: "text-quality-epic",
  legendary: "text-quality-legendary",
};

const qualityBorder: Record<string, string> = {
  common: "border-gray-700",
  uncommon: "border-quality-uncommon/30",
  rare: "border-quality-rare/30",
  epic: "border-quality-epic/30",
  legendary: "border-quality-legendary/30",
};
</script>
