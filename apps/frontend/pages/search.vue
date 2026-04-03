<template>
  <div>
    <!-- Header de page -->
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white mb-2">
        Search Items
      </h1>
      <p class="text-gray-400">
        Find any item and track its price across all realms
      </p>
    </div>

    <!-- Barre de recherche -->
    <div class="relative mb-8">
      <div
        class="absolute inset-y-0 left-4 flex items-center pointer-events-none"
      >
        <svg
          class="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for an item... (e.g. Zin'anthid, Flask, Gem)"
        class="input w-full pl-12 pr-4 py-4 text-base"
      />
      <div
        v-if="searchQuery"
        class="absolute inset-y-0 right-4 flex items-center"
      >
        <button
          class="text-gray-500 hover:text-white transition-colors"
          @click="searchQuery = ''"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Résultats -->
    <div
      v-if="pending"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="i in 9"
        :key="i"
        class="h-24 rounded-2xl animate-pulse"
        style="background: rgba(46, 22, 91, 0.3)"
      />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-red-400">Failed to load items. Is the backend running?</p>
    </div>

    <div
      v-else-if="items.length === 0 && debouncedQuery"
      class="text-center py-16"
    >
      <p class="text-gray-500 text-lg">
        No items found for "{{ debouncedQuery }}"
      </p>
    </div>

    <div
      v-else-if="items.length === 0 && !debouncedQuery"
      class="text-center py-16"
    >
      <p class="text-gray-600 text-lg">Start typing to search items</p>
    </div>

    <div v-else>
      <!-- Infos pagination -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-gray-500 text-sm">
          {{ pagination.total.toLocaleString() }} items found
        </p>
        <p class="text-gray-600 text-sm">
          Page {{ pagination.page }} / {{ pagination.pages }}
        </p>
      </div>

      <!-- Grille d'items -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="`/items/${item.id}`"
          class="group"
        >
          <UiCard hoverable :padding="true">
            <div class="flex items-center gap-4">
              <!-- Icône item -->
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border"
                :class="
                  qualityBorder[item.quality.toLowerCase()] ?? 'border-gray-700'
                "
                style="background: rgba(18, 6, 50, 0.8)"
              >
                <img
                  v-if="item.iconUrl"
                  :src="item.iconUrl"
                  :alt="item.name"
                  class="w-10 h-10 rounded-lg"
                />
                <span v-else class="text-gray-600 text-xs">?</span>
              </div>

              <!-- Infos item -->
              <div class="flex-1 min-w-0">
                <p
                  class="font-medium truncate transition-colors group-hover:text-arcane-50"
                  :class="
                    qualityColor[item.quality.toLowerCase()] ?? 'text-white'
                  "
                >
                  {{ item.name }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <UiBadge :variant="item.quality.toLowerCase() as any">
                    {{ item.quality }}
                  </UiBadge>
                  <span class="text-gray-600 text-xs">#{{ item.id }}</span>
                </div>
              </div>

              <!-- Flèche -->
              <span
                class="text-gray-600 group-hover:text-arcane-100 transition-colors"
                >→</span
              >
            </div>
          </UiCard>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.pages > 1"
        class="flex items-center justify-center gap-2"
      >
        <button
          :disabled="pagination.page === 1"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :class="
            pagination.page === 1
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-arcane-100 hover:bg-arcane-300/20'
          "
          @click="currentPage--"
        >
          ← Previous
        </button>

        <div class="flex items-center gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="w-9 h-9 rounded-lg text-sm font-medium transition-all"
            :class="
              page === pagination.page
                ? 'bg-arcane-300 text-white'
                : 'text-gray-400 hover:bg-arcane-300/20 hover:text-white'
            "
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>

        <button
          :disabled="pagination.page === pagination.pages"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :class="
            pagination.page === pagination.pages
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-arcane-100 hover:bg-arcane-300/20'
          "
          @click="currentPage++"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { searchItems } = useApi();

const searchQuery = ref("");
const currentPage = ref(1);
const debouncedQuery = useDebounce(searchQuery, 300);

// Reset page quand la recherche change
watch(debouncedQuery, () => {
  currentPage.value = 1;
});

const { data, pending, error } = await useAsyncData(
  "items-search",
  () =>
    searchItems({
      q: debouncedQuery.value,
      page: currentPage.value,
      limit: 18,
    }),
  { watch: [debouncedQuery, currentPage] },
);

const items = computed(() => data.value?.items ?? []);
const pagination = computed(
  () =>
    data.value?.pagination ?? {
      page: 1,
      limit: 18,
      total: 0,
      pages: 0,
    },
);

// Pages visibles pour la pagination
const visiblePages = computed(() => {
  const current = pagination.value.page;
  const total = pagination.value.pages;
  const pages: number[] = [];

  for (
    let i = Math.max(1, current - 2);
    i <= Math.min(total, current + 2);
    i++
  ) {
    pages.push(i);
  }

  return pages;
});

// Couleurs par qualité
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
