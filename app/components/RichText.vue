<script setup lang="ts">
// Renders the lessons' small markup without v-html: paragraphs, "- " lists, **bold**, {KEY} caps and [links](url).
// The first use of each glossary term in a block becomes a clickable explanation.
import { NuxtLink } from '#components';
import GlossaryTerm from './GlossaryTerm.vue';
import { findTerms } from '~/lessons/glossary';

const props = withDefaults(defineProps<{ text: string; glossary?: boolean }>(), { glossary: true });
const { lang } = useLang();

const CAPS: Record<string, string> = { UP: '▲', DOWN: '▼', VM: 'V/M' };
const TOKEN = /(\*\*[^*]+\*\*|\{[A-Z]+\}|\[[^\]]+\]\([^)]+\))/g;

function terms(text: string, seen: Set<string>) {
  if (!props.glossary) return [text];
  return findTerms(text, lang.value, seen).map((p) => (typeof p === 'string' ? p : h(GlossaryTerm, { id: p.id, text: p.text })));
}

function inline(text: string, seen: Set<string>) {
  return text.split(TOKEN).filter(Boolean).flatMap((part) => {
    if (part.startsWith('**')) return [h('strong', { class: 'font-semibold text-highlighted' }, terms(part.slice(2, -2), seen))];
    if (/^\{[A-Z]+\}$/.test(part)) {
      const key = part.slice(1, -1);
      return [h('kbd', { class: 'keycap' }, CAPS[key] ?? key)];
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      return [href!.startsWith('/')
        ? h(NuxtLink, { to: href, class: 'font-medium text-primary underline underline-offset-2' }, () => label)
        : h('a', { href, target: '_blank', rel: 'noopener', class: 'font-medium text-primary underline underline-offset-2' }, label)];
    }
    return terms(part, seen);
  });
}

const Render = () => {
  const seen = new Set<string>();
  return props.text.split(/\n\n+/).map((block) => {
    const lines = block.split('\n');
    if (lines.every((l) => l.startsWith('- '))) {
      return h('ul', { class: 'my-2 list-disc space-y-1 ps-5 marker:text-dimmed' }, lines.map((l) => h('li', inline(l.slice(2), seen))));
    }
    return h('p', { class: 'my-2' }, inline(block, seen));
  });
};
</script>

<template>
  <div class="rich-text leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    <Render />
  </div>
</template>
