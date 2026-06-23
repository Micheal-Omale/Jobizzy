<script setup lang="ts">
</script>

<template>
  <footer class="w-full bg-surface border-t border-border py-8 px-8 mt-12">
    <div class="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <NuxtLink to="/" class="flex items-center">
        <img src="/public/logo.png" alt="JobPilot" class="h-8 w-auto" />
      </NuxtLink>

      <div class="flex items-center gap-6">
        <NuxtLink to="/dashboard" class="text-[14px] font-medium text-text-dark hover:text-text-primary">
          Dashboard
        </NuxtLink>
        <NuxtLink to="#" class="text-[14px] font-medium text-text-dark hover:text-text-primary">
          Privacy Policy
        </NuxtLink>
        <NuxtLink to="#" class="text-[14px] font-medium text-text-dark hover:text-text-primary">
          Terms & Condition
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
