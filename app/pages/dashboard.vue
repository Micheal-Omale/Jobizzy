<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { user, signOut } = useAuth();

const isSigningOut = ref(false);

async function handleSignOut(): Promise<void> {
  if (isSigningOut.value) return;
  isSigningOut.value = true;
  await signOut();
}
</script>

<template>
  <div class="min-h-[60vh] w-full border-x border-border bg-surface px-6 py-12 md:px-8">
    <div class="mx-auto max-w-[1160px]">
      <div class="flex flex-col gap-1">
        <h1 class="text-[30px] font-semibold leading-9 text-text-primary">Welcome back</h1>
        <ClientOnly>
          <p v-if="user?.email" class="text-[14px] text-text-secondary">
            Signed in as {{ user.email }}
          </p>
        </ClientOnly>
      </div>

      <div
        class="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
      >
        <h2 class="text-[16px] font-semibold leading-6 text-text-primary">
          Your dashboard is on the way
        </h2>
        <p class="mt-2 max-w-xl text-[14px] leading-5 text-text-secondary">
          Authentication is working and your account is set up. Stats, recent activity, and analytics
          charts will live here once the data and tracking pieces are built. For now, this is a
          placeholder so you can confirm the sign-in flow end to end.
        </p>

        <button
          type="button"
          :disabled="isSigningOut"
          class="mt-6 rounded-md border border-border bg-surface px-4 py-2 text-[14px] font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
          @click="handleSignOut"
        >
          {{ isSigningOut ? "Signing out…" : "Sign out" }}
        </button>
      </div>
    </div>
  </div>
</template>
