import { StatsigClient } from '@statsig/js-client';
import type { Profile } from '../identity/profile';

export const STATSIG_INIT_WAIT_MS = 2000;

export type Source = 'statsig' | 'default' | 'preview';
export type Reason = 'no_key' | 'timeout' | 'missing_binding' | 'type_mismatch' | 'error';
export interface Resolved<T> {
  value: T;
  source: Source;
  reason?: Reason;
}

export type Primitive = string | number | boolean | undefined;
export interface StatsigUserObject {
  userID?: string;
  customIDs: { stableID: string };
  custom: Record<string, Primitive>;
}

export interface ParamConfig {
  param_type: string;
}
export interface StatsigLike {
  initializeAsync(): Promise<unknown>;
  updateUserAsync(user: StatsigUserObject): Promise<unknown>;
  getParameterStore(name: string): { get<T extends string | boolean>(key: string, fallback: T): T; configuration: Record<string, ParamConfig> | null | 'unavailable' };
  getGate(name: string): boolean;
  getConfig(name: string): Record<string, unknown> | null;
  logEvent(name: string, metadata: Record<string, string>): void;
}

/** `__configuration` is an internal SDK field: if it is absent, renamed, or not an object, report 'unavailable' instead of throwing. */
const readConfiguration = (store: unknown): Record<string, ParamConfig> | null | 'unavailable' => {
  try {
    if (typeof store !== 'object' || store === null || !('__configuration' in store)) return 'unavailable';
    const c = (store as { __configuration: unknown }).__configuration;
    if (c === null) return null;
    return typeof c === 'object' ? (c as Record<string, ParamConfig>) : 'unavailable';
  } catch {
    return 'unavailable';
  }
};

/** The only place that constructs the vendor client. */
export const createRealClient = (key: string, user: StatsigUserObject): StatsigLike => {
  const c = new StatsigClient(key, user);
  return {
    initializeAsync: () => c.initializeAsync(),
    updateUserAsync: (u) => c.updateUserAsync(u),
    getParameterStore: (name) => {
      const s = c.getParameterStore(name);
      return {
        get: (k, fb) => s.get(k, fb) as typeof fb,
        configuration: readConfiguration(s),
      };
    },
    getGate: (name) => c.getFeatureGate(name).value,
    getConfig: (name) => {
      const cfg = c.getDynamicConfig(name);
      return cfg.details.reason === 'Unrecognized' || cfg.details.reason.startsWith('Unrecognized') ? null : cfg.value;
    },
    logEvent: (name, metadata) => c.logEvent({ eventName: name, metadata }),
  };
};

export const userFromProfile = (p: Profile): StatsigUserObject => {
  const a = p.attribution;
  const custom: Record<string, Primitive> = {
    ...p.traits.set,
    ...p.traits.setOnce,
    first_touch_source: a.firstTouch.source,
    first_touch_medium: a.firstTouch.medium,
    first_touch_campaign: a.firstTouch.campaign,
    first_touch_channel: a.firstTouch.channel,
    session_touch_source: a.sessionTouch.source,
    session_touch_medium: a.sessionTouch.medium,
    session_touch_campaign: a.sessionTouch.campaign,
    session_touch_channel: a.sessionTouch.channel,
  };
  return {
    ...(p.ids.userId ? { userID: p.ids.userId } : {}),
    customIDs: { stableID: p.ids.deviceId },
    custom,
  };
};

export interface PreviewResolver {
  active(): boolean;
  get(kind: 'param' | 'gate' | 'config', name: string, key?: string): unknown;
}

export type InitState = 'local' | 'initializing' | 'ready' | 'timed_out' | 'failed';

export interface StatsigSnapshotEntry {
  name: string;
  value: string;
  source: Source;
  reason?: Reason;
}
export interface SetupFailure {
  name: string;
  reason: 'missing_binding' | 'type_mismatch';
}
export interface StatsigDiagnostics {
  mode: 'local' | 'live' | 'fallback';
  initState: InitState;
  waitResult: string;
  environment: string;
  generation: number;
  snapshots: StatsigSnapshotEntry[];
  setupFailures: SetupFailure[];
  preview: boolean;
  declined: number;
  sent: number;
}

export interface StatsigDeps {
  key: string;
  makeClient: (user: StatsigUserObject) => StatsigLike;
  getProfile: () => Profile;
  preview?: PreviewResolver;
  waitMs?: number;
}

const show = (v: unknown) => (typeof v === 'string' ? JSON.stringify(v) : String(v));

export const createStatsigService = (deps: StatsigDeps) => {
  const live = deps.key !== '';
  const waitMs = deps.waitMs ?? STATSIG_INIT_WAIT_MS;
  let client: StatsigLike | null = null;
  let initState: InitState = live ? 'initializing' : 'local';
  let waitResult = live ? 'pending' : 'not applicable (local mode)';
  let generation = 0;
  let readyGeneration = -1;
  let userSig = '';
  let chain: Promise<void> = Promise.resolve();
  let navCache = new Map<string, Resolved<unknown>>();
  let snapshots = new Map<string, StatsigSnapshotEntry>();
  const failures = new Map<string, SetupFailure>();
  const failureKeys = new Set<string>();
  let declined = 0;
  let sent = 0;
  let diag: StatsigDiagnostics | null = null;
  const listeners = new Set<() => void>();
  const changed = () => {
    diag = null;
    queueMicrotask(() => listeners.forEach((l) => l()));
  };

  const enqueue = (op: () => Promise<void> | void) => {
    chain = chain.then(op).catch(() => {
      initState = initState === 'ready' ? initState : 'failed';
      changed();
    });
    return chain;
  };

  /** Builds a new user object when the shared profile changed; each change starts a new generation. */
  const syncProfile = () => {
    if (!live) return;
    const user = userFromProfile(deps.getProfile());
    const sig = JSON.stringify(user);
    if (sig === userSig) return;
    userSig = sig;
    generation += 1;
    const gen = generation;
    if (!client) {
      client = deps.makeClient(user);
      const c = client;
      enqueue(async () => {
        await c.initializeAsync();
        if (gen === generation) readyGeneration = gen;
        initState = 'ready';
        changed();
      });
      return;
    }
    const c = client;
    enqueue(async () => {
      await c.updateUserAsync(user);
      if (gen === generation) {
        readyGeneration = gen;
        changed();
      }
    });
  };

  const record = (name: string, r: Resolved<unknown>) => {
    snapshots.set(name, { name, value: show(r.value), source: r.source, reason: r.reason });
    changed();
  };

  const fail = (name: string, reason: 'missing_binding' | 'type_mismatch') => {
    const k = `${generation}:${name}:${reason}`;
    if (failureKeys.has(k)) return;
    failureKeys.add(k);
    failures.set(name, { name, reason });
  };

  const fallbackReason = (): Reason => (initState === 'failed' ? 'error' : 'timeout');

  const resolve = <T,>(cacheKey: string, label: string, def: T, previewKind: 'param' | 'gate' | 'config', previewName: string, previewKey: string | undefined, read: (c: StatsigLike) => Resolved<T>): Resolved<T> => {
    if (deps.preview?.active()) {
      const o = deps.preview.get(previewKind, previewName, previewKey);
      const r: Resolved<T> = o === undefined ? { value: def, source: 'preview' } : { value: o as T, source: 'preview' };
      record(label, r);
      return r;
    }
    const hit = navCache.get(cacheKey);
    if (hit) return hit as Resolved<T>;
    let r: Resolved<T>;
    if (!live) r = { value: def, source: 'default', reason: 'no_key' };
    else {
      syncProfile();
      if (!client || readyGeneration !== generation) r = { value: def, source: 'default', reason: fallbackReason() };
      else {
        try {
          r = read(client);
        } catch {
          r = { value: def, source: 'default', reason: 'error' };
        }
      }
    }
    navCache.set(cacheKey, r);
    record(label, r);
    return r;
  };

  const service = {
    mode: (): 'local' | 'live' | 'fallback' => (!live ? 'local' : initState === 'ready' ? 'live' : 'fallback'),

    /** Starts live initialization, waiting at most `waitMs`; the UI continues on defaults afterwards. */
    start(): Promise<void> {
      if (!live) return Promise.resolve();
      syncProfile();
      const started = Date.now();
      return Promise.race([
        chain.then(() => {
          waitResult = `initialized in ${Date.now() - started} ms`;
          changed();
        }),
        new Promise<void>((resolve) =>
          setTimeout(() => {
            if (initState === 'initializing') {
              initState = 'timed_out';
              waitResult = `timed out after ${waitMs} ms; UI continued on defaults`;
              changed();
            }
            resolve();
          }, waitMs),
        ),
      ]);
    },

    syncProfile,

    /** Safe route boundary: values are re-evaluated for the next page. */
    boundary() {
      navCache = new Map();
      if (live) syncProfile();
    },

    readParam<T extends string | boolean>(store: string, key: string, def: T, valid?: (v: T) => boolean): Resolved<T> {
      const label = `${store}.${key}`;
      return resolve<T>(label, label, def, 'param', store, key, (c) => {
        const s = c.getParameterStore(store);
        const cfg = s.configuration;
        if (cfg === 'unavailable') return { value: def, source: 'default', reason: 'error' };
        if (!cfg || !(key in cfg)) {
          fail(label, 'missing_binding');
          return { value: def, source: 'default', reason: 'missing_binding' };
        }
        if (cfg[key].param_type !== typeof def) {
          fail(label, 'type_mismatch');
          return { value: def, source: 'default', reason: 'type_mismatch' };
        }
        const v = s.get<T>(key, def);
        if (valid && !valid(v)) {
          fail(label, 'type_mismatch');
          return { value: def, source: 'default', reason: 'type_mismatch' };
        }
        return { value: v, source: 'statsig' };
      });
    },

    readGate(name: string, def = false): Resolved<boolean> {
      return resolve<boolean>(`gate:${name}`, name, def, 'gate', name, undefined, (c) => ({ value: c.getGate(name), source: 'statsig' }));
    },

    readConfig(name: string): Resolved<Record<string, unknown> | null> {
      return resolve<Record<string, unknown> | null>(`config:${name}`, name, null, 'config', name, undefined, (c) => {
        const v = c.getConfig(name);
        if (v === null) {
          fail(name, 'missing_binding');
          return { value: null, source: 'default', reason: 'missing_binding' };
        }
        return { value: v, source: 'statsig' };
      });
    },

    /** Sends a business event to Statsig, after any pending identity update, in order. */
    logEvent(name: string, metadata: Record<string, string>) {
      if (!live) {
        declined += 1;
        changed();
        return;
      }
      syncProfile();
      const c = client;
      sent += 1;
      if (c) enqueue(() => c.logEvent(name, metadata));
      changed();
    },

    diagnostics(): StatsigDiagnostics {
      if (!diag) {
        diag = {
          mode: service.mode(),
          initState,
          waitResult,
          environment: 'SDK default (no tier set by the app)',
          generation,
          snapshots: [...snapshots.values()],
          setupFailures: [...failures.values()],
          preview: !!deps.preview?.active(),
          declined,
          sent,
        };
      }
      return diag;
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    resetSnapshots() {
      snapshots = new Map();
      failures.clear();
      failureKeys.clear();
      changed();
    },
    flush: () => chain,
  };
  return service;
};

export type StatsigService = ReturnType<typeof createStatsigService>;
