<template>
  <div
    class="relative rounded-2xl border transition-all duration-300 overflow-hidden"
    :class="[
      hoverable
        ? 'hover:border-arcane-bright hover:shadow-arcane cursor-pointer'
        : '',
      padding ? 'p-6' : '',
    ]"
    style="
      background: linear-gradient(
        135deg,
        rgba(46, 22, 91, 0.35) 0%,
        rgba(18, 6, 50, 0.7) 100%
      );
      border-color: rgba(174, 119, 213, 0.2);
      box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(174, 119, 213, 0.08);
    "
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hoverable?: boolean;
  padding?: boolean;
}>();
</script>
