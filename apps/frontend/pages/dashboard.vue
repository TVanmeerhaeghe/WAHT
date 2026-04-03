<template>
  <div>
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white mb-2">
        Welcome back, <span class="text-gradient">{{ user?.battletag }}</span>
      </h1>
      <p class="text-gray-400">Your personal auction house dashboard</p>
    </div>

    <div class="grid sm:grid-cols-3 gap-6">
      <UiCard :padding="true">
        <p class="text-gray-400 text-sm mb-2">Region</p>
        <p class="text-white font-display font-semibold text-xl uppercase">
          {{ user?.region ?? "—" }}
        </p>
      </UiCard>

      <UiCard :padding="true">
        <p class="text-gray-400 text-sm mb-2">Active Alerts</p>
        <p class="text-white font-display font-semibold text-xl">0</p>
      </UiCard>

      <UiCard :padding="true">
        <p class="text-gray-400 text-sm mb-2">Tracked Items</p>
        <p class="text-white font-display font-semibold text-xl">0</p>
      </UiCard>
    </div>

    <div
      class="mt-12 text-center py-16 border border-dashed rounded-2xl"
      style="border-color: rgba(174, 119, 213, 0.2)"
    >
      <p class="text-gray-500 mb-4">Alerts and tracked items coming soon</p>
      <NuxtLink to="/search" class="btn-primary text-sm">
        Search Items →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth();

// Redirige si non connecté
if (!user.value) {
  navigateTo("/");
}
</script>
