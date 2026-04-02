<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="variantClasses[variant ?? 'common']"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
type Quality = "common" | "uncommon" | "rare" | "epic" | "legendary";

defineProps<{ variant?: Quality }>();

const variantClasses: Record<Quality, string> = {
  common: "bg-gray-800 text-quality-common",
  uncommon:
    "bg-green-900/20 text-quality-uncommon border border-quality-uncommon/20",
  rare: "bg-blue-900/20 text-quality-rare border border-quality-rare/20",
  epic: "bg-purple-900/20 text-quality-epic border border-quality-epic/20",
  legendary:
    "bg-orange-900/20 text-quality-legendary border border-quality-legendary/20",
};
</script>
