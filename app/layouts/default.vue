<script setup lang="ts">
// 1. External imports
// 2. Internal imports
// 3. Props and emits
// 4. State
// 5. Derived values
// 6. Handlers
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-text-primary font-sans">
    <LayoutNavbar />
    
    <main class="flex-1 w-full max-w-[1440px] mx-auto bg-surface">
      <slot />
    </main>
    
    <LayoutFooter />
  </div>
</template>
