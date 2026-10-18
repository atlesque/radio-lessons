<script setup lang="ts">
import type { Theme } from '../composables/useTheme';
const props = defineProps<{ labels?: Record<Theme, string> }>();
const { theme, set } = useTheme();
const order: Theme[] = ['light', 'dark', 'system'];
const icons: Record<Theme, string> = { light: 'i-lucide-sun', dark: 'i-lucide-moon', system: 'i-lucide-monitor' };
const label = computed(() => props.labels?.[theme.value] ?? `Theme: ${theme.value}`);
const next = () => set(order[(order.indexOf(theme.value) + 1) % order.length]!);
</script>

<template>
  <UButton :icon="icons[theme]" color="neutral" variant="ghost" square :aria-label="label" :title="label" @click="next" />
</template>
