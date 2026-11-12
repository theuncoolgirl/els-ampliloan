import { beforeEach, describe, expect, it, vi } from 'vitest';

const vendor = vi.hoisted(() => ({ calls: [] as string[] }));
vi.mock('@amplitude/unified', () => {
  const rec = (n: string) => (...a: unknown[]) => {
    vendor.calls.push(n);
    return { promise: Promise.resolve({ code: 200 }), a };
  };
  return {
    initAll: rec('initAll'),
    track: rec('track'),
    identify: rec('identify'),
    setDeviceId: rec('setDeviceId'),
    setUserId: rec('setUserId'),
    Identify: class {
      set() {}
      setOnce() {}
    },
  };
});

import { createAttribution, SESSION_TIMEOUT_MS, touchFromSearch } from '../identity/attribution';
import { createLocalAdapter } from '../integrations/amplitude';
import { LOAN_FIXTURES, offersFor } from '../state/fixtures';
import { createStore, type StorageLike } from '../state/store';
import type { AmplitudeAdapter, DeliveryState, Ids, TraitUpdate, TrackRequest } from './adapter';
import { EVENT_CONTRACT, EVENT_NAMES, PROPERTY_SPECS, validateEvent } from './events';
import { createTelemetry } from './telemetry';

const memory = (): StorageLike => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
};

type Call = { kind: 'setIdentity'; ids: Ids } | { kind: 'identify'; ids: Ids; traits: TraitUpdate } | { kind: 'track'; req: TrackRequest };

const fakeAdapter = () => {
  const calls: Call[] = [];
  const adapter: AmplitudeAdapter = {
    mode: 'live',
    initState: () => 'ready',
    setIdentity: (ids) => calls.push({ kind: 'setIdentity', ids }),
    identify: (ids, traits) => calls.push({ kind: 'identify', ids, traits }),
    track: (req, onState: (s: DeliveryState) => void) => {
      calls.push({ kind: 'track', req });
      onState('accepted');
    },
  };
  return { adapter, calls, tracks: () => calls.filter((c): c is Extract<Call, { kind: 'track' }> => c.kind === 'track').map((c) => c.req) };
};

let clock = 1_800_000_000_000;
let n = 0;
let search = '';

const setup = () => {
  const storage = memory();
  const attrStorage = memory();
  const fake = fakeAdapter();
  const attribution = createAttribution({ storage: attrStorage, now: () => clock, search: () => search, uuid: () => `sess-${++n}` });
  let store!: ReturnType<typeof createStore>;
  const telemetry = createTelemetry({
    adapter: fake.adapter,
    attribution,
    getSnapshot: () => store.getSnapshot(),
    pageId: () => 'application',
    now: () => clock,
    uuid: () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`,
  });
  store = createStore(storage, telemetry.hooks);
  return { storage, attrStorage, fake, attribution, telemetry, store };
};

beforeEach(() => {
  clock = 1_800_000_000_000;
  n = 0;
  search = '';
  vendor.calls.length = 0;
});

const SAMPLE: Record<string, unknown> = {
  business_event_id: 'e1',
  schema_version: '1.0',
  traffic_type: 'live_demo',
  page_id: 'home',
  session_id: 's1',
  loan_type: 'personal',
  application_id: 'a1',
  application_status: 'draft',
  entry_point: 'hero',
  step_id: 'loan_details',
  step_index: 1,
  requested_amount: 15000,
  amount_band: 'under_25k',
  offer_id: 'personal_standard_36',
  term_months: 36,
  validation_error_code: 'invalid_amount',
  elapsed_seconds: 12,
  task_id: 'verify_details',
  help_topic: 'general',
  identity_method: 'demo_signin',
  first_touch_source: 'google',
  first_touch_medium: 'cpc',
  first_touch_campaign: 'spring_rates',
  first_touch_channel: 'paid_search',
  session_touch_source: 'unknown',
  session_touch_medium: 'unknown',
  session_touch_campaign: 'unknown',
  session_touch_channel: 'direct',
};

const valid = (name: (typeof EVENT_NAMES)[number]) => {
  const c = EVENT_CONTRACT[name];
  const props = Object.fromEntries([...c.required].map((k) => [k, SAMPLE[k]]));
  if (name === 'Application Submitted') props.application_status = 'submitted';
  return props;
};

describe('contract validation', () => {
  it('has the 17 contract events', () => expect(EVENT_NAMES).toHaveLength(17));

  it.each(EVENT_NAMES)('%s validates with required properties', (name) => {
    expect(validateEvent(name, valid(name))).toEqual({ ok: true });
  });

  it.each(EVENT_NAMES)('%s rejects each missing required property', (name) => {
    for (const k of EVENT_CONTRACT[name].required) {
      const p = valid(name);
      delete p[k];
      expect(validateEvent(name, p).ok, `${name} without ${k}`).toBe(false);
    }
  });

  it.each(EVENT_NAMES)('%s rejects invalid enum and null values', (name) => {
    for (const k of EVENT_CONTRACT[name].required) {
      if (PROPERTY_SPECS[k].values) expect(validateEvent(name, { ...valid(name), [k]: 'not_allowed' }).ok, `${name} ${k}`).toBe(false);
      expect(validateEvent(name, { ...valid(name), [k]: null }).ok).toBe(false);
    }
  });

  it('rejects Application Step Completed and unknown properties', () => {
    expect(validateEvent('Application Step Completed', valid('Application Step Viewed')).ok).toBe(false);
    expect(validateEvent('Application Step Viewed', { ...valid('Application Step Viewed'), free_text: 'x' }).ok).toBe(false);
    expect(EVENT_NAMES as readonly string[]).not.toContain('Application Step Completed');
  });

  it('enforces loan_type unknown, status, and consistency rules', () => {
    expect(validateEvent('Application Started', { ...valid('Application Started'), loan_type: 'unknown' }).ok).toBe(false);
    expect(validateEvent('Rate Check Started', { ...valid('Rate Check Started'), loan_type: 'unknown' }).ok).toBe(true);
    expect(validateEvent('Application Submitted', { ...valid('Application Submitted'), application_status: 'draft' }).ok).toBe(false);
    expect(validateEvent('Offers Viewed', { ...valid('Offers Viewed'), amount_band: '500k_plus' }).ok).toBe(false);
    expect(validateEvent('Help Requested', { ...valid('Help Requested'), application_id: 'a1' }).ok).toBe(false);
    expect(validateEvent('Help Requested', { ...valid('Help Requested'), application_id: 'a1', application_status: 'draft' }).ok).toBe(true);
  });
});

const completeToReview = (s: ReturnType<typeof setup>, t: 'personal' = 'personal') => {
  const f = LOAN_FIXTURES[t];
  s.store.createApplication(t);
  s.store.saveDraft({ requestedAmount: f.amountDefault, purposeId: f.purposes[0].id, lastStepId: 'offers' });
  s.store.selectOffer(offersFor(t)[0].id);
};

describe('dispatch', () => {
  it('Application Submitted fires exactly once, even with rapid double submit and two tabs', () => {
    const s = setup();
    completeToReview(s);
    const tabB = createStore(s.storage, s.telemetry.hooks);
    s.store.submit({ consent: true });
    s.store.submit({ consent: true });
    tabB.submit({ consent: true });
    const submitted = s.fake.tracks().filter((t) => t.name === 'Application Submitted');
    expect(submitted).toHaveLength(1);
    expect(submitted[0].properties.application_status).toBe('submitted');
    expect(submitted[0].insertId).toBe(submitted[0].properties.business_event_id);
    expect(s.fake.tracks().map((t) => t.name)).not.toContain('Application Step Completed');
  });

  it('does not emit Submitted for an invalid review', () => {
    const s = setup();
    s.store.createApplication('personal');
    s.store.submit({ consent: true });
    expect(s.fake.tracks().map((t) => t.name)).toEqual(['Application Started']);
  });

  it('updates the profile before the dependent event', () => {
    const s = setup();
    s.store.signIn('profile_a');
    const kinds = s.fake.calls.map((c) => c.kind);
    expect(kinds.slice(0, 3)).toEqual(['setIdentity', 'identify', 'track']);
    const track = s.fake.tracks()[0];
    expect(track.name).toBe('Signed In');
    expect(track.ids.userId).toBe('profile_a');
    const ident = s.fake.calls.find((c) => c.kind === 'identify')!;
    expect(ident.kind === 'identify' && ident.traits.set.customer_relationship).toBe('prospect');
    expect(ident.kind === 'identify' && ident.traits.setOnce.acquisition_channel_first_touch).toBe('direct');
  });

  it('sign-out is sent under the old identity and the new identity never inherits the known ID', () => {
    const s = setup();
    s.store.signIn('profile_a');
    const old = s.store.getSnapshot();
    s.store.signOut();
    s.telemetry.rateCheckStarted('hero');
    const tracks = s.fake.tracks();
    const out = tracks.find((t) => t.name === 'Signed Out')!;
    expect(out.ids).toEqual({ deviceId: old.anonymousId, userId: 'profile_a' });
    const after = tracks[tracks.length - 1];
    expect(after.name).toBe('Rate Check Started');
    expect(after.ids.userId).toBeUndefined();
    expect(after.ids.deviceId).not.toBe(old.anonymousId);
  });

  it('new-user reset clears the known identity, the application, and attribution', () => {
    search = '?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates';
    const s = setup();
    s.store.signIn('profile_a');
    completeToReview(s);
    const oldDevice = s.store.getSnapshot().anonymousId;
    s.store.startAsNewDemoUser();
    s.telemetry.rateCheckStarted('hero');
    const last = s.fake.tracks().at(-1)!;
    expect(last.ids.userId).toBeUndefined();
    expect(last.ids.deviceId).not.toBe(oldDevice);
    expect(last.properties.loan_type).toBe('unknown');
    expect(last.properties.first_touch_channel).toBe('direct');
  });

  it('application reset keeps identity and attribution but creates a new application ID', () => {
    search = '?utm_source=bing&utm_medium=cpc&utm_campaign=spring_rates';
    const s = setup();
    s.store.signIn('profile_a');
    s.store.createApplication('personal');
    const first = s.store.getSnapshot().active!.applicationId;
    s.store.resetApplication();
    const started = s.fake.tracks().filter((t) => t.name === 'Application Started');
    expect(started).toHaveLength(2);
    expect(started[1].properties.application_id).not.toBe(first);
    expect(started[1].ids.userId).toBe('profile_a');
    expect(started[1].properties.first_touch_source).toBe('bing');
  });

  it('drops and counts invalid events and never sends them', () => {
    const s = setup();
    s.store.createApplication('personal');
    s.store.selectOffer('personal_fast_24');
    expect(s.fake.tracks().map((t) => t.name)).toEqual(['Application Started']);
    expect(s.telemetry.diagnostics().dropped).toBe(1);
    expect(s.telemetry.diagnostics().statsigDeclined).toBe(1);
  });

  it('persona with a fixed profile emits Signed In; anonymous personas emit nothing; seed emits no business event', () => {
    const s = setup();
    s.store.selectPersona('first_time_personal');
    s.store.selectPersona('business_owner');
    expect(s.fake.tracks()).toHaveLength(0);
    s.store.selectPersona('existing_customer');
    expect(s.fake.tracks().map((t) => t.name)).toEqual(['Signed In']);
    const t = s.fake.tracks()[0];
    expect(t.properties.first_touch_channel).toBe('direct');
    const ident = s.fake.calls.filter((c) => c.kind === 'identify').at(-1)!;
    expect(ident.kind === 'identify' && ident.traits.set.customer_relationship).toBe('existing_customer');
    expect(ident.kind === 'identify' && ident.traits.set.applications_submitted_count).toBe(1);
  });

  it('keeps no free text or URLs in properties', () => {
    search = '?utm_source=https://evil.example/x&utm_medium=cpc&utm_campaign=<script>';
    const s = setup();
    s.telemetry.rateCheckStarted('hero');
    const p = s.fake.tracks()[0].properties;
    expect(JSON.stringify(p)).not.toMatch(/evil|script|http/);
    expect(p.first_touch_source).toBe('unknown');
    expect(p.first_touch_channel).toBe('unknown');
  });
});

describe('attribution', () => {
  const make = (storage: StorageLike) => createAttribution({ storage, now: () => clock, search: () => search, uuid: () => `sess-${++n}` });

  it('maps landing values through the allowlist', () => {
    expect(touchFromSearch('?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates')).toEqual({ source: 'google', medium: 'cpc', campaign: 'spring_rates', channel: 'paid_search' });
    expect(touchFromSearch('?utm_source=newsletter&utm_medium=email&utm_campaign=first_loan_guide').channel).toBe('email');
    expect(touchFromSearch('?utm_source=partner_hub&utm_medium=referral&utm_campaign=partner_launch').channel).toBe('partner');
    expect(touchFromSearch('')).toEqual({ source: 'unknown', medium: 'unknown', campaign: 'unknown', channel: 'direct' });
    expect(touchFromSearch('?utm_source=zzz&utm_medium=cpc&utm_campaign=nope')).toEqual({ source: 'unknown', medium: 'cpc', campaign: 'unknown', channel: 'unknown' });
    expect(touchFromSearch('?utm_source=google&utm_medium=social')).toMatchObject({ medium: 'unknown', channel: 'unknown' });
  });

  it('first touch survives reload and sign-in; session touch resets after 30 minutes', () => {
    const storage = memory();
    search = '?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates';
    const a = make(storage).current();
    expect(a.firstTouch.channel).toBe('paid_search');
    search = '';
    clock += 5 * 60 * 1000;
    const reloaded = make(storage).current();
    expect(reloaded.firstTouch.channel).toBe('paid_search');
    expect(reloaded.sessionTouch.channel).toBe('paid_search');
    expect(reloaded.sessionId).toBe(a.sessionId);
    clock += SESSION_TIMEOUT_MS;
    const later = make(storage).current();
    expect(later.firstTouch.channel).toBe('paid_search');
    expect(later.sessionTouch.channel).toBe('direct');
    expect(later.sessionId).not.toBe(a.sessionId);
  });

  it('first touch survives sign-in through the telemetry layer', () => {
    search = '?utm_source=newsletter&utm_medium=email&utm_campaign=first_loan_guide';
    const s = setup();
    s.telemetry.rateCheckStarted('hero');
    search = '';
    s.store.signIn('profile_a');
    const t = s.fake.tracks().at(-1)!;
    expect(t.properties.first_touch_channel).toBe('email');
    expect(t.properties.session_touch_channel).toBe('email');
  });
});

describe('local mode', () => {
  it('sends nothing to the vendor without a key', () => {
    const adapter = createLocalAdapter();
    const attribution = createAttribution({ storage: memory(), now: () => clock, search: () => search, uuid: () => 'x' });
    let store!: ReturnType<typeof createStore>;
    const states: DeliveryState[] = [];
    const telemetry = createTelemetry({
      adapter: { ...adapter, track: (r, cb) => adapter.track(r, (st) => { states.push(st); cb(st); }) },
      attribution,
      getSnapshot: () => store.getSnapshot(),
      pageId: () => 'home',
      now: () => clock,
      uuid: () => crypto.randomUUID(),
    });
    store = createStore(memory(), telemetry.hooks);
    store.createApplication('personal');
    telemetry.rateCheckStarted('hero');
    expect(states).toEqual(['local', 'local']);
    expect(vendor.calls).toEqual([]);
  });
});
