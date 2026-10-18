// Packs the radio's state small enough to store per lesson, and unpacks it again.
import type { Mode } from '../radio/bands';
import type { Channel, Skip, State } from '../radio/sim';
import type { PackedRadio } from './model';

/** Deep copy that also works on Vue's reactive proxies (structuredClone can't copy those). */
const copy = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export function packRadio(state: State): PackedRadio {
  const { mem, held: _held, ...rest } = state;
  return {
    ...copy(rest),
    mem: mem.flatMap((c, i) => (c ? [[i, c.freq, c.mode, c.skip] as [number, number, string, string]] : [])),
  };
}

export function unpackRadio(packed: PackedRadio): Partial<State> {
  const { mem, ...rest } = copy(packed);
  const channels: (Channel | null)[] = Array.from({ length: 1000 }, () => null);
  for (const [i, freq, mode, skip] of mem) if (i >= 0 && i < 1000) channels[i] = { freq, mode: mode as Mode, skip: skip as Skip };
  const state = rest as unknown as Partial<State>;
  // Timers from another page load mean nothing here; a running scan simply carries on.
  if (state.scan) state.scan = { ...state.scan, pausedAt: 0, lostAt: 0, last: 0 };
  return { ...state, mem: channels, held: {} };
}
