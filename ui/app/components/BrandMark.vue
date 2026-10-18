<script setup lang="ts">
// The tile logo and "radio lessons." word mark.
withDefaults(defineProps<{ size?: number }>(), { size: 28 });
</script>

<template>
  <span class="inline-flex items-center gap-2.5 font-bold tracking-tight text-highlighted">
    <img src="/favicon.svg" :width="size" :height="size" alt="" class="shrink-0">
    <span class="text-[1.05rem]">radio lessons<span class="text-secondary">.</span></span>
  </span>
</template>
