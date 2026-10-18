// Synthesised audio for the simulator: band noise, squelch, key beeps and stand-in programmes for the
// practice signals (no recordings, so nothing to download and nothing copyrighted).

import type { Sound } from './bands';
import type { Radio } from './sim';

type Program = { stop: () => void };

const NOTE = (n: number) => 440 * 2 ** ((n - 69) / 12);

export class RadioAudio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private hiss!: GainNode;
  private sig!: GainNode;
  private tone!: BiquadFilterNode;
  private shaper!: WaveShaperNode;
  private progBus!: GainNode;
  private program: Program | null = null;
  private programId = '';
  private dist = -1;
  enabled = false;

  async enable() {
    if (!this.ctx) this.build();
    await this.ctx!.resume();
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    this.program?.stop();
    this.program = null;
    this.programId = '';
    void this.ctx?.suspend();
  }

  private build() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);

    // Band noise: looping white noise, shaped like a small speaker.
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 1800; nf.Q.value = 0.5;
    this.hiss = ctx.createGain();
    this.hiss.gain.value = 0;
    noise.connect(nf).connect(this.hiss).connect(this.master);
    noise.start();

    // Programme chain: bus → bandwidth filter → distortion (wrong mode) → level.
    this.progBus = ctx.createGain();
    this.tone = ctx.createBiquadFilter();
    this.tone.type = 'lowpass'; this.tone.frequency.value = 9000;
    this.shaper = ctx.createWaveShaper();
    this.setDistortion(0);
    this.sig = ctx.createGain();
    this.sig.gain.value = 0;
    this.progBus.connect(this.tone).connect(this.shaper).connect(this.sig).connect(this.master);
  }

  private setDistortion(amount: number) {
    if (amount === this.dist) return;
    this.dist = amount;
    const n = 1024;
    const curve = new Float32Array(n);
    const k = amount * 60;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = k ? ((1 + k) * x) / (1 + k * Math.abs(x)) : x;
    }
    this.shaper.curve = curve;
  }

  /** Called every frame with the radio's current reception. */
  update(radio: Radio) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const s = radio.state;
    const r = radio.reception();
    const vol = s.power ? (s.vol / 31) ** 2 : 0;
    this.master.gain.setTargetAtTime(vol * 0.9, t, 0.03);

    const open = r.open && s.power;
    const station = r.station;
    const signal = station ? r.strength : 0;
    // A strong FM signal quiets the noise completely; AM keeps a little.
    const hissLevel = open ? Math.max(0, 1 - signal * 1.25) ** 1.4 * 0.32 : 0;
    this.hiss.gain.setTargetAtTime(hissLevel, t, open ? 0.02 : 0.008);

    const id = open && station ? station.id : '';
    if (id !== this.programId) {
      this.program?.stop();
      this.program = id ? this.startProgram(station!.sound, station!.id) : null;
      this.programId = id;
    }
    if (!station) { this.sig.gain.setTargetAtTime(0, t, 0.02); return; }
    const mode = radio.mode;
    let level = Math.min(1, signal * 1.3);
    let dist = 0;
    let bw = mode === 'WFM' ? 11000 : mode === 'FM' ? 3800 : 3200;
    if (!r.modeOk) {
      if (station.mode === 'WFM' && mode === 'FM') { level *= 1.1; dist = 0.9; }
      else if (station.mode === 'WFM') { level *= 0.18; dist = 0.6; bw = 2200; }
      else if (station.mode === 'FM' && mode === 'WFM') { level *= 0.3; }
      else { level *= 0.2; dist = 0.7; }
    }
    if (station.mode === 'AM') this.hiss.gain.setTargetAtTime(open ? Math.max(hissLevel, 0.05) : 0, t, 0.05);
    this.tone.frequency.setTargetAtTime(bw, t, 0.05);
    this.setDistortion(dist);
    this.sig.gain.setTargetAtTime(open ? level * 0.55 : 0, t, 0.03);
  }

  beep(kind: 'key' | 'error' | 'write' | 'long') {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const pattern: [number, number, number][] =
      kind === 'error' ? [[0, 0.06, 900], [0.1, 0.06, 900]]
        : kind === 'write' ? [[0, 0.06, 2100], [0.11, 0.06, 2100], [0.22, 0.06, 2100]]
          : kind === 'long' ? [[0, 0.05, 2100], [0.1, 0.25, 2100]]
            : [[0, 0.04, 2100]];
    for (const [at, len, f] of pattern) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.value = f;
      const t = ctx.currentTime + at;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.004);
      g.gain.setValueAtTime(0.08, t + len);
      g.gain.linearRampToValueAtTime(0, t + len + 0.01);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + len + 0.02);
    }
  }

  // ---------- programmes ----------
  private startProgram(sound: Sound, seedId: string): Program {
    if (sound === 'voice' || sound === 'talk') return this.voice(sound === 'talk');
    if (sound === 'digital') return this.digital();
    return this.music(sound, seedId);
  }

  private music(style: Sound, seedId: string): Program {
    const ctx = this.ctx!;
    const bpm = style === 'rock' ? 132 : style === 'pop' ? 118 : style === 'classical' ? 66 : 92;
    const beat = 60 / bpm;
    const progressions: Record<string, number[][]> = {
      pop: [[60, 64, 67], [67, 71, 74], [69, 72, 76], [65, 69, 72]],
      rock: [[52, 59, 64], [55, 62, 67], [57, 64, 69], [50, 57, 62]],
      classical: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]],
      mellow: [[62, 65, 69, 72], [60, 64, 67, 71], [58, 62, 65, 69], [57, 60, 64, 67]],
    };
    const chords = progressions[style] ?? progressions.pop!;
    const transpose = [...seedId].reduce((a, c) => a + c.charCodeAt(0), 0) % 5;
    let next = ctx.currentTime + 0.05;
    let step = 0;
    const nodes = new Set<AudioScheduledSourceNode>();
    const voiceOut = ctx.createGain();
    voiceOut.gain.value = 0.5;
    voiceOut.connect(this.progBus);
    const note = (midi: number, at: number, len: number, type: OscillatorType, gain: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = NOTE(midi + transpose);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(gain, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, at + len);
      o.connect(g).connect(voiceOut);
      o.start(at); o.stop(at + len + 0.05);
      nodes.add(o); o.onended = () => nodes.delete(o);
    };
    const hit = (at: number, len: number, freq: number, gain: number) => {
      const len2 = Math.ceil(ctx.sampleRate * len);
      const b = ctx.createBuffer(1, len2, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < len2; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len2) ** 3;
      const src = ctx.createBufferSource();
      src.buffer = b;
      const f = ctx.createBiquadFilter();
      f.type = freq > 3000 ? 'highpass' : 'lowpass';
      f.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(f).connect(g).connect(voiceOut);
      src.start(at);
      nodes.add(src); src.onended = () => nodes.delete(src);
    };
    const timer = setInterval(() => {
      while (next < ctx.currentTime + 0.4) {
        const chord = chords[Math.floor(step / 8) % chords.length]!;
        const sixteenth = step % 8;
        if (style === 'classical') {
          note(chord[sixteenth % chord.length]! + (sixteenth >= 4 ? 12 : 0), next, beat * 1.6, 'sine', 0.22);
          if (sixteenth === 0) note(chord[0]! - 12, next, beat * 7, 'triangle', 0.18);
        } else {
          if (sixteenth === 0) for (const n of chord) note(n, next, beat * 3.8, style === 'rock' ? 'sawtooth' : 'triangle', style === 'rock' ? 0.07 : 0.11);
          if (sixteenth % 2 === 0) note(chord[0]! - 24, next, beat * 0.9, 'triangle', 0.3);
          if (style !== 'mellow' && sixteenth % 4 === 0) hit(next, 0.18, 120, 0.9);
          if (style !== 'mellow' && sixteenth % 4 === 2) hit(next, 0.12, style === 'rock' ? 1800 : 2500, 0.35);
          hit(next, 0.03, 7000, 0.12);
          if (style === 'pop' && sixteenth % 2 === 1) note(chord[(step >> 1) % chord.length]! + 12, next, beat * 0.4, 'square', 0.04);
        }
        next += beat / 2;
        step++;
      }
    }, 100);
    return {
      stop: () => {
        clearInterval(timer);
        for (const n of nodes) { try { n.stop(); } catch { /* already stopped */ } }
        voiceOut.disconnect();
      },
    };
  }

  /** Speech-like babble: a buzzing source through two moving formant filters, in syllables. */
  private voice(continuous: boolean): Program {
    const ctx = this.ctx!;
    const src = ctx.createOscillator();
    src.type = 'sawtooth';
    src.frequency.value = 130;
    const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 6;
    const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 8;
    const env = ctx.createGain();
    env.gain.value = 0;
    const out = ctx.createGain();
    out.gain.value = 2.2;
    src.connect(f1).connect(env);
    src.connect(f2).connect(env);
    env.connect(out).connect(this.progBus);
    src.start();
    const vowels = [[730, 1090], [270, 2290], [300, 870], [530, 1840], [660, 1720], [440, 1020]];
    let next = ctx.currentTime + 0.05;
    let pitch = continuous ? 115 : 135 + Math.random() * 40;
    const timer = setInterval(() => {
      while (next < ctx.currentTime + 0.4) {
        const pause = Math.random() < (continuous ? 0.08 : 0.12);
        const len = pause ? 0.25 + Math.random() * 0.35 : 0.09 + Math.random() * 0.16;
        const [a, b] = vowels[Math.floor(Math.random() * vowels.length)]!;
        pitch = Math.max(90, Math.min(220, pitch + (Math.random() - 0.5) * 18));
        src.frequency.setTargetAtTime(pitch, next, 0.03);
        f1.frequency.setTargetAtTime(a!, next, 0.025);
        f2.frequency.setTargetAtTime(b!, next, 0.025);
        env.gain.setTargetAtTime(pause ? 0 : 0.5 + Math.random() * 0.4, next, 0.015);
        env.gain.setTargetAtTime(0.05, next + len * 0.8, 0.02);
        next += len;
      }
    }, 80);
    return { stop: () => { clearInterval(timer); try { src.stop(); } catch { /* stopped */ } out.disconnect(); } };
  }

  /** What a digital signal sounds like on an analogue receiver: a rough buzz with a data rhythm. */
  private digital(): Program {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = 96;
    const am = ctx.createGain();
    am.gain.value = 0.25;
    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 41.7;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.2;
    lfo.connect(lfoGain).connect(am.gain);
    o.connect(am).connect(this.progBus);
    o.start(); lfo.start();
    return { stop: () => { try { o.stop(); lfo.stop(); } catch { /* stopped */ } am.disconnect(); } };
  }
}
