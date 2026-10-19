<script setup lang="ts">
// A pulsing outline of the IC-R5 that holds the stage while the 3D radio is built (and before the page hydrates).
const { t } = useLang();
</script>

<template>
  <div class="pointer-events-none absolute inset-0 grid place-items-center" role="status">
    <div class="relative mt-4 flex aspect-[58/86] h-[56%] max-h-[320px] flex-col gap-4 rounded-3xl bg-accented/70 p-5 animate-pulse motion-reduce:animate-none" aria-hidden="true">
      <!-- Dial and antenna socket on top -->
      <div class="absolute -top-3 left-[16%] h-3 w-[24%] rounded-t-md bg-accented/70" />
      <div class="absolute -top-4 right-[18%] h-4 w-[12%] rounded-t-sm bg-accented/70" />
      <!-- Display, then the key pad -->
      <div class="h-[34%] shrink-0 rounded-lg bg-default/80" />
      <div class="grid flex-1 grid-cols-3 gap-2.5">
        <div v-for="i in 9" :key="i" class="rounded-md bg-default/60" />
      </div>
    </div>
    <span class="sr-only">{{ t({ en: 'Building the radio…', nl: 'De radio wordt gebouwd…' }) }}</span>
  </div>
</template>
