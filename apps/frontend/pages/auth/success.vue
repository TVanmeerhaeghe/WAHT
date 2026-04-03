<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <UiSpinner size="lg" class="mb-4" />
      <p class="text-gray-400">Connecting to Battle.net...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchMe } = useAuth();

onMounted(async () => {
  await fetchMe();
  navigateTo("/dashboard");
});
</script>
