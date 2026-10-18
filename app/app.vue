<script setup lang="ts">
const { lang } = useLang();
useHead({ htmlAttrs: { lang } });
</script>

<template>
  <UApp>
    <AppHeader />
    <NuxtPage />
  </UApp>
</template>
