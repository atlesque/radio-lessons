// Draws the IC-R5's function display (manual p. 3) onto a canvas used as a texture on the 3D model.

import type { Lcd } from './sim';

export const LCD_W = 1024;
export const LCD_H = 404;

const INK = '#1b231d';
const MAIN_CELLS = 8;

let fontsReady: Promise<unknown> | null = null;
export function loadLcdFonts() {
  fontsReady ??= Promise.all([document.fonts.load('150px DSEG14'), document.fonts.load('80px DSEG7')]).catch(() => undefined);
  return fontsReady;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Text into fixed cells, right-aligned, with faint "all segments" ghosts and hand-drawn decimal points. */
function segments(ctx: CanvasRenderingContext2D, text: string, cells: number, font: string, maxSize: number, left: number, right: number, base: number, ghost: string) {
  // The font size that fits the cells between left and right.
  ctx.font = `100px ${font}`;
  const size = Math.min(maxSize, ((right - left) / cells / ctx.measureText('8').width) * 100);
  ctx.font = `${size}px ${font}`;
  const cw = ctx.measureText('8').width;
  const glyphs: { c: string; dot: boolean }[] = [];
  for (const c of text.toUpperCase()) {
    if (c === '.' && glyphs.length) glyphs[glyphs.length - 1]!.dot = true;
    else glyphs.push({ c, dot: false });
  }
  const start = right - cells * cw;
  const offset = cells - glyphs.length;
  for (let i = 0; i < cells; i++) {
    const x = start + i * cw;
    ctx.globalAlpha = 0.07;
    ctx.fillText(ghost, x, base);
    const g = glyphs[i - offset];
    ctx.globalAlpha = 0.93;
    if (g && g.c !== ' ') ctx.fillText(g.c, x, base);
    // Decimal point: a small square at the bottom right of the cell.
    const d = size * 0.11;
    ctx.globalAlpha = g?.dot ? 0.93 : 0.07;
    ctx.fillRect(x + cw - d * 0.6, base - d, d, d);
  }
  ctx.globalAlpha = 1;
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, on: boolean, size = 30) {
  ctx.font = `700 ${size}px "Plus Jakarta Sans", Arial, sans-serif`;
  ctx.globalAlpha = on ? 0.92 : 0.06;
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}

function padlock(ctx: CanvasRenderingContext2D, x: number, y: number, on: boolean) {
  ctx.globalAlpha = on ? 0.92 : 0.06;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x + 14, y + 12, 9, Math.PI, 0);
  ctx.stroke();
  ctx.fillRect(x + 1, y + 12, 26, 20);
  ctx.globalAlpha = 1;
}

function battery(ctx: CanvasRenderingContext2D, x: number, y: number, level: number) {
  ctx.lineWidth = 4;
  ctx.globalAlpha = level ? 0.92 : 0.06;
  ctx.strokeRect(x, y, 62, 28);
  ctx.fillRect(x + 62, y + 8, 6, 12);
  for (let i = 0; i < 2; i++) {
    ctx.globalAlpha = level > 1 - i ? 0.92 : 0.06;
    ctx.fillRect(x + 6 + i * 28, y + 6, 22, 16);
  }
  ctx.globalAlpha = 1;
}

export function drawLcd(ctx: CanvasRenderingContext2D, d: Lcd) {
  const { width: W, height: H } = ctx.canvas;
  ctx.save();
  ctx.scale(W / LCD_W, H / LCD_H);
  // Glass: grey-green when unlit, a soft yellow-green glow with the backlight on.
  const g = ctx.createLinearGradient(0, 0, 0, LCD_H);
  if (!d.on) { g.addColorStop(0, '#7d8379'); g.addColorStop(1, '#6f756c'); }
  else if (d.light) { g.addColorStop(0, '#e1efa6'); g.addColorStop(1, '#c8dc88'); }
  else { g.addColorStop(0, '#b4bba8'); g.addColorStop(1, '#a3aa98'); }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LCD_W, LCD_H);
  if (!d.on) { ctx.restore(); return; }
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  ctx.textBaseline = 'alphabetic';

  // Top row indicators.
  label(ctx, 'ATT', 26, 52, d.att);
  padlock(ctx, 112, 22, d.lock);
  label(ctx, 'VOL', 168, 52, d.vol);
  label(ctx, 'DUP', 330, 52, false);
  label(ctx, 'T SQL', 430, 52, false);
  label(ctx, 'DTCS', 560, 52, false);
  label(ctx, 'P', 700, 52, d.skip === 'PSKIP');
  label(ctx, 'SKIP', 726, 52, d.skip !== '');
  battery(ctx, 920, 24, d.battery);

  // Receive mode.
  label(ctx, 'W', 30, 150, d.mode === 'WFM', 34);
  label(ctx, 'FM', 26, 200, d.mode === 'FM' || d.mode === 'WFM', 44);
  label(ctx, 'AM', 26, 252, d.mode === 'AM', 44);

  // Frequency readout and the small 0.75/0.5/0.25 kHz digits.
  segments(ctx, d.main, MAIN_CELLS, 'DSEG14', 160, 118, 862, 270, '~');
  segments(ctx, d.sub, 2, 'DSEG7', 66, 900, 1004, 166, '8');

  // Memory indicator and channel number.
  ctx.globalAlpha = d.mem ? 0.92 : 0.06;
  ctx.lineWidth = 4;
  roundRect(ctx, 878, 196, 40, 40, 6);
  ctx.stroke();
  ctx.font = '800 30px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('M', 885, 228);
  ctx.globalAlpha = 1;
  segments(ctx, d.ch, 3, 'DSEG14', 66, 862, 1006, 336, '~');

  // Signal strength bars.
  label(ctx, 'S', 28, 378, true, 28);
  for (let i = 0; i < 7; i++) {
    ctx.globalAlpha = i < d.smeter ? 0.92 : 0.06;
    const h = 14 + i * 4;
    ctx.fillRect(70 + i * 62, 382 - h, 50, h);
  }
  label(ctx, 'PRIO', 690, 380, d.prio, 28);
  ctx.globalAlpha = 1;
  ctx.restore();
}
