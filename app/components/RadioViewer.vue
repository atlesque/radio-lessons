<script setup lang="ts">
// The 3D IC-R5: renders the model, turns pointer, wheel and keyboard input into radio actions,
// lights up the parts a lesson step points at and flies the camera to show them.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CONTROL_INFO, VIEWS, type Control, type View } from '~/radio/controls';
import { fitDistance, frameRadio } from '~/radio/framing';
import { loadLcdFonts } from '~/radio/lcd';
import { buildRadio, type RadioModel } from '~/radio/model';
import type { Session } from '~/radio/session';
import { KEYS, type Key } from '~/radio/sim';

const props = withDefaults(defineProps<{
  session: Session;
  highlight?: Control[];
  gesture?: 'press' | 'hold' | 'rotate' | 'click' | null;
  view?: View;
  /** Slowly turn the radio while nobody touches it (home page). */
  idleSpin?: boolean;
  keyboard?: boolean;
  /** Scroll over the radio to zoom out. Off where the page itself should scroll (home page). */
  wheelZoom?: boolean;
}>(), { highlight: () => [], gesture: null, view: 'front', idleSpin: false, keyboard: true, wheelZoom: true });
const emit = defineEmits<{ pick: [control: Control] }>();
const { t, lang } = useLang();

const host = ref<HTMLDivElement>();
const hoverName = ref('');
const hoverPos = ref({ x: 0, y: 0 });
const callout = ref<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
const ready = ref(false);
const failed = ref(false);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let model: RadioModel | null = null;
let frame = 0;
let last = performance.now();
let hovered: Control | null = null;
let idleSince = performance.now();
// Camera moves interpolate direction (on the sphere), target and zoom, and are fitted on every frame.
let tween: { from: THREE.Spherical; to: THREE.Spherical; tFrom: THREE.Vector3; tTo: THREE.Vector3; zFrom: number; start: number; ms: number } | null = null;
/** How far out from the fitted distance the user zoomed (1 = fitted; never closer, so nothing is cropped). */
let zoomOut = 1;
const MAX_ZOOM_OUT = 2.4;
const FOV = 30;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let dialDrag: { id: number; x: number; y: number; acc: number } | null = null;
let wheelAcc = 0;
let offEvents: (() => void) | null = null;

const radio = props.session.radio;
const input = props.session.input;

function pick(e: { clientX: number; clientY: number }): Control | null {
  if (!renderer || !model) return null;
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const shown = (o: THREE.Object3D | null): boolean => !o || (o.visible && shown(o.parent));
  const hit = raycaster.intersectObjects(model.pickables, true).find((h) => shown(h.object));
  return (hit?.object.userData.control as Control | undefined) ?? null;
}

const isKey = (c: Control | null): c is Key => !!c && (KEYS as string[]).includes(c);

function onPointerDown(e: PointerEvent) {
  idleSince = performance.now();
  const c = pick(e);
  if (!c) return;
  e.preventDefault();
  controls.enabled = false;
  try { renderer!.domElement.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
  if (c === 'DIAL') { dialDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, acc: 0 }; emit('pick', c); return; }
  if (isKey(c)) input.down(c, `p${e.pointerId}`);
  // The physical parts: slide the cover, swap the cells, screw on the antenna.
  if (c === 'BATT') radio.toggleCover();
  if (c === 'CELLS') radio.toggleCells();
  if (c === 'ANT' && !radio.state.antenna) radio.attachAntenna();
  emit('pick', c);
}

function onPointerMove(e: PointerEvent) {
  if (dialDrag && e.pointerId === dialDrag.id) {
    // Drag sideways or up/down across the knob: one detent per 16 px.
    dialDrag.acc += (e.clientX - dialDrag.x) - (e.clientY - dialDrag.y);
    dialDrag.x = e.clientX; dialDrag.y = e.clientY;
    while (Math.abs(dialDrag.acc) >= 16) {
      const dir = dialDrag.acc > 0 ? 1 : -1;
      input.dial(dir);
      dialDrag.acc -= dir * 16;
    }
    return;
  }
  const c = e.pointerType === 'mouse' ? pick(e) : null;
  hovered = c;
  if (renderer) renderer.domElement.style.cursor = c ? (c === 'DIAL' ? 'ew-resize' : 'pointer') : 'grab';
  const r = host.value!.getBoundingClientRect();
  hoverPos.value = { x: e.clientX - r.left, y: e.clientY - r.top };
  hoverName.value = c ? t(CONTROL_INFO[c].name) : '';
}

function onPointerUp(e: PointerEvent) {
  if (dialDrag && e.pointerId === dialDrag.id) dialDrag = null;
  input.up(`p${e.pointerId}`);
  controls.enabled = true;
}

function onWheel(e: WheelEvent) {
  const c = pick(e);
  if (c !== 'DIAL' && !props.wheelZoom) return;
  e.preventDefault();
  e.stopPropagation();
  if (c !== 'DIAL') {
    // Scrolling zooms between the fitted view and further out; the radio never fills more than the frame.
    zoomOut = THREE.MathUtils.clamp(zoomOut * Math.exp(e.deltaY * 0.0015), 1, MAX_ZOOM_OUT);
    idleSince = performance.now();
    return;
  }
  // Scrolling over the knob turns it.
  wheelAcc += e.deltaY + e.deltaX;
  while (Math.abs(wheelAcc) >= 40) {
    const dir = wheelAcc > 0 ? -1 : 1;
    input.dial(dir);
    wheelAcc += dir * 40;
  }
}

const KEYMAP: Record<string, Key> = { p: 'PWR', b: 'BAND', t: 'TS', m: 'MODE', v: 'VM', f: 'FUNC', s: 'SQL', ArrowUp: 'UP', ArrowDown: 'DOWN' };
function typing(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  return !!el?.closest('input, textarea, select, [contenteditable], [role="dialog"]') || e.metaKey || e.ctrlKey || e.altKey;
}
function onKeyDown(e: KeyboardEvent) {
  if (!props.keyboard || typing(e)) return;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ',' || e.key === '.') {
    e.preventDefault();
    input.dial(e.key === 'ArrowRight' || e.key === '.' ? 1 : -1);
    return;
  }
  const k = KEYMAP[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (!k) return;
  e.preventDefault();
  if (e.repeat) return;
  radio.keyDown(k);
}
function onKeyUp(e: KeyboardEvent) {
  if (!props.keyboard) return;
  const k = KEYMAP[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (k) radio.keyUp(k);
}

const _dir = new THREE.Vector3();
const _ideal = new THREE.Vector3();
const _sph = new THREE.Spherical();

function flyTo(view: View, ms = 750) {
  if (!controls) return;
  const dir = new THREE.Vector3(...VIEWS[view].dir).normalize();
  const to = frameRadio(dir, camera.aspect, FOV, new THREE.Vector3(), fit()).target;
  const from = new THREE.Spherical().setFromVector3(_dir.subVectors(camera.position, controls.target));
  const toSph = new THREE.Spherical().setFromVector3(dir);
  // Turn the short way round.
  if (toSph.theta - from.theta > Math.PI) toSph.theta -= Math.PI * 2;
  if (from.theta - toSph.theta > Math.PI) toSph.theta += Math.PI * 2;
  tween = { from, to: toSph, tFrom: controls.target.clone(), tTo: to, zFrom: zoomOut, start: performance.now(), ms };
  zoomOut = 1;
}

/** What the camera must keep in frame: the antenna only when it's on, the cover when it's slid off. */
const fit = () => ({ antenna: radio.state.antenna, coverOff: radio.state.coverOpen });

let distance = 0;
/** Puts the camera at `dir` from `target`, at the fitted distance times the zoom (eased when `ease` > 0). */
function place(target: THREE.Vector3, dir: THREE.Vector3, zoom: number, ease = 0) {
  controls.target.copy(target);
  const goal = fitDistance(target, dir, camera.aspect, FOV, fit()) * zoom;
  distance = ease > 0 && distance > 0 ? distance + (goal - distance) * ease : goal;
  camera.position.copy(target).addScaledVector(dir, distance);
  camera.lookAt(target);
}

function resize() {
  if (!renderer || !host.value) return;
  const { clientWidth: w, clientHeight: h } = host.value;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function loop() {
  frame = requestAnimationFrame(loop);
  if (!renderer || !model || document.hidden) return;
  const now = performance.now();
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  for (const k of KEYS) model.setPressed(k, radio.isHeld(k));
  model.drawLcd(radio.lcd(now));
  model.update(dt, now / 1000, props.highlight, hovered, radio.state);
  if (tween) {
    const k = Math.min(1, (now - tween.start) / tween.ms);
    const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
    _sph.set(1, THREE.MathUtils.lerp(tween.from.phi, tween.to.phi, e), THREE.MathUtils.lerp(tween.from.theta, tween.to.theta, e));
    _dir.setFromSpherical(_sph);
    place(_ideal.lerpVectors(tween.tFrom, tween.tTo, e), _dir, THREE.MathUtils.lerp(tween.zFrom, 1, e));
    if (k >= 1) tween = null;
  } else {
    if (props.idleSpin && now - idleSince > 4000) controls.autoRotate = true;
    controls.update();
    // Whatever the user did, re-centre and re-fit for the new angle and the current viewport.
    _dir.subVectors(camera.position, controls.target).normalize();
    frameRadio(_dir, camera.aspect, FOV, _ideal, fit());
    // Eased, so the camera glides back when the antenna goes on or the cover comes off.
    const k = 1 - Math.exp(-dt * 10);
    place(controls.target.lerp(_ideal, k), _dir, zoomOut, k);
  }
  renderer.render(scene, camera);
  updateCallout();
}

const _v = new THREE.Vector3();
function updateCallout() {
  const c = props.highlight[0];
  if (!c || !model || !props.gesture || !host.value) { callout.value.visible = false; return; }
  _v.copy(model.anchors[c]).applyMatrix4(model.group.matrixWorld).project(camera);
  const { clientWidth: w, clientHeight: h } = host.value;
  const x = (_v.x * 0.5 + 0.5) * w, y = (-_v.y * 0.5 + 0.5) * h;
  const inside = _v.z < 1 && x > 0 && x < w && y > 0 && y < h;
  if (Math.abs(callout.value.x - x) > 0.5 || Math.abs(callout.value.y - y) > 0.5 || callout.value.visible !== inside) {
    callout.value = { x, y, visible: inside };
  }
}

const gestureText = computed(() => {
  switch (props.gesture) {
    case 'press': return t({ en: 'Press', nl: 'Druk' });
    case 'hold': return t({ en: 'Hold 1 s', nl: 'Houd 1 s in' });
    case 'rotate': return t({ en: 'Turn', nl: 'Draai' });
    case 'click': return t({ en: 'Click', nl: 'Klik' });
    default: return '';
  }
});

onMounted(async () => {
  const el = host.value!;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    failed.value = true;
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  // Absolutely positioned so the canvas's pixel size never feeds back into the layout (retina screens).
  renderer.domElement.className = 'absolute inset-0 block size-full touch-none select-none outline-none';
  renderer.domElement.style.cursor = 'grab';
  el.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#ffffff', '#30343a', 0.55));
  const key = new THREE.DirectionalLight('#ffffff', 1.5);
  key.position.set(120, 260, 260);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#bcd2ff', 0.7);
  rim.position.set(-260, 120, -180);
  scene.add(rim);

  camera = new THREE.PerspectiveCamera(FOV, 1, 1, 5000);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.enablePan = false;
  // Zoom is automatic (see place()); scrolling only zooms out, in onWheel.
  controls.enableZoom = false;
  controls.autoRotateSpeed = 0.8;
  controls.addEventListener('start', () => { tween = null; idleSince = performance.now(); controls.autoRotate = false; });

  await loadLcdFonts();
  await document.fonts.load(`800 40px "Plus Jakarta Sans"`).catch(() => undefined);
  model = buildRadio(renderer);
  scene.add(model.group);
  resize();
  const dir = new THREE.Vector3(...VIEWS[props.view].dir).normalize();
  place(frameRadio(dir, camera.aspect, FOV, new THREE.Vector3(), fit()).target, dir, 1);
  controls.update();

  const canvasEl = renderer.domElement;
  canvasEl.addEventListener('pointerdown', onPointerDown);
  canvasEl.addEventListener('pointermove', onPointerMove);
  canvasEl.addEventListener('pointerup', onPointerUp);
  canvasEl.addEventListener('pointercancel', onPointerUp);
  canvasEl.addEventListener('pointerleave', () => { hovered = null; hoverName.value = ''; });
  el.addEventListener('wheel', onWheel, { capture: true, passive: false });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  offEvents = radio.on((e) => { if (e?.type === 'dial') model?.turnDial(e.dir); });
  new ResizeObserver(resize).observe(el);
  ready.value = true;
  loop();
});

watch(() => props.view, (v) => flyTo(v));

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  offEvents?.();
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  controls?.dispose();
  model?.dispose();
  scene?.environment?.dispose();
  renderer?.dispose();
  renderer?.forceContextLoss();
});

defineExpose({ flyTo });
</script>

<template>
  <div ref="host" class="absolute inset-0 overflow-hidden" :lang="lang">
    <div v-if="!ready && !failed" class="absolute inset-0 grid place-items-center text-sm text-muted">
      <span class="inline-flex items-center gap-2"><UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />{{ t({ en: 'Building the radio…', nl: 'De radio wordt gebouwd…' }) }}</span>
    </div>
    <div v-if="failed" class="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">
      {{ t({ en: 'Your browser could not start 3D graphics (WebGL). The key pad below still works.', nl: 'Je browser kon geen 3D-graphics (WebGL) starten. Het toetsenbord hieronder werkt wel.' }) }}
    </div>
    <div
      v-if="callout.visible && gestureText"
      class="pointer-events-none absolute left-0 top-0 z-10"
      :style="{ transform: `translate(${callout.x}px, ${callout.y}px)` }"
    >
      <span class="callout absolute bottom-3 left-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#d4f578] px-2.5 py-1 text-xs font-bold text-[#142338] shadow-lg">
        {{ gestureText }}
      </span>
      <span class="absolute -left-1.5 -top-1.5 size-3 animate-ping rounded-full bg-[#d4f578]/80" />
    </div>
    <div
      v-if="hoverName"
      class="pointer-events-none absolute z-20 max-w-60 rounded-md bg-inverted px-2 py-1 text-xs font-semibold text-inverted shadow"
      :style="{ left: `${hoverPos.x + 14}px`, top: `${hoverPos.y + 14}px` }"
    >
      {{ hoverName }}
    </div>
  </div>
</template>

<style scoped>
.callout::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 8px;
  height: 8px;
  background: inherit;
  transform: translateX(-50%) rotate(45deg);
}
</style>
