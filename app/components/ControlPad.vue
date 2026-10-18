<script setup lang="ts">
// The radio's keys as plain buttons under the 3D view: precise on touch screens, usable with a keyboard
// and screen readers, and a fallback when WebGL is unavailable.
import type { View } from '~/radio/controls';
import type { Session } from '~/radio/session';
import type { Key } from '~/radio/sim';

const props = defineProps<{ session: Session; view: View; highlight?: string[] }>();
const emit = defineEmits<{ 'update:view': [view: View] }>();
const { t, lang } = useLang();
const { radio, input, audio } = props.session;

const sound = ref(false);
async function toggleSound() {
  if (sound.value) { audio.disable(); sound.value = false; return; }
  try { await audio.enable(); sound.value = true; } catch { sound.value = false; }
}
onBeforeUnmount(() => audio.disable());

const status = computed(() => { void props.session.tick.value; return radio.describe(lang.value); });
const held = (k: Key) => { void props.session.tick.value; return radio.isHeld(k); };
const latchedList = computed(() => input.latched.value);

const KEYS: { key: Key; label: string; sub?: string; cls?: string }[] = [
  { key: 'PWR', label: 'PWR', cls: 'pwr' },
  { key: 'UP', label: '▲' },
  { key: 'DOWN', label: '▼' },
  { key: 'BAND', label: 'BAND', sub: 'LOCK' },
  { key: 'TS', label: 'TS', sub: 'SET' },
  { key: 'MODE', label: 'MODE', sub: 'SCAN' },
  { key: 'VM', label: 'V/M', sub: 'S.MW' },
  { key: 'FUNC', label: 'FUNC' },
  { key: 'SQL', label: 'SQL' },
];

const capture = (e: PointerEvent) => { try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* pointer already gone */ } };
function down(e: PointerEvent, key: Key) {
  capture(e);
  input.down(key, `pad-${e.pointerId}`);
}
function up(e: PointerEvent) { input.up(`pad-${e.pointerId}`); }
function keyDown(e: KeyboardEvent, key: Key) {
  if ((e.key !== 'Enter' && e.key !== ' ') || e.repeat) return;
  e.preventDefault();
  e.stopPropagation();
  input.down(key, 'pad-kbd');
}
function keyUp(e: KeyboardEvent) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.stopPropagation();
  input.up('pad-kbd');
}

// Dial buttons repeat while held.
let repeat: ReturnType<typeof setTimeout> | null = null;
function dialDown(e: PointerEvent, dir: 1 | -1) {
  capture(e);
  input.dial(dir);
  const again = (ms: number) => { repeat = setTimeout(() => { input.dial(dir); again(110); }, ms); };
  again(420);
}
function dialUp() { if (repeat) clearTimeout(repeat); repeat = null; }

const views: { v: View; label: { en: string; nl: string } }[] = [
  { v: 'front', label: { en: 'Front', nl: 'Voor' } },
  { v: 'left', label: { en: 'Left', nl: 'Links' } },
  { v: 'right', label: { en: 'Right', nl: 'Rechts' } },
  { v: 'top', label: { en: 'Top', nl: 'Boven' } },
  { v: 'back', label: { en: 'Back', nl: 'Achter' } },
  { v: 'overview', label: { en: 'All', nl: 'Geheel' } },
];
</script>

<template>
  <div class="flex flex-col gap-2 border-t border-default bg-default/70 px-3 py-2.5 backdrop-blur">
    <div class="flex flex-wrap items-center gap-1.5 sm:flex-nowrap sm:overflow-x-auto sm:pb-0.5" role="group" :aria-label="t({ en: 'Radio keys', nl: 'Toetsen van de radio' })">
      <button
        v-for="k in KEYS"
        :key="k.key"
        type="button"
        class="padkey"
        :class="[k.cls, { held: held(k.key), latched: latchedList.includes(k.key), lit: highlight?.includes(k.key) }]"
        :aria-pressed="held(k.key)"
        :aria-label="k.key === 'UP' ? t({ en: 'Volume up', nl: 'Volume omhoog' }) : k.key === 'DOWN' ? t({ en: 'Volume down', nl: 'Volume omlaag' }) : k.label"
        @pointerdown.prevent="down($event, k.key)"
        @pointerup="up"
        @pointercancel="up"
        @keydown="keyDown($event, k.key)"
        @keyup="keyUp"
        @contextmenu.prevent
      >
        <span class="leading-none">{{ k.label }}</span>
        <span v-if="k.sub" class="text-[0.58rem] leading-none text-[#f0783c]">{{ k.sub }}</span>
      </button>
      <span class="mx-1 hidden h-8 w-px shrink-0 bg-accented sm:block" />
      <div class="flex shrink-0 items-center gap-1" :class="{ 'dial-lit': highlight?.includes('DIAL') }">
        <button type="button" class="padkey" :aria-label="t({ en: 'Turn the dial down', nl: 'Draai de knop terug' })" @pointerdown.prevent="dialDown($event, -1)" @pointerup="dialUp" @pointercancel="dialUp" @keydown.enter.space.prevent.stop="input.dial(-1)">
          <UIcon name="i-lucide-rotate-ccw" class="size-4" />
        </button>
        <span class="text-[0.65rem] font-bold tracking-wide text-muted">DIAL</span>
        <button type="button" class="padkey" :aria-label="t({ en: 'Turn the dial up', nl: 'Draai de knop verder' })" @pointerdown.prevent="dialDown($event, 1)" @pointerup="dialUp" @pointercancel="dialUp" @keydown.enter.space.prevent.stop="input.dial(1)">
          <UIcon name="i-lucide-rotate-cw" class="size-4" />
        </button>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3">
      <UButton
        :icon="sound ? 'i-lucide-volume-2' : 'i-lucide-volume-x'"
        size="xs"
        :color="sound ? 'primary' : 'neutral'"
        :variant="sound ? 'solid' : 'outline'"
        :aria-label="sound ? t({ en: 'Sound on', nl: 'Geluid aan' }) : t({ en: 'Sound off', nl: 'Geluid uit' })"
        :aria-pressed="sound"
        @click="toggleSound"
      >
        <span class="hidden sm:inline">{{ sound ? t({ en: 'Sound on', nl: 'Geluid aan' }) : t({ en: 'Sound off', nl: 'Geluid uit' }) }}</span>
      </UButton>
      <div class="flex min-w-0 items-center gap-0.5 overflow-x-auto" role="group" :aria-label="t({ en: 'Camera view', nl: 'Camerastandpunt' })">
        <UButton
          v-for="o in views"
          :key="o.v"
          :label="t(o.label)"
          size="xs"
          color="neutral"
          :variant="view === o.v ? 'soft' : 'ghost'"
          @click="emit('update:view', o.v)"
        />
      </div>
      <p v-if="latchedList.length" class="text-xs font-semibold text-secondary">
        {{ t({ en: 'Held:', nl: 'Ingedrukt:' }) }} {{ latchedList.join(' + ') }} · {{ t({ en: 'click again to let go', nl: 'klik nog eens om los te laten' }) }}
      </p>
      <p class="ms-auto hidden truncate text-xs tabular-nums text-muted sm:block" aria-live="off">{{ status }}</p>
    </div>
  </div>
</template>

<style scoped>
.padkey {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 2.45rem;
  height: 2.35rem;
  padding: 0 0.45rem;
  flex-shrink: 0;
  border-radius: 0.45rem;
  background: #1d1e21;
  color: #f2f2f2;
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.25);
  touch-action: none;
  user-select: none;
  transition: transform 80ms, box-shadow 80ms;
}
@media (min-width: 640px) { .padkey { min-width: 2.6rem; height: 2.5rem; } }
.padkey:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 2px; }
.padkey.pwr { background: #f0783c; color: #1d1e21; }
.padkey.held, .padkey.latched { transform: translateY(1px); box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.6); }
.padkey.latched { outline: 2px solid #d4f578; outline-offset: 1px; }
.padkey.lit, .dial-lit .padkey { box-shadow: 0 0 0 2px #d4f578, 0 0 12px rgba(212, 245, 120, 0.6); }
</style>
