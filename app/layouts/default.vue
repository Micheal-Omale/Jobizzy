<script setup lang="ts">
// Full-bleed shell: sections own their own max-width / framing so hero, CTA and
// dividers can span edge-to-edge in the framed design.
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg text-text font-body transition-colors">
    <LayoutNavbar />

    <main class="w-full flex-1">
      <slot />
    </main>

    <LayoutFooter />
  </div>
</template>
