<template>
  <UiCard :padding="true" hoverable>
    <div class="flex items-start justify-between mb-3">
      <span class="text-gray-400 text-sm font-medium">{{ label }}</span>
      <div
        v-if="trend !== undefined"
        class="flex items-center gap-1 text-xs font-medium"
        :class="trend >= 0 ? 'text-quality-uncommon' : 'text-red-400'"
      >
        {{ trend >= 0 ? "↑" : "↓" }}
        {{ Math.abs(trend) }}%
      </div>
    </div>
    <div class="text-2xl font-display font-semibold text-white">
      {{ value }}
    </div>
    <div v-if="subtitle" class="text-gray-500 text-xs mt-1">{{ subtitle }}</div>
  </UiCard>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
}>();
</script>
