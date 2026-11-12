import type { PreviewResolver } from '../integrations/statsig';

export type OverrideValue = string | boolean | number;
export interface PreviewState {
  active: boolean;
  params: Record<string, OverrideValue>;
  gate: boolean | undefined;
  config: Record<string, OverrideValue>;
}

const EMPTY: PreviewState = { active: false, params: {}, gate: undefined, config: {} };

/** Session-scoped, in-memory only: nothing here is persisted, and a new demo user clears it. */
export const createPreview = () => {
  let state: PreviewState = EMPTY;
  const listeners = new Set<() => void>();
  const set = (next: PreviewState) => {
    state = next;
    listeners.forEach((l) => l());
  };
  const resolver: PreviewResolver = {
    active: () => state.active,
    get(kind, name, key) {
      if (kind === 'param') return state.params[`${name}.${key}`];
      if (kind === 'gate') return state.gate;
      return Object.keys(state.config).length ? { ...state.config } : undefined;
    },
  };
  return {
    resolver,
    getState: () => state,
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    setActive(active: boolean) {
      set(active ? { ...state, active: true } : EMPTY);
    },
    setParam(store: string, key: string, value: OverrideValue | undefined) {
      const params = { ...state.params };
      if (value === undefined) delete params[`${store}.${key}`];
      else params[`${store}.${key}`] = value;
      set({ ...state, params });
    },
    setGate(value: boolean | undefined) {
      set({ ...state, gate: value });
    },
    setConfig(key: string, value: OverrideValue | undefined) {
      const config = { ...state.config };
      if (value === undefined) delete config[key];
      else config[key] = value;
      set({ ...state, config });
    },
    clear: () => set(EMPTY),
  };
};

export type Preview = ReturnType<typeof createPreview>;
