<script setup lang="ts">
// Renders the lessons' small markup without v-html: paragraphs, "- " lists, **bold**, {KEY} caps and [links](url).
import { NuxtLink } from '#components';

const props = defineProps<{ text: string }>();

const CAPS: Record<string, string> = { UP: '▲', DOWN: '▼', VM: 'V/M' };
const TOKEN = /(\*\*[^*]+\*\*|\{[A-Z]+\}|\[[^\]]+\]\([^)]+\))/g;

function inline(text: string) {
  return text.split(TOKEN).filter(Boolean).map((part) => {
    if (part.startsWith('**')) return h('strong', { class: 'font-semibold text-highlighted' }, part.slice(2, -2));
    if (/^\{[A-Z]+\}$/.test(part)) {
      const key = part.slice(1, -1);
      return h('kbd', { class: 'keycap' }, CAPS[key] ?? key);
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      return href!.startsWith('/')
        ? h(NuxtLink, { to: href, class: 'font-medium text-primary underline underline-offset-2' }, () => label)
        : h('a', { href, target: '_blank', rel: 'noopener', class: 'font-medium text-primary underline underline-offset-2' }, label);
    }
    return part;
  });
}

const Render = () => props.text.split(/\n\n+/).map((block) => {
  const lines = block.split('\n');
  if (lines.every((l) => l.startsWith('- '))) {
    return h('ul', { class: 'my-2 list-disc space-y-1 ps-5 marker:text-dimmed' }, lines.map((l) => h('li', inline(l.slice(2)))));
  }
  return h('p', { class: 'my-2' }, inline(block));
});
</script>

<template>
  <div class="rich-text leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    <Render />
  </div>
</template>
