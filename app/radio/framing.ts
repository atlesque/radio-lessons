// Camera framing that always shows the whole radio: for a viewing direction, find the target that
// centres the radio on screen and the closest distance at which every outline point still fits.

import * as THREE from 'three';

/** Points outlining the model (mm, model space): body with side keys and back loop, and the dial. */
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const BODY: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = [];
  for (const x of [-31, 31]) for (const y of [-43, 43]) for (const z of [-15.5, 15]) pts.push(v(x, y, z));
  for (const [dx, dz] of [[-7, -7], [7, -7], [-7, 7], [7, 7]]) pts.push(v(14.3 + dx!, 56, 0.6 + dz!));
  return pts;
})();
/** The antenna, when it's screwed on. */
const ANTENNA: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = [];
  for (const [y, r] of [[60, 4.4], [110, 2.6], [160, 2.1]] as const) {
    for (const [dx, dz] of [[-r, 0], [r, 0], [0, -r], [0, r]] as const) pts.push(v(-14.3 + dx, y, 0.6 + dz));
  }
  pts.push(v(-14.3, 204, 0.6));
  return pts;
})();
/** The battery cover when it's slid off below the radio. */
const COVER_OFF: THREE.Vector3[] = [v(-27, -85, -19), v(27, -85, -19), v(-27, -48, -19), v(27, -48, -19)];

export interface Fit { antenna?: boolean; coverOff?: boolean }
let OUTLINE: THREE.Vector3[] = [...BODY, ...ANTENNA];
function useOutline(fit: Fit) {
  OUTLINE = [...BODY, ...(fit.antenna === false ? [] : ANTENNA), ...(fit.coverOff ? COVER_OFF : [])];
}

const MARGIN = 0.9; // share of the frame the radio may fill
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _d = new THREE.Vector3();
const _q = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const SIDE_UP = new THREE.Vector3(0, 0, -1);

/** Camera basis for a direction pointing from the target towards the camera. */
function basis(dir: THREE.Vector3) {
  _d.copy(dir).normalize();
  _right.crossVectors(Math.abs(_d.y) > 0.985 ? SIDE_UP : WORLD_UP, _d).normalize();
  _up.crossVectors(_d, _right);
}

/** The closest camera distance (from `target`, along `dir`) at which the whole radio fits. */
export function fitDistance(target: THREE.Vector3, dir: THREE.Vector3, aspect: number, fovDeg: number, fit: Fit = {}) {
  useOutline(fit);
  basis(dir);
  const tanV = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2) * MARGIN;
  const tanH = tanV * aspect;
  let dist = 0;
  for (const p of OUTLINE) {
    _q.subVectors(p, target);
    const x = _q.dot(_right), y = _q.dot(_up), z = _q.dot(_d);
    dist = Math.max(dist, z + Math.abs(y) / tanV, z + Math.abs(x) / tanH);
  }
  return dist;
}

/** Target and distance that centre and fit the radio when seen from `dir`. */
export function frameRadio(dir: THREE.Vector3, aspect: number, fovDeg: number, out = new THREE.Vector3(), fit: Fit = {}) {
  useOutline(fit);
  basis(dir);
  // Start from the centre of the outline's bounding box in view space, then correct for perspective.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of OUTLINE) {
    const x = p.dot(_right), y = p.dot(_up), z = p.dot(_d);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  out.set(0, 0, 0).addScaledVector(_right, (minX + maxX) / 2).addScaledVector(_up, (minY + maxY) / 2).addScaledVector(_d, (minZ + maxZ) / 2);
  let dist = fitDistance(out, dir, aspect, fovDeg, fit);
  for (let i = 0; i < 2; i++) {
    basis(dir);
    let sx0 = Infinity, sx1 = -Infinity, sy0 = Infinity, sy1 = -Infinity;
    for (const p of OUTLINE) {
      _q.subVectors(p, out);
      const depth = dist - _q.dot(_d);
      const sx = _q.dot(_right) / depth / aspect, sy = _q.dot(_up) / depth;
      sx0 = Math.min(sx0, sx); sx1 = Math.max(sx1, sx);
      sy0 = Math.min(sy0, sy); sy1 = Math.max(sy1, sy);
    }
    out.addScaledVector(_right, ((sx0 + sx1) / 2) * aspect * dist).addScaledVector(_up, ((sy0 + sy1) / 2) * dist);
    dist = fitDistance(out, dir, aspect, fovDeg, fit);
  }
  return { target: out, distance: dist };
}
