// A procedural IC-R5 in millimetres: 58 × 86 × 27 mm body (manual p. 64), controls placed from photos.
// Origin at the body's centre, +x to the radio's right, +y up, +z out of the front.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Control } from './controls';
import { LCD_H, LCD_W, drawLcd } from './lcd';
import type { Key, Lcd } from './sim';

const W = 58, H = 86, D = 27;
const FRONT = D / 2, TOP = H / 2, SIDE = W / 2;
const ORANGE = '#f0783c';

export interface RadioModel {
  group: THREE.Group;
  pickables: THREE.Object3D[];
  anchors: Record<Control, THREE.Vector3>;
  drawLcd: (lcd: Lcd) => void;
  setPressed: (key: Key, pressed: boolean) => void;
  turnDial: (dir: 1 | -1) => void;
  update: (dt: number, t: number, highlight: Control[], hover: Control | null) => void;
  dispose: () => void;
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function texture(c: HTMLCanvasElement, renderer: THREE.WebGLRenderer) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

const FONT = '"Plus Jakarta Sans", Arial, Helvetica, sans-serif';

type Line = { t: string; color: string; boxed?: boolean; size?: number };

/** A printed key top: stacked labels, primary white, secondary orange, FUNC functions boxed. */
function keyLabel(lines: Line[] | 'up' | 'down', w: number, h: number, renderer: THREE.WebGLRenderer) {
  const px = 40;
  const [c, ctx] = canvas(Math.round(w * px), Math.round(h * px));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (lines === 'up' || lines === 'down') {
    ctx.fillStyle = '#d9dadc';
    const cx = c.width / 2, cy = c.height / 2, s = c.width * 0.2;
    ctx.beginPath();
    if (lines === 'up') { ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy + s * 0.75); ctx.lineTo(cx - s, cy + s * 0.75); }
    else { ctx.moveTo(cx, cy + s); ctx.lineTo(cx + s, cy - s * 0.75); ctx.lineTo(cx - s, cy - s * 0.75); }
    ctx.fill();
  } else {
    const gap = c.height / (lines.length + 1);
    lines.forEach((l, i) => {
      const size = (l.size ?? 1) * c.width * 0.27;
      ctx.font = `800 ${size}px ${FONT}`;
      ctx.fillStyle = l.color;
      const y = gap * (i + 1) + (lines.length === 2 ? (i === 0 ? gap * 0.15 : -gap * 0.15) : 0);
      ctx.fillText(l.t, c.width / 2, y);
      if (l.boxed) {
        const tw = ctx.measureText(l.t).width;
        ctx.strokeStyle = l.color;
        ctx.lineWidth = c.width * 0.025;
        ctx.strokeRect(c.width / 2 - tw / 2 - size * 0.18, y - size * 0.62, tw + size * 0.36, size * 1.22);
      }
    });
  }
  return texture(c, renderer);
}

export function buildRadio(renderer: THREE.WebGLRenderer): RadioModel {
  const group = new THREE.Group();
  const pickables: THREE.Object3D[] = [];
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };
  const highlightable = new Map<Control, THREE.MeshStandardMaterial[]>();
  const overlays = new Map<Control, THREE.MeshBasicMaterial>();

  const mat = (color: string, roughness: number, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
    track(new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, ...extra }));
  const plastic = mat('#1a1b1e', 0.58, { clearcoat: 0.15, clearcoatRoughness: 0.5 });
  const rubber = mat('#151618', 0.88);
  const gloss = mat('#0c0c0e', 0.2, { clearcoat: 1, clearcoatRoughness: 0.06 });

  const tag = (obj: THREE.Object3D, control: Control, material?: THREE.MeshStandardMaterial) => {
    obj.traverse((o) => { o.userData.control = control; });
    pickables.push(obj);
    if (material) highlightable.set(control, [...(highlightable.get(control) ?? []), material]);
  };

  // ---------- body ----------
  const body = new THREE.Mesh(track(new RoundedBoxGeometry(W, H, D, 5, 5)), plastic);
  group.add(body);

  // Rubber grips: three bumps along each front edge of the lower half.
  const bumpGeo = track(new THREE.SphereGeometry(1, 20, 14));
  for (const sx of [-1, 1]) for (const y of [-10.8, -23.3, -35.8]) {
    const b = new THREE.Mesh(bumpGeo, rubber);
    b.scale.set(1.3, 4, 2.6);
    b.position.set(sx * (SIDE - 0.2), y, FRONT - 3.2);
    group.add(b);
  }

  // ---------- front printing and speaker grille (one decal over the flat part of the face) ----------
  const DPX = 24; // decal pixels per mm
  const fw = 48, fh = 76;
  const [fc, f] = canvas(fw * DPX, fh * DPX);
  const fx = (x: number) => (x + fw / 2) * DPX;
  const fy = (y: number) => (fh / 2 - y) * DPX;
  // Speaker holes: staggered horizontal ovals, with a lit lower lip so they read as holes.
  for (let row = 0; row < 9; row++) {
    const y = -11 - row * 3.25;
    const odd = row % 2 === 1;
    for (let col = -5; col <= 5; col++) {
      const x = col * 4.2 + (odd ? 2.1 : 0);
      if (Math.abs(x) > 21) continue;
      if (x > 10 && y > -15) continue; // room for [PWR]
      f.beginPath();
      f.ellipse(fx(x), fy(y) + 0.25 * DPX, 1.55 * DPX, 1.0 * DPX, 0, 0, Math.PI * 2);
      f.fillStyle = 'rgba(70,72,78,0.55)';
      f.fill();
      f.beginPath();
      f.ellipse(fx(x), fy(y), 1.5 * DPX, 0.95 * DPX, 0, 0, Math.PI * 2);
      f.fillStyle = '#030304';
      f.fill();
    }
  }
  // Key wells: soft dark rings around each key.
  const well = (x: number, y: number, w: number, h: number, r: number) => {
    f.beginPath();
    f.roundRect(fx(x - w / 2), fy(y + h / 2), w * DPX, h * DPX, r * DPX);
    f.fillStyle = 'rgba(0,0,0,0.55)';
    f.fill();
  };
  // The raised ridge around [BAND] and the arrow keys.
  f.beginPath();
  f.roundRect(fx(-25.2), fy(10.6), 19.4 * DPX, 17.6 * DPX, 4.5 * DPX);
  f.strokeStyle = 'rgba(255,255,255,0.07)';
  f.lineWidth = 0.7 * DPX;
  f.stroke();
  f.fillStyle = '#ececec';
  f.textAlign = 'center';
  f.textBaseline = 'middle';
  f.font = `700 ${2.15 * DPX}px ${FONT}`;
  f.fillText('COMMUNICATIONS RECEIVER', fx(-4), fy(14.4));
  f.font = `800 ${3.1 * DPX}px ${FONT}`;
  f.fillText('IC-R5', fx(17), fy(14.5));
  f.font = `700 ${1.9 * DPX}px ${FONT}`;
  f.fillStyle = '#cfcfcf';
  f.fillText('PWR', fx(14.1), fy(-5.6));

  // ---------- keys ----------
  const keyMeshes = new Map<Key, THREE.Group>();
  const pressed = new Map<Key, number>();
  const addKey = (key: Key, x: number, y: number, w: number, h: number, lines: Line[] | 'up' | 'down' | null, color = '#1d1e21', depth = 1.5) => {
    well(x, y, w + 1.2, h + 1.2, 1.8);
    const g = new THREE.Group();
    g.position.set(x, y, FRONT);
    const m = mat(color, color === '#1d1e21' ? 0.72 : 0.5);
    const mesh = new THREE.Mesh(track(new RoundedBoxGeometry(w, h, 3, 3, 1.1)), m);
    mesh.position.z = depth - 1.5;
    g.add(mesh);
    if (lines) {
      const tex = track(keyLabel(lines, w, h, renderer));
      const lm = track(new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7, depthWrite: false }));
      const label = new THREE.Mesh(track(new THREE.PlaneGeometry(w * 0.9, h * 0.9)), lm);
      label.position.z = depth + 0.02;
      g.add(label);
    }
    group.add(g);
    keyMeshes.set(key, g);
    tag(g, key, m);
  };
  const KW = 7.4, KH = 9.4;
  addKey('VM', 20.6, 4.3, KW, KH, [{ t: 'V/M', color: '#f2f2f2' }, { t: 'S.MW', color: ORANGE, size: 0.92 }, { t: 'SKIP', color: ORANGE, boxed: true, size: 0.78 }]);
  addKey('MODE', 9.6, 4.3, KW, KH, [{ t: 'MODE', color: '#f2f2f2', size: 0.88 }, { t: 'SCAN', color: ORANGE, size: 0.88 }]);
  addKey('TS', -1.4, 4.3, KW, KH, [{ t: 'TS', color: '#f2f2f2' }, { t: 'SET', color: ORANGE }]);
  addKey('BAND', -12.4, 2.0, KW, KH, [{ t: 'BAND', color: '#f2f2f2', size: 0.88 }, { t: 'LOCK', color: ORANGE, boxed: true, size: 0.8 }]);
  addKey('UP', -21.0, 6.6, 6.0, 5.6, 'up');
  addKey('DOWN', -21.0, -2.4, 6.0, 5.6, 'down');
  addKey('PWR', 20.4, -5.5, 4.8, 4.4, null, ORANGE, 0.9);

  const frontTex = track(texture(fc, renderer));
  const frontDecal = new THREE.Mesh(track(new THREE.PlaneGeometry(fw, fh)), track(new THREE.MeshStandardMaterial({ map: frontTex, transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })));
  frontDecal.position.z = FRONT + 0.03;
  group.add(frontDecal);

  // ---------- display bezel, LCD and glass ----------
  // Rounded rectangles for the bezel and its window.
  const rounded = (path: THREE.Path, x: number, y: number, w: number, h: number, r: number) => {
    path.moveTo(x + r, y); path.lineTo(x + w - r, y); path.quadraticCurveTo(x + w, y, x + w, y + r);
    path.lineTo(x + w, y + h - r); path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    path.lineTo(x + r, y + h); path.quadraticCurveTo(x, y + h, x, y + h - r);
    path.lineTo(x, y + r); path.quadraticCurveTo(x, y, x + r, y);
    return path;
  };
  const bezelShape = rounded(new THREE.Shape(), -23, 16.4, 46, 23.4, 3.2) as THREE.Shape;
  const lx = -19, ly = 19.0, lw = 39, lh = 15.4;
  bezelShape.holes.push(rounded(new THREE.Path(), lx, ly, lw, lh, 1));
  const bezel = new THREE.Mesh(track(new THREE.ExtrudeGeometry(bezelShape, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.5, bevelSegments: 3, curveSegments: 10 })), gloss);
  bezel.position.z = FRONT - 0.3;
  group.add(bezel);

  // The Icom logo on the bezel above the display, with its red dot.
  const [lc, l] = canvas(512, 128);
  l.fillStyle = '#f4f4f4';
  l.textAlign = 'center';
  l.textBaseline = 'middle';
  l.font = `italic 800 96px ${FONT}`;
  l.fillText('ICOM', 256, 70);
  l.fillStyle = '#e03a2f';
  l.beginPath(); l.arc(176, 18, 11, 0, Math.PI * 2); l.fill();
  const logo = new THREE.Mesh(track(new THREE.PlaneGeometry(11, 2.75)), track(new THREE.MeshStandardMaterial({ map: track(texture(lc, renderer)), transparent: true, roughness: 0.3, depthWrite: false })));
  logo.position.set(0, 37.1, FRONT + 1.3);
  group.add(logo);

  const [lcdCanvas, lcdCtx] = canvas(LCD_W, LCD_H);
  const lcdTex = track(texture(lcdCanvas, renderer));
  const lcdMat = track(new THREE.MeshBasicMaterial({ map: lcdTex, toneMapped: false }));
  const lcd = new THREE.Mesh(track(new THREE.PlaneGeometry(lw - 0.6, lh - 0.6)), lcdMat);
  lcd.position.set(lx + lw / 2, ly + lh / 2, FRONT + 0.15);
  group.add(lcd);
  tag(lcd, 'LCD');
  const glass = new THREE.Mesh(track(new THREE.PlaneGeometry(lw, lh)), mat('#ffffff', 0.04, { transparent: true, opacity: 0.08, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false }));
  glass.position.copy(lcd.position).setZ(FRONT + 0.55);
  group.add(glass);

  // ---------- top: antenna, dial, earphone jack cover ----------
  const antProfile = [[0, -2], [4.5, -2], [4.5, 1.5], [4.35, 12], [3.9, 18], [3.2, 30], [2.85, 48], [2.55, 85], [2.25, 125], [2.0, 152], [1.6, 158.5], [0.9, 160.3], [0, 160.8]]
    .map(([r, y]) => new THREE.Vector2(r!, y!));
  const antMat = mat('#121315', 0.82);
  const antenna = new THREE.Mesh(track(new THREE.LatheGeometry(antProfile, 40)), antMat);
  antenna.position.set(-14.3, TOP, 0.6);
  group.add(antenna);
  tag(antenna, 'ANT', antMat);

  const dial = new THREE.Group();
  dial.position.set(14.3, TOP, 0.6);
  const dialMat = mat('#18191b', 0.6);
  const collar = new THREE.Mesh(track(new THREE.CylinderGeometry(6.9, 7.1, 2.6, 48)), dialMat);
  collar.position.y = 1.3;
  dial.add(collar);
  const knobParts: THREE.BufferGeometry[] = [];
  const core = new THREE.CylinderGeometry(6.0, 6.1, 9, 48);
  core.translate(0, 2.6 + 4.5, 0);
  knobParts.push(core);
  for (let i = 0; i < 30; i++) {
    const rib = new THREE.BoxGeometry(1.1, 8.2, 0.9);
    rib.translate(0, 2.6 + 4.6, 6.05);
    rib.rotateY((i / 30) * Math.PI * 2);
    knobParts.push(rib);
  }
  const cap = new THREE.CylinderGeometry(5.5, 6.0, 0.8, 48);
  cap.translate(0, 2.6 + 9.4, 0);
  knobParts.push(cap);
  const knob = new THREE.Mesh(track(mergeGeometries(knobParts.map((g) => g.toNonIndexed()))!), dialMat);
  knobParts.forEach((g) => g.dispose());
  const marker = new THREE.Mesh(track(new THREE.BoxGeometry(0.8, 0.2, 3.2)), mat('#9a9ca0', 0.5));
  marker.position.set(0, 2.6 + 9.85, 3.4);
  const spin = new THREE.Group();
  spin.add(knob, marker);
  dial.add(spin);
  group.add(dial);
  tag(dial, 'DIAL', dialMat);

  const spMat = mat('#141517', 0.9);
  const spCover = new THREE.Mesh(track(new RoundedBoxGeometry(10, 2.4, 6.2, 2, 1)), spMat);
  spCover.position.set(-0.5, TOP + 0.6, 0.6);
  group.add(spCover);
  tag(spCover, 'SP', spMat);

  // ---------- left side: [FUNC] and [SQL] ----------
  const sideLabel = (text: string, len: number) => {
    const [c, ctx] = canvas(Math.round(len * 40), 380);
    ctx.fillStyle = '#5b5d62';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${150}px ${FONT}`;
    ctx.fillText(text, c.width / 2, c.height / 2);
    return track(texture(c, renderer));
  };
  const addSideKey = (key: Key, y: number, len: number, text: string) => {
    const g = new THREE.Group();
    g.position.set(-SIDE, y, 1.5);
    const m = mat('#1c1d20', 0.8);
    const mesh = new THREE.Mesh(track(new RoundedBoxGeometry(3.4, len, 9.6, 3, 1.2)), m);
    mesh.position.x = -0.05;
    g.add(mesh);
    const label = new THREE.Mesh(track(new THREE.PlaneGeometry(len * 0.82, 7.8)), track(new THREE.MeshStandardMaterial({ map: sideLabel(text, len), transparent: true, roughness: 0.8, depthWrite: false })));
    label.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
    label.position.x = -1.77;
    g.add(label);
    group.add(g);
    keyMeshes.set(key, g);
    tag(g, key, m);
  };
  addSideKey('FUNC', 29.2, 11.2, 'FUNC');
  addSideKey('SQL', 16.4, 8.6, 'SQL');

  // ---------- right side: [DC 6V] jack cover ----------
  const dcMat = mat('#141517', 0.9);
  const dc = new THREE.Group();
  dc.position.set(SIDE, 12.6, 2.5);
  dc.add(new THREE.Mesh(track(new RoundedBoxGeometry(2.4, 10, 9.6, 3, 1.1)), dcMat));
  {
    const [c, ctx] = canvas(400, 380);
    ctx.fillStyle = '#6a6c71';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 90px ${FONT}`;
    ctx.fillText('DC 6V', 200, 250);
    ctx.lineWidth = 9; ctx.strokeStyle = '#6a6c71';
    ctx.beginPath(); ctx.arc(110, 120, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(200, 120, 26, 0, Math.PI * 2); ctx.fillStyle = '#6a6c71'; ctx.fill();
    ctx.beginPath(); ctx.arc(290, 120, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.fillRect(136, 115, 38, 9); ctx.fillRect(226, 115, 38, 9);
    const lbl = new THREE.Mesh(track(new THREE.PlaneGeometry(8.4, 8)), track(new THREE.MeshStandardMaterial({ map: track(texture(c, renderer)), transparent: true, roughness: 0.8, depthWrite: false })));
    lbl.rotation.set(0, Math.PI / 2, Math.PI / 2);
    lbl.position.x = 1.22;
    dc.add(lbl);
  }
  group.add(dc);
  tag(dc, 'DC', dcMat);

  // ---------- back: belt-clip loop, label, battery cover ----------
  const loop = new THREE.Mesh(track(new RoundedBoxGeometry(30, 18.5, 4, 3, 1.4)), plastic);
  loop.position.set(0, 27.3, -FRONT - 0.9);
  group.add(loop);
  const [bc, b] = canvas(fw * DPX, fh * DPX);
  const bx = (x: number) => (fw / 2 - x) * DPX; // seen from behind, +x is on the left
  const by = (y: number) => (fh / 2 - y) * DPX;
  // Slot in the belt-clip loop.
  b.fillStyle = 'rgba(0,0,0,0.6)';
  b.beginPath(); b.roundRect(bx(11), by(34), 22 * DPX, 13 * DPX, 2 * DPX); b.fill();
  // Battery cover seam and latch.
  b.fillStyle = 'rgba(0,0,0,0.75)';
  b.fillRect(0, by(-6.2), fw * DPX, 0.35 * DPX);
  b.beginPath(); b.roundRect(bx(7.5), by(-31), 15 * DPX, 7 * DPX, 2 * DPX); b.fill();
  // Rating label (serial number left blank).
  b.fillStyle = '#26272a';
  b.beginPath(); b.roundRect(bx(22.5), by(17.4), 45 * DPX, 21.6 * DPX, 1.2 * DPX); b.fill();
  b.strokeStyle = '#d8dbc8'; b.lineWidth = 0.18 * DPX;
  for (let i = 0; i < 5; i++) { b.beginPath(); b.moveTo(bx(9 - i * 2.2), by(16)); b.lineTo(bx(9 - i * 2.2), by(-3)); b.stroke(); }
  b.fillStyle = '#e8ead8';
  b.textAlign = 'left';
  b.textBaseline = 'middle';
  b.font = `italic 800 ${3.4 * DPX}px ${FONT}`;
  b.fillText('ICOM', bx(21), by(13.5));
  b.font = `700 ${4.2 * DPX}px ${FONT}`;
  b.fillText('CE', bx(20.5), by(6.5));
  b.font = `700 ${1.7 * DPX}px ${FONT}`;
  b.fillText('IC-R5', bx(-12), by(14));
  b.fillText('MADE IN JAPAN', bx(-12), by(9));
  b.fillText('Icom Inc.', bx(-12), by(4));
  b.fillText('SERIAL NO.', bx(21), by(-1.5));
  const backTex = track(texture(bc, renderer));
  const backDecal = new THREE.Mesh(track(new THREE.PlaneGeometry(fw, fh)), track(new THREE.MeshStandardMaterial({ map: backTex, transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })));
  backDecal.rotation.y = Math.PI;
  backDecal.position.z = -FRONT - 0.03;
  group.add(backDecal);
  // The label sits partly on the loop; a second decal on the loop's face keeps the slot visible.
  const loopDecal = backDecal.clone();
  loopDecal.position.z = -FRONT - 2.92;
  loopDecal.geometry = track(new THREE.PlaneGeometry(fw, fh));
  // Only the slot area of the texture lands on the loop, so clip the geometry to it with UVs.
  {
    const g = loopDecal.geometry as THREE.PlaneGeometry;
    const sx = 29 / fw, sy = 17.5 / fh;
    g.scale(sx, sy, 1);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const u0 = (fw / 2 - 14.5) / fw, v0 = (27.3 - 8.75 + fh / 2) / fh;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * sx, v0 + uv.getY(i) * sy);
    loopDecal.position.y = 27.3;
  }
  group.add(loopDecal);

  // ---------- hotspots: invisible planes that light up for the lessons ----------
  const hotspot = (control: Control, w: number, h: number, pos: [number, number, number], rotY = 0) => {
    const m = track(new THREE.MeshBasicMaterial({ color: '#d4f578', transparent: true, opacity: 0, depthWrite: false }));
    const p = new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), m);
    p.position.set(...pos);
    p.rotation.y = rotY;
    group.add(p);
    tag(p, control);
    overlays.set(control, m);
  };
  hotspot('BATT', 50, 36, [0, -24.5, -FRONT - 0.08], Math.PI);
  hotspot('SPEAKER', 44, 30, [0, -24, FRONT + 0.08]);
  hotspot('LCD', lw + 2, lh + 2, [lx + lw / 2, ly + lh / 2, FRONT + 0.7]);

  const anchors: Record<Control, THREE.Vector3> = {
    PWR: new THREE.Vector3(20.4, -5.5, FRONT + 1), UP: new THREE.Vector3(-21, 6.6, FRONT + 1.5), DOWN: new THREE.Vector3(-21, -2.4, FRONT + 1.5),
    BAND: new THREE.Vector3(-12.4, 2, FRONT + 1.5), TS: new THREE.Vector3(-1.4, 4.3, FRONT + 1.5), MODE: new THREE.Vector3(9.6, 4.3, FRONT + 1.5),
    VM: new THREE.Vector3(20.6, 4.3, FRONT + 1.5), FUNC: new THREE.Vector3(-SIDE - 1.8, 29.2, 1.5), SQL: new THREE.Vector3(-SIDE - 1.8, 16.4, 1.5),
    DIAL: new THREE.Vector3(14.3, TOP + 13, 0.6), ANT: new THREE.Vector3(-14.3, TOP + 60, 0.6), SP: new THREE.Vector3(-0.5, TOP + 2, 0.6),
    DC: new THREE.Vector3(SIDE + 1.3, 12.6, 2.5), LCD: new THREE.Vector3(0.5, 26.7, FRONT + 0.7), BATT: new THREE.Vector3(0, -24, -FRONT - 0.2),
    SPEAKER: new THREE.Vector3(0, -24, FRONT + 0.2),
  };

  let dialTarget = 0;
  let lastLcd = '';
  const lime = new THREE.Color('#d4f578');
  const white = new THREE.Color('#ffffff');

  return {
    group,
    pickables,
    anchors,
    drawLcd(d) {
      const key = JSON.stringify(d);
      if (key === lastLcd) return;
      lastLcd = key;
      drawLcd(lcdCtx, d);
      lcdTex.needsUpdate = true;
    },
    setPressed(key, down) { pressed.set(key, down ? 1 : 0); },
    turnDial(dir) { dialTarget -= dir * (Math.PI * 2) / 24; },
    update(dt, t, highlight, hover) {
      // Keys travel in and out; the dial eases to its detent.
      for (const [key, g] of keyMeshes) {
        const goal = pressed.get(key) ? 1 : 0;
        const cur = (g.userData.press as number | undefined) ?? 0;
        const next = cur + (goal - cur) * Math.min(1, dt * 22);
        g.userData.press = next;
        if (key === 'FUNC' || key === 'SQL') g.position.x = -SIDE + next * 0.8;
        else g.position.z = FRONT - next * 0.8;
      }
      spin.rotation.y += (dialTarget - spin.rotation.y) * Math.min(1, dt * 18);
      const pulse = 0.5 + 0.5 * Math.sin(t * 5);
      for (const [control, mats] of highlightable) {
        const on = highlight.includes(control);
        for (const m of mats) {
          if (on) { m.emissive.copy(lime); m.emissiveIntensity = 0.25 + pulse * 0.45; }
          else if (hover === control) { m.emissive.copy(white); m.emissiveIntensity = 0.07; }
          else { m.emissiveIntensity = 0; }
        }
      }
      for (const [control, m] of overlays) {
        const on = highlight.includes(control);
        m.opacity = on ? 0.12 + pulse * 0.22 : hover === control ? 0.06 : 0;
      }
    },
    dispose() { for (const d of disposables) d.dispose(); },
  };
}
