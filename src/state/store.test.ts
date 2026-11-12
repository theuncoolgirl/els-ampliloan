import { beforeEach, describe, expect, it } from 'vitest';
import { LOAN_FIXTURES, LOAN_TYPES, offersFor, type LoanType } from './fixtures';
import { amountBand, validateReview } from './model';
import { createStore, STORAGE_KEY, type StorageLike } from './store';

const memory = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

let storage: ReturnType<typeof memory>;
let store: ReturnType<typeof createStore>;

beforeEach(() => {
  storage = memory();
  store = createStore(storage);
});

const fillToReview = (t: LoanType) => {
  const f = LOAN_FIXTURES[t];
  expect(store.createApplication(t)).toEqual({ ok: true });
  expect(store.saveDraft({ requestedAmount: f.amountDefault, purposeId: f.purposes[0].id, lastStepId: 'offers' })).toEqual({ ok: true });
  expect(store.selectOffer(offersFor(t)[0].id)).toEqual({ ok: true });
  store.saveDraft({ lastStepId: 'review' });
};

describe('shared journey', () => {
  it.each(LOAN_TYPES)('%s completes to submitted through one transition graph', (t) => {
    fillToReview(t);
    expect(store.submit({ consent: true })).toEqual({ ok: true });
    const a = store.getSnapshot().active!;
    expect(a.status).toBe('submitted');
    expect(a.submittedAt).toBeTruthy();
    expect(a.loanType).toBe(t);
    expect(store.advanceStatus()).toEqual({ ok: true });
    expect(store.advanceStatus()).toEqual({ ok: true });
    expect(store.getSnapshot().active!.status).toBe('decision_ready');
  });
});

describe('submit', () => {
  it('rapid double submit yields one transition and one submittedAt', () => {
    fillToReview('personal');
    const results = [store.submit({ consent: true }), store.submit({ consent: true })];
    expect(results).toEqual([{ ok: true }, { ok: false, code: 'already_submitted' }]);
    const first = store.getSnapshot().active!.submittedAt;
    store.submit({ consent: true });
    expect(store.getSnapshot().active!.submittedAt).toBe(first);
  });

  it('two tabs sharing storage cannot both submit', () => {
    fillToReview('mortgage');
    const tabB = createStore(storage);
    expect(tabB.getSnapshot().active?.status).toBe('draft');
    expect(store.submit({ consent: true }).ok).toBe(true);
    expect(tabB.submit({ consent: true })).toEqual({ ok: false, code: 'already_submitted' });
  });

  it('invalid review cannot submit and returns the right code', () => {
    store.createApplication('personal');
    expect(store.submit({ consent: true })).toEqual({ ok: false, code: 'invalid_amount' });
    store.saveDraft({ requestedAmount: 15000 });
    expect(store.submit({ consent: true })).toEqual({ ok: false, code: 'required_field' });
    store.saveDraft({ purposeId: 'major_purchase' });
    expect(store.submit({ consent: true })).toEqual({ ok: false, code: 'missing_offer' });
    store.selectOffer('personal_fast_24');
    expect(store.submit({ consent: false })).toEqual({ ok: false, code: 'missing_consent' });
    expect(store.getSnapshot().active!.status).toBe('draft');
    expect(validateReview(store.getSnapshot().active!, true)).toBeNull();
  });

  it('rejects offers from another loan type', () => {
    store.createApplication('personal');
    expect(store.selectOffer('mortgage_30yr_fixed')).toEqual({ ok: false, code: 'missing_offer' });
  });
});

describe('loan type lock and status', () => {
  it('cannot change loan type; new application is explicit', () => {
    store.createApplication('personal');
    const id = store.getSnapshot().active!.applicationId;
    expect(store.createApplication('mortgage')).toEqual({ ok: false, code: 'exists' });
    expect(store.getSnapshot().active!.loanType).toBe('personal');
    store.startNewApplication('mortgage');
    const a = store.getSnapshot().active!;
    expect(a.loanType).toBe('mortgage');
    expect(a.applicationId).not.toBe(id);
  });

  it('status moves forward only and not from draft', () => {
    fillToReview('personal');
    expect(store.advanceStatus()).toEqual({ ok: false, code: 'not_submitted' });
  });

  it('stops at the final status and gates tasks', () => {
    store.selectPersona('existing_customer');
    expect(store.completeTask('confirm_next_steps', true)).toEqual({ ok: false, code: 'task_unavailable' });
    expect(store.completeTask('verify_details', true)).toEqual({ ok: true });
    store.advanceStatus();
    expect(store.getSnapshot().active!.status).toBe('decision_ready');
    expect(store.completeTask('confirm_next_steps', true)).toEqual({ ok: true });
    expect(store.advanceStatus()).toEqual({ ok: false, code: 'at_final_status' });
    expect(store.getSnapshot().active!.status).toBe('decision_ready');
  });

  it('draft edits are refused after submission', () => {
    fillToReview('personal');
    store.submit({ consent: true });
    expect(store.saveDraft({ requestedAmount: 2000 })).toEqual({ ok: false, code: 'already_submitted' });
  });
});

describe('amount bands', () => {
  it.each([
    [24999.99, 'under_25k'],
    [25000, '25k_to_under_100k'],
    [99999.99, '25k_to_under_100k'],
    [100000, '100k_to_under_500k'],
    [499999.99, '100k_to_under_500k'],
    [500000, '500k_plus'],
  ])('%s -> %s', (n, band) => {
    expect(amountBand(n)).toBe(band);
  });
});

describe('persistence and owners', () => {
  it.each(['not json', '{"schemaVersion":99}', JSON.stringify({ schemaVersion: 1, owners: 5 })])(
    'recovers from corrupt storage: %s',
    (raw) => {
      storage.setItem(STORAGE_KEY, raw);
      const s = createStore(storage);
      const snap = s.getSnapshot();
      expect(snap.active).toBeNull();
      expect(snap.notice).toBeTruthy();
      s.dismissNotice();
      expect(s.getSnapshot().notice).toBeNull();
      expect(s.createApplication('personal').ok).toBe(true);
    },
  );

  it('survives a reload with the same applicationId', () => {
    store.createApplication('personal');
    const id = store.getSnapshot().active!.applicationId;
    expect(createStore(storage).getSnapshot().active!.applicationId).toBe(id);
  });

  it('two owners cannot see each other', () => {
    store.signIn('profile_a');
    store.createApplication('personal');
    store.signIn('profile_b');
    expect(store.getSnapshot().active).toBeNull();
    store.createApplication('mortgage');
    store.signOut();
    expect(store.getSnapshot().active).toBeNull();
    store.signIn('profile_a');
    expect(store.getSnapshot().active!.loanType).toBe('personal');
  });

  it('sign-up keeps the anonymous draft with the new profile', () => {
    store.createApplication('personal');
    const id = store.getSnapshot().active!.applicationId;
    store.signUp();
    expect(store.getSnapshot().profileId).toBeTruthy();
    expect(store.getSnapshot().active!.applicationId).toBe(id);
  });

  it('reset application keeps owner; new-user reset clears it', () => {
    store.signIn('profile_a');
    store.createApplication('personal');
    const before = store.getSnapshot();
    store.resetApplication();
    const after = store.getSnapshot();
    expect(after.ownerKey).toBe(before.ownerKey);
    expect(after.active!.applicationId).not.toBe(before.active!.applicationId);
    expect(after.active!.loanType).toBe('personal');
    store.startAsNewDemoUser();
    const fresh = store.getSnapshot();
    expect(fresh.profileId).toBeNull();
    expect(fresh.anonymousId).not.toBe(before.anonymousId);
    expect(fresh.active).toBeNull();
    store.signIn('profile_a');
    expect(store.getSnapshot().active).toBeNull();
  });

  it('personas are deterministic', () => {
    store.selectPersona('returning_mortgage');
    const a = store.getSnapshot().active!;
    expect([a.loanType, a.status, a.lastStepId]).toEqual(['mortgage', 'draft', 'offers']);
    store.selectPersona('business_owner');
    expect(store.getSnapshot().intent).toBe('small_business');
    expect(store.getSnapshot().active).toBeNull();
    store.selectPersona('existing_customer');
    expect(store.getSnapshot().active!.status).toBe('under_review');
  });
});
