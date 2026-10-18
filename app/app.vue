<script setup lang="ts">
const { lang } = useLang();
useHead({ htmlAttrs: { lang } });
useProgressSync();
</script>

<template>
  <UApp>
    <AppHeader />
    <NuxtPage />
  </UApp>
</template>
