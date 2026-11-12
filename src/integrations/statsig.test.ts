import { afterEach, describe, expect, it, vi } from 'vitest';

const vendor = vi.hoisted(() => ({ constructed: 0, store: null as unknown }));
vi.mock('@statsig/js-client', () => ({
  StatsigClient: class {
    constructor() {
      vendor.constructed += 1;
    }
    getParameterStore() {
      return vendor.store;
    }
  },
}));

import { buildProfile } from '../identity/profile';
import type { AttributionState } from '../identity/attribution';
import { createPreview } from '../presenter/preview';
import { createStore, type StorageLike } from '../state/store';
import { createStatsigSink, toStatsigMetadata } from '../telemetry/statsigSink';
import { createPageParams } from './pageParameters';
import { createRealClient, createStatsigService, userFromProfile, type ParamConfig, type StatsigLike, type StatsigUserObject } from './statsig';

const memory = (): StorageLike => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
};

const touch = { source: 'direct', medium: 'none', campaign: 'none', channel: 'direct' };
const attribution = { firstTouch: touch, sessionTouch: touch, sessionId: 's1' } as unknown as AttributionState;

interface Deferred {
  user: StatsigUserObject;
  resolve: () => void;
}

const fakeClient = (cfg: Record<string, Record<string, { param_type: string; value: unknown }> | null> = {}, gates: Record<string, boolean> = {}, configs: Record<string, Record<string, unknown>> = {}) => {
  const calls: string[] = [];
  const updates: Deferred[] = [];
  const logged: { name: string; metadata: Record<string, string>; user: string }[] = [];
  let current: StatsigUserObject | null = null;
  let autoResolve = true;
  const client: StatsigLike = {
    initializeAsync: async () => void calls.push('init'),
    updateUserAsync: (user) => {
      calls.push('update');
      if (autoResolve) {
        current = user;
        return Promise.resolve();
      }
      return new Promise<void>((resolve) =>
        updates.push({
          user,
          resolve: () => {
            current = user;
            resolve();
          },
        }),
      );
    },
    getParameterStore: (name) => {
      calls.push(`store:${name}`);
      const s = cfg[name] ?? null;
      const configuration: Record<string, ParamConfig> | null = s ? Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { param_type: v.param_type }])) : null;
      return { get: (key, fb) => ((s && s[key] ? s[key].value : fb) as typeof fb), configuration };
    },
    getGate: (name) => {
      calls.push(`gate:${name}`);
      return gates[name] ?? false;
    },
    getConfig: (name) => {
      calls.push(`config:${name}`);
      return configs[name] ?? null;
    },
    logEvent: (name, metadata) => void logged.push({ name, metadata, user: JSON.stringify(current) }),
  };
  return { client, calls, updates, logged, hold: () => (autoResolve = false), user: () => current, setUser: (u: StatsigUserObject) => void (current = u) };
};

const setup = (key: string, f: ReturnType<typeof fakeClient>, opts: { preview?: ReturnType<typeof createPreview>; waitMs?: number } = {}) => {
  const store = createStore(memory(), {});
  const service = createStatsigService({
    key,
    makeClient: (u) => {
      f.setUser(u);
      return f.client;
    },
    getProfile: () => buildProfile(store.getSnapshot(), attribution, 'home'),
    preview: opts.preview?.resolver,
    waitMs: opts.waitMs,
  });
  return { store, service, params: createPageParams(service) };
};

const tick = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve();
};

const flush = async (s: { service: { flush(): Promise<void> } }) => {
  for (let i = 0; i < 5; i++) await s.service.flush();
};

afterEach(() => {
  vi.useRealTimers();
  vendor.constructed = 0;
});

describe('identity', () => {
  it('keeps the stable ID on sign-in and rotates it on sign-out', () => {
    const store = createStore(memory(), {});
    const before = store.getSnapshot().anonymousId;
    store.signIn();
    const signedIn = userFromProfile(buildProfile(store.getSnapshot(), attribution, 'home'));
    expect(signedIn.customIDs.stableID).toBe(before);
    expect(signedIn.userID).toBeTruthy();
    store.signOut();
    const out = userFromProfile(buildProfile(store.getSnapshot(), attribution, 'home'));
    expect(out.userID).toBeUndefined();
    expect(out.customIDs.stableID).not.toBe(before);
    expect(out.custom.traffic_type).toBe('live_demo');
  });

  it('awaits the profile update before the dependent evaluation', async () => {
    const f = fakeClient({ ampliloan_home: { cta_label: { param_type: 'string', value: 'Go' } } });
    const s = setup('k', f);
    s.service.syncProfile();
    await flush(s);
    s.service.boundary();
    expect(s.params.getPageParams('home').get('cta_label').value).toBe('Go');
    s.store.signIn();
    f.hold();
    s.service.syncProfile();
    s.service.boundary();
    await tick();
    const r = s.params.getPageParams('home').get('cta_label');
    expect(r).toMatchObject({ value: 'Check your rate', source: 'default', reason: 'timeout' });
    f.updates[0].resolve();
    await tick();
    s.service.boundary();
    expect(s.params.getPageParams('home').get('cta_label').source).toBe('statsig');
  });

  it('ignores a stale response and never mixes identities', async () => {
    const f = fakeClient({ ampliloan_home: { cta_label: { param_type: 'string', value: 'Go' } } });
    const s = setup('k', f);
    s.service.syncProfile();
    await flush(s);
    f.hold();
    s.store.signIn();
    s.service.syncProfile();
    s.store.signOut();
    s.service.syncProfile();
    await tick();
    expect(f.updates.length).toBe(1);
    f.updates[0].resolve();
    await tick();
    s.service.boundary();
    expect(s.params.getPageParams('home').get('cta_label').source).toBe('default');
    expect(f.updates.length).toBe(2);
    f.updates[1].resolve();
    await tick();
    s.service.boundary();
    expect(s.params.getPageParams('home').get('cta_label').source).toBe('statsig');
    expect(f.user()?.userID).toBeUndefined();
  });

  it('logs events in order under the identity they belong to', async () => {
    const f = fakeClient();
    const s = setup('k', f);
    s.service.syncProfile();
    s.service.logEvent('A', {});
    s.store.signIn();
    s.service.syncProfile();
    s.service.logEvent('B', {});
    await flush(s);
    await flush(s);
    expect(JSON.parse(f.logged[0].user)).not.toHaveProperty('userID');
    expect(JSON.parse(f.logged[1].user).userID).toBeTruthy();
  });
});

describe('lazy reads and fallbacks', () => {
  it('adds no reads for unused parameters and none for rendering diagnostics', async () => {
    const f = fakeClient({ ampliloan_home: { cta_label: { param_type: 'string', value: 'Go' } } });
    const s = setup('k', f);
    s.service.syncProfile();
    await flush(s);
    const base = f.calls.length;
    s.service.diagnostics();
    s.service.diagnostics();
    expect(f.calls.length).toBe(base);
    s.params.getPageParams('home').get('cta_label');
    expect(f.calls.filter((c) => c.startsWith('store:'))).toEqual(['store:ampliloan_home']);
    s.params.getPageParams('home').get('cta_label');
    expect(f.calls.filter((c) => c.startsWith('store:')).length).toBe(1);
  });

  it('returns defaults and records one setup failure for missing binding and type mismatch', async () => {
    const f = fakeClient({ ampliloan_application: { show_reassurance: { param_type: 'string', value: 'x' } } });
    const s = setup('k', f);
    s.service.syncProfile();
    await flush(s);
    const app = s.params.getPageParams('application');
    expect(app.get('show_reassurance')).toMatchObject({ value: false, reason: 'type_mismatch' });
    s.service.boundary();
    expect(app.get('show_reassurance').reason).toBe('type_mismatch');
    expect(s.params.getPageParams('home').get('hero_headline')).toMatchObject({ value: 'A clearer path to the loan you need', reason: 'missing_binding' });
    const failures = s.service.diagnostics().setupFailures;
    expect(failures.map((x) => x.reason).sort()).toEqual(['missing_binding', 'type_mismatch']);
  });

  it('falls back for an unknown progress_style', async () => {
    const f = fakeClient({ ampliloan_application: { progress_style: { param_type: 'string', value: 'spiral' } } });
    const s = setup('k', f);
    s.service.syncProfile();
    await flush(s);
    expect(s.params.getPageParams('application').get('progress_style').value).toBe('steps');
  });

  it('clamps max_items to 1..5 and rejects non-integers', async () => {
    const read = async (max_items: unknown) => {
      const f = fakeClient({}, {}, { ampliloan_support_content: { max_items } });
      const s = setup('k', f);
      s.service.syncProfile();
      await flush(s);
      return s.params.supportContent().maxItems;
    };
    expect(await read(0)).toBe(1);
    expect(await read(99)).toBe(5);
    expect(await read(4)).toBe(4);
    expect(await read(2.5)).toBe(5);
    expect(await read('4')).toBe(5);
  });

  it('keeps a visible value for the whole navigation', async () => {
    const f = fakeClient();
    const s = setup('k', f, { waitMs: 10 });
    const first = s.params.getPageParams('home').get('cta_label');
    expect(first.source).toBe('default');
    await flush(s);
    expect(s.params.getPageParams('home').get('cta_label')).toBe(first);
  });
});

describe('shipped defaults', () => {
  it('match the Phase 2 copy', () => {
    const f = fakeClient();
    const s = setup('', f);
    const home = s.params.getPageParams('home');
    expect(home.get('hero_headline').value).toBe('A clearer path to the loan you need');
    expect(home.get('cta_label').value).toBe('Check your rate');
    expect(s.params.supportContent()).toMatchObject({ heading: 'Help', body: '', maxItems: 5 });
    expect(s.params.getPageParams('application').get('progress_style').value).toBe('steps');
    expect(s.params.getPageParams('dashboard').get('show_next_steps').value).toBe(true);
  });
});

describe('internal __configuration field', () => {
  const key = (store: unknown) => {
    vendor.store = store;
    const real = createRealClient('k', { customIDs: { stableID: 'x' }, custom: {} });
    return real.getParameterStore('ampliloan_home').configuration;
  };
  it('reports unavailable without throwing when absent, not an object, or throwing', () => {
    expect(key({ get: () => 'x' })).toBe('unavailable');
    expect(key({ __configuration: 'oops' })).toBe('unavailable');
    expect(key({ get __configuration() { throw new Error('renamed'); } })).toBe('unavailable');
    expect(key({ __configuration: null })).toBeNull();
    expect(key({ __configuration: { a: { param_type: 'string' } } })).toEqual({ a: { param_type: 'string' } });
  });
  it('falls back to default with reason error and no setup failure', async () => {
    const f = fakeClient();
    f.client.getParameterStore = () => ({ get: (_k, fb) => fb, configuration: 'unavailable' });
    const s = setup('k', f);
    s.service.syncProfile();
    await flush(s);
    expect(s.params.getPageParams('home').get('cta_label')).toMatchObject({ value: 'Check your rate', source: 'default', reason: 'error' });
    expect(s.service.diagnostics().setupFailures).toEqual([]);
  });
});

describe('preview', () => {
  it('overrides locally with no SDK read, no event send, and clears on off', async () => {
    const f = fakeClient({ ampliloan_home: { cta_label: { param_type: 'string', value: 'Go' } } });
    const preview = createPreview();
    const s = setup('k', f, { preview });
    s.service.syncProfile();
    await flush(s);
    const before = f.calls.length;
    preview.setActive(true);
    preview.setParam('ampliloan_home', 'cta_label', 'Preview CTA');
    preview.setGate(true);
    expect(s.params.getPageParams('home').get('cta_label')).toMatchObject({ value: 'Preview CTA', source: 'preview' });
    expect(s.params.contextualHelp()).toMatchObject({ value: true, source: 'preview' });
    expect(f.calls.length).toBe(before);
    preview.setActive(false);
    expect(preview.getState().params).toEqual({});
    s.service.boundary();
    expect(s.params.getPageParams('home').get('cta_label').source).toBe('statsig');
  });
});

describe('local mode', () => {
  it('constructs no client and makes zero vendor calls while counting declined events', () => {
    const f = fakeClient();
    const makeClient = vi.fn(() => f.client);
    const service = createStatsigService({ key: '', makeClient, getProfile: () => buildProfile(createStore(memory(), {}).getSnapshot(), attribution, 'home') });
    const params = createPageParams(service);
    expect(params.getPageParams('home').get('cta_label')).toMatchObject({ source: 'default', reason: 'no_key' });
    params.contextualHelp();
    params.supportContent();
    createStatsigSink(service).send('Offers Viewed', { a: 1 });
    expect(makeClient).not.toHaveBeenCalled();
    expect(f.calls).toEqual([]);
    expect(vendor.constructed).toBe(0);
    expect(service.mode()).toBe('local');
    expect(service.diagnostics()).toMatchObject({ declined: 1, sent: 0 });
  });
});

describe('failure modes', () => {
  it('continues on defaults within the bounded wait when initialization hangs', async () => {
    vi.useFakeTimers();
    const f = fakeClient();
    f.client.initializeAsync = () => new Promise(() => undefined);
    const s = setup('k', f, { waitMs: 2000 });
    let done = false;
    void s.service.start().then(() => (done = true));
    await vi.advanceTimersByTimeAsync(1999);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(2);
    expect(done).toBe(true);
    expect(s.params.getPageParams('home').get('cta_label')).toMatchObject({ source: 'default', value: 'Check your rate' });
    expect(s.service.diagnostics()).toMatchObject({ mode: 'fallback', initState: 'timed_out' });
    expect(s.service.diagnostics().waitResult).toMatch(/timed out after 2000 ms/);
  });

  it('shows fallback with an error reason when the SDK host is blocked', async () => {
    const f = fakeClient();
    f.client.initializeAsync = () => Promise.reject(new Error('blocked'));
    const s = setup('k', f);
    await s.service.start();
    expect(s.params.getPageParams('home').get('cta_label')).toMatchObject({ source: 'default', reason: 'error' });
    expect(s.service.diagnostics()).toMatchObject({ mode: 'fallback', initState: 'failed' });
  });
});

describe('SDK failure reported through the resolved result', () => {
  it('treats a resolved success:false initialization as fallback with reason error', async () => {
    const f = fakeClient({ ampliloan_home: { cta_label: { param_type: 'string', value: 'Go' } } });
    f.client.initializeAsync = () => Promise.resolve({ success: false, error: new Error('network') });
    const s = setup('k', f);
    await s.service.start();
    expect(s.params.getPageParams('home').get('cta_label')).toMatchObject({ source: 'default', reason: 'error' });
    expect(s.service.diagnostics()).toMatchObject({ mode: 'fallback', initState: 'failed' });
    expect(s.service.diagnostics().waitResult).toMatch(/failed/);
  });

  it('treats a failed user update as fallback and never serves the previous identity', async () => {
    const f = fakeClient({ ampliloan_home: { cta_label: { param_type: 'string', value: 'Go' } } });
    const s = setup('k', f);
    s.service.syncProfile();
    await flush(s);
    f.client.updateUserAsync = () => Promise.resolve({ success: false });
    s.store.signIn();
    s.service.syncProfile();
    await flush(s);
    s.service.boundary();
    expect(s.params.getPageParams('home').get('cta_label')).toMatchObject({ source: 'default', reason: 'error' });
  });
});

describe('metadata mapping', () => {
  it('maps to flat strings with no value field', () => {
    expect(toStatsigMetadata({ a: true, b: false, c: 5000, d: 12.5, e: null, f: undefined, g: 'x', business_event_id: 'id1' })).toEqual({ a: 'true', b: 'false', c: '5000', d: '12.5', g: 'x', business_event_id: 'id1' });
  });

  it('logs the exact event name without a value', async () => {
    const f = fakeClient();
    const s = setup('k', f);
    createStatsigSink(s.service).send('Offers Viewed', { business_event_id: 'e1', amount: 1000 });
    await flush(s);
    expect(f.logged).toHaveLength(1);
    expect(f.logged[0].name).toBe('Offers Viewed');
    expect(f.logged[0].metadata).toEqual({ business_event_id: 'e1', amount: '1000' });
  });
});
