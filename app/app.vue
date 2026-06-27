<script setup lang="ts">
// Adopt the stored light/dark preference as early as possible on the client.
const { init } = useTheme()
onMounted(init)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
