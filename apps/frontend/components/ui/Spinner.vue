<template>
  <div class="flex items-center justify-center" :class="sizes[size ?? 'md']">
    <div
      class="animate-spin rounded-full border-2 border-void-300"
      :class="[sizes[size ?? 'md'], 'border-t-arcane-100']"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ size?: "sm" | "md" | "lg" }>();

const sizes = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};
</script>
