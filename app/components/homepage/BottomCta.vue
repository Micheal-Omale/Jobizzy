<script setup lang="ts">
const { track } = useAnalytics();
</script>

<template>
  <section class="relative py-24 border-t border-border overflow-hidden flex flex-col items-center text-center">
    <!-- Decorative Background Blob/Gradient -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-t from-accent-muted via-background to-info-lightest opacity-60 pointer-events-none"></div>
    <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-light rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
    
    <div class="max-w-3xl mx-auto px-6">
      <h2 class="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">
        Your next job search can feel a lot less overwhelming
      </h2>
      <p class="mt-6 text-[18px] text-text-secondary leading-relaxed">
        Set up your profile, upload your resume, and start finding matches in minutes.
      </p>
      
      <div class="mt-10 flex items-center justify-center gap-4">
        <NuxtLink to="/login" class="bg-text-darkest text-surface px-6 py-3 rounded-md text-[16px] font-medium hover:bg-black transition-colors inline-flex items-center gap-2" @click="track('cta_clicked', { location: 'bottom_cta', label: 'Get Started', target: '/login' })">
          Get Started
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </NuxtLink>
        <NuxtLink to="/login" class="bg-surface text-text-primary border border-border px-6 py-3 rounded-md text-[16px] font-medium hover:bg-surface-secondary transition-colors" @click="track('cta_clicked', { location: 'bottom_cta', label: 'Find Your First Match', target: '/login' })">
          Find Your First Match
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
