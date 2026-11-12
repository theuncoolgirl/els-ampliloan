import {
  LOAN_FIXTURES,
  LOAN_TYPES,
  STATUSES,
  STEP_IDS,
  findOffer,
  type ErrorCode,
  type LoanType,
  type PersonaId,
  type StepId,
  type TaskId,
} from './fixtures';
import {
  nextStatus,
  tasksAvailable,
  validateReview,
  type Application,
  type OwnerData,
  type Persisted,
} from './model';

export const STORAGE_KEY = 'ampliloan.v1';
export const SCHEMA_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type ActionResult<E extends string = string> = { ok: true } | { ok: false; code: E };

export type SubmitResult = { ok: true } | { ok: false; code: ErrorCode | 'already_submitted' | 'no_application' };

export type StartEntry = 'application' | 'persona_control';

export interface StoreHooks {
  applicationStarted?(app: Application, entry: StartEntry): void;
  offerSelected?(app: Application): void;
  submitted?(app: Application): void;
  taskCompleted?(app: Application, taskId: TaskId): void;
  signedIn?(): void;
  signedUp?(): void;
  beforeSignOut?(): void;
  personaSelected?(id: PersonaId): void;
  newUserReset?(): void;
}

export interface Snapshot {
  persona: PersonaId | null;
  anonymousId: string;
  profileId: string | null;
  intent: LoanType | null;
  ownerKey: string;
  ownerLabel: string;
  active: Application | null;
  history: Application[];
  notice: string | null;
}

const newId = () => globalThis.crypto.randomUUID();
const ownerKeyOf = (p: Persisted) => (p.profileId ? `profile:${p.profileId}` : `anon:${p.anonymousId}`);
const emptyOwner = (): OwnerData => ({ active: null, history: [] });

const freshState = (): Persisted => ({
  persona: null,
  schemaVersion: SCHEMA_VERSION,
  anonymousId: newId(),
  profileId: null,
  lastProfileId: null,
  intent: null,
  owners: {},
});

const isApplication = (a: unknown): a is Application => {
  if (!a || typeof a !== 'object') return false;
  const x = a as Record<string, unknown>;
  return (
    typeof x.applicationId === 'string' &&
    (LOAN_TYPES as readonly unknown[]).includes(x.loanType) &&
    (STATUSES as readonly unknown[]).includes(x.status) &&
    typeof x.createdAt === 'string' &&
    typeof x.updatedAt === 'string' &&
    (x.submittedAt === null || typeof x.submittedAt === 'string') &&
    (x.requestedAmount === null || typeof x.requestedAmount === 'number') &&
    (x.purposeId === null || typeof x.purposeId === 'string') &&
    (x.selectedOfferId === null || typeof x.selectedOfferId === 'string') &&
    (STEP_IDS as readonly unknown[]).includes(x.lastStepId) &&
    !!x.tasks &&
    typeof x.tasks === 'object'
  );
};

const isPersisted = (p: unknown): p is Persisted => {
  if (!p || typeof p !== 'object') return false;
  const x = p as Record<string, unknown>;
  if (x.schemaVersion !== SCHEMA_VERSION) return false;
  if (typeof x.anonymousId !== 'string') return false;
  if (x.profileId !== null && typeof x.profileId !== 'string') return false;
  if (x.lastProfileId !== null && typeof x.lastProfileId !== 'string') return false;
  if (x.intent !== null && !(LOAN_TYPES as readonly unknown[]).includes(x.intent)) return false;
  if (!x.owners || typeof x.owners !== 'object') return false;
  return Object.values(x.owners as Record<string, unknown>).every((o) => {
    const od = o as Record<string, unknown>;
    return (
      !!od &&
      (od.active === null || isApplication(od.active)) &&
      Array.isArray(od.history) &&
      od.history.every(isApplication)
    );
  });
};

const PROFILE_PERSONAS: Record<string, PersonaId> = {
  persona_returning_mortgage: 'returning_mortgage',
  persona_existing_customer: 'existing_customer',
};

const PERSONA_TS = '2026-11-01T12:00:00.000Z';

const personaApp = (over: Partial<Application> & Pick<Application, 'applicationId' | 'loanType'>): Application => ({
  status: 'draft',
  createdAt: PERSONA_TS,
  updatedAt: PERSONA_TS,
  submittedAt: null,
  requestedAmount: null,
  purposeId: null,
  selectedOfferId: null,
  lastStepId: 'loan_details',
  tasks: {},
  ...over,
});

export const createStore = (storage: StorageLike, hooks: StoreHooks = {}) => {
  let notice: string | null = null;
  let snapshot: Snapshot | null = null;
  const listeners = new Set<() => void>();

  const read = (): Persisted => {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return freshState();
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isPersisted(parsed)) return parsed;
    } catch {
      /* fall through to discard */
    }
    notice = 'Saved demo data could not be read, so it was cleared and a fresh demo started.';
    const fresh = freshState();
    storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  };

  const write = (p: Persisted) => {
    storage.setItem(STORAGE_KEY, JSON.stringify(p));
    snapshot = null;
    listeners.forEach((l) => l());
  };

  const owner = (p: Persisted): OwnerData => p.owners[ownerKeyOf(p)] ?? emptyOwner();
  const setOwner = (p: Persisted, o: OwnerData) => {
    p.owners[ownerKeyOf(p)] = o;
  };

  const touch = (a: Application): Application => ({ ...a, updatedAt: new Date().toISOString() });

  const blankApp = (loanType: LoanType): Application => {
    const now = new Date().toISOString();
    return {
      applicationId: newId(),
      loanType,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      requestedAmount: null,
      purposeId: null,
      selectedOfferId: null,
      lastStepId: 'loan_details',
      tasks: {},
    };
  };

  const retire = (o: OwnerData): OwnerData => ({
    active: null,
    history: o.active && o.active.status !== 'draft' ? [o.active, ...o.history] : o.history,
  });

  const getSnapshot = (): Snapshot => {
    if (snapshot) return snapshot;
    const p = read();
    const o = owner(p);
    snapshot = {
      anonymousId: p.anonymousId,
      profileId: p.profileId,
      intent: p.intent,
      persona: p.persona ?? null,
      ownerKey: ownerKeyOf(p),
      ownerLabel: p.profileId ? `Signed in (simulated): ${p.profileId}` : 'Anonymous browser',
      active: o.active,
      history: o.history,
      notice,
    };
    return snapshot;
  };

  const refresh = () => {
    snapshot = null;
    listeners.forEach((l) => l());
  };

  const draftUpdate = (fn: (a: Application) => Application | ActionResult<string>): ActionResult<string> => {
    const p = read();
    const o = owner(p);
    if (!o.active) return { ok: false, code: 'no_application' };
    if (o.active.status !== 'draft') return { ok: false, code: 'already_submitted' };
    const r = fn(o.active);
    if ('ok' in r) return r;
    setOwner(p, { ...o, active: touch(r) });
    write(p);
    return { ok: true };
  };

  return {
    getSnapshot,
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    refresh,
    dismissNotice() {
      notice = null;
      refresh();
    },

    createApplication(loanType: LoanType): ActionResult<'exists' | 'invalid_loan_type'> {
      if (!LOAN_TYPES.includes(loanType)) return { ok: false, code: 'invalid_loan_type' };
      const p = read();
      const o = owner(p);
      if (o.active) return { ok: false, code: 'exists' };
      const app = blankApp(loanType);
      setOwner(p, { ...o, active: app });
      p.intent = null;
      write(p);
      hooks.applicationStarted?.(app, 'application');
      return { ok: true };
    },

    startNewApplication(loanType: LoanType): ActionResult<'invalid_loan_type'> {
      if (!LOAN_TYPES.includes(loanType)) return { ok: false, code: 'invalid_loan_type' };
      const p = read();
      const o = retire(owner(p));
      const app = blankApp(loanType);
      setOwner(p, { ...o, active: app });
      p.intent = null;
      write(p);
      hooks.applicationStarted?.(app, 'application');
      return { ok: true };
    },

    discardActive() {
      const p = read();
      setOwner(p, retire(owner(p)));
      write(p);
    },

    resume(): Application | null {
      return owner(read()).active;
    },

    saveDraft(patch: {
      requestedAmount?: number | null;
      purposeId?: string | null;
      lastStepId?: StepId;
    }) {
      return draftUpdate((a) => ({
        ...a,
        requestedAmount: patch.requestedAmount === undefined ? a.requestedAmount : patch.requestedAmount,
        purposeId: patch.purposeId === undefined ? a.purposeId : patch.purposeId,
        lastStepId: patch.lastStepId ?? a.lastStepId,
      }));
    },

    selectOffer(offerId: string) {
      const r = draftUpdate((a) => {
        const o = findOffer(offerId);
        if (!o || o.loanType !== a.loanType) return { ok: false, code: 'missing_offer' };
        return { ...a, selectedOfferId: offerId };
      });
      if (r.ok) {
        const a = owner(read()).active;
        if (a) hooks.offerSelected?.(a);
      }
      return r;
    },

    submit(input: { consent: boolean }): SubmitResult {
      const p = read();
      const o = owner(p);
      const a = o.active;
      if (!a) return { ok: false, code: 'no_application' };
      if (a.status !== 'draft') return { ok: false, code: 'already_submitted' };
      const code = validateReview(a, input.consent);
      if (code) return { ok: false, code };
      const now = new Date().toISOString();
      const submitted: Application = { ...a, status: 'submitted', submittedAt: a.submittedAt ?? now, updatedAt: now, lastStepId: 'review' };
      setOwner(p, { ...o, active: submitted });
      write(p);
      hooks.submitted?.(submitted);
      return { ok: true };
    },

    advanceStatus(): ActionResult<'no_application' | 'not_submitted' | 'at_final_status'> {
      const p = read();
      const o = owner(p);
      if (!o.active) return { ok: false, code: 'no_application' };
      if (o.active.status === 'draft') return { ok: false, code: 'not_submitted' };
      const n = nextStatus(o.active.status);
      if (!n) return { ok: false, code: 'at_final_status' };
      setOwner(p, { ...o, active: touch({ ...o.active, status: n }) });
      write(p);
      return { ok: true };
    },

    completeTask(taskId: TaskId, done: boolean): ActionResult<'no_application' | 'task_unavailable'> {
      const p = read();
      const o = owner(p);
      if (!o.active) return { ok: false, code: 'no_application' };
      if (!tasksAvailable(o.active.status).includes(taskId)) return { ok: false, code: 'task_unavailable' };
      const wasDone = !!o.active.tasks[taskId];
      const updated = touch({ ...o.active, tasks: { ...o.active.tasks, [taskId]: done } });
      setOwner(p, { ...o, active: updated });
      write(p);
      if (done && !wasDone) hooks.taskCompleted?.(updated, taskId);
      return { ok: true };
    },

    resetApplication(): ActionResult<'no_application'> {
      const p = read();
      const o = owner(p);
      if (!o.active) return { ok: false, code: 'no_application' };
      const retired = retire(o);
      const app = blankApp(o.active.loanType);
      setOwner(p, { ...retired, active: app });
      write(p);
      hooks.applicationStarted?.(app, 'persona_control');
      return { ok: true };
    },

    startAsNewDemoUser() {
      storage.removeItem(STORAGE_KEY);
      write(freshState());
      hooks.newUserReset?.();
    },

    signIn(profileId?: string) {
      const p = read();
      const id = profileId ?? p.lastProfileId ?? 'sim_profile_default';
      p.profileId = id;
      p.lastProfileId = id;
      p.persona = PROFILE_PERSONAS[id] ?? null;
      write(p);
      hooks.signedIn?.();
    },

    signUp() {
      const p = read();
      const anon = owner(p);
      const id = `sim_profile_${newId().slice(0, 8)}`;
      const anonKey = ownerKeyOf(p);
      p.profileId = id;
      p.lastProfileId = id;
      p.owners[`profile:${id}`] = anon;
      delete p.owners[anonKey];
      write(p);
      hooks.signedUp?.();
    },

    signOut() {
      hooks.beforeSignOut?.();
      const p = read();
      p.profileId = null;
      p.anonymousId = newId();
      p.persona = null;
      write(p);
    },

    selectPersona(id: PersonaId) {
      const p = read();
      const set = (profileId: string | null, data: OwnerData, intent: LoanType | null = null) => {
        if (profileId) {
          p.profileId = profileId;
          p.lastProfileId = profileId;
          p.owners[`profile:${profileId}`] = data;
        } else {
          p.profileId = null;
          p.anonymousId = newId();
        }
        p.intent = intent;
        p.persona = id;
      };
      switch (id) {
        case 'first_time_personal':
          set(null, emptyOwner());
          break;
        case 'business_owner':
          set(null, emptyOwner(), 'small_business');
          break;
        case 'returning_mortgage':
          set(
            'persona_returning_mortgage',
            {
              active: personaApp({
                applicationId: 'persona-returning-mortgage-00000001',
                loanType: 'mortgage',
                requestedAmount: LOAN_FIXTURES.mortgage.amountDefault,
                purposeId: 'purchase',
                lastStepId: 'offers',
              }),
              history: [],
            },
          );
          break;
        case 'existing_customer':
          set(
            'persona_existing_customer',
            {
              active: personaApp({
                applicationId: 'persona-existing-customer-00000001',
                loanType: 'personal',
                status: 'under_review',
                submittedAt: PERSONA_TS,
                requestedAmount: LOAN_FIXTURES.personal.amountDefault,
                purposeId: 'debt_consolidation',
                selectedOfferId: 'personal_standard_36',
                lastStepId: 'review',
              }),
              history: [],
            },
          );
          break;
      }
      write(p);
      hooks.personaSelected?.(id);
      if (p.profileId) hooks.signedIn?.();
    },
  };
};

export type Store = ReturnType<typeof createStore>;
