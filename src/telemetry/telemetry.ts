import { buildProfile, type Profile } from '../identity/profile';
import { PERSONA_FIRST_TOUCH_CHANNEL, type PageId } from '../identity/traits';
import { PERSONA_FIRST_TOUCH, type Attribution } from '../identity/attribution';
import { findOffer, type LoanType, type PersonaId, type StepId, STEP_INDEX, type TaskId, type ErrorCode, type HelpTopic } from '../state/fixtures';
import { amountBand, type Application } from '../state/model';
import type { Snapshot, StoreHooks } from '../state/store';
import type { AmplitudeAdapter, DeliveryState, Ids } from './adapter';
import { createDisabledStatsigSink, type EventSink } from './statsigSink';
import { SCHEMA_VERSION, validateEvent, type EventName } from './events';

export interface LogEntry {
  id: string;
  name: EventName;
  state: DeliveryState;
}

export interface Diagnostics {
  mode: 'live' | 'local';
  initState: string;
  log: LogEntry[];
  dropped: number;
  statsigDeclined: number;
  suppressedByPreview: number;
}

export interface TelemetryDeps {
  adapter: AmplitudeAdapter;
  attribution: Attribution;
  getSnapshot: () => Snapshot;
  pageId: () => PageId;
  now: () => number;
  uuid: () => string;
  statsig?: EventSink;
  previewActive?: () => boolean;
}

type Props = Record<string, unknown>;

const LOG_LIMIT = 20;

export const createTelemetry = (deps: TelemetryDeps) => {
  const { adapter } = deps;
  const statsig = deps.statsig ?? createDisabledStatsigSink();
  const previewOn = () => deps.previewActive?.() ?? false;
  let suppressed = 0;
  let lastIds = '';
  let lastSig = '';
  let dropped = 0;
  let log: LogEntry[] = [];
  let diag: Diagnostics | null = null;
  const listeners = new Set<() => void>();
  const startedIds = new Set<string>();
  const submittedIds = new Set<string>();

  const changed = () => {
    diag = null;
    listeners.forEach((l) => l());
  };

  const syncProfile = (): Profile => {
    const profile = buildProfile(deps.getSnapshot(), deps.attribution.current(), deps.pageId());
    if (previewOn()) return profile;
    const idSig = JSON.stringify(profile.ids);
    const sig = idSig + JSON.stringify(profile.traits);
    if (idSig !== lastIds) {
      adapter.setIdentity(profile.ids);
      lastIds = idSig;
    }
    if (sig !== lastSig) {
      adapter.identify(profile.ids, profile.traits);
      lastSig = sig;
    }
    return profile;
  };

  const touchProps = (p: Profile): Props => ({
    first_touch_source: p.attribution.firstTouch.source,
    first_touch_medium: p.attribution.firstTouch.medium,
    first_touch_campaign: p.attribution.firstTouch.campaign,
    first_touch_channel: p.attribution.firstTouch.channel,
    session_touch_source: p.attribution.sessionTouch.source,
    session_touch_medium: p.attribution.sessionTouch.medium,
    session_touch_campaign: p.attribution.sessionTouch.campaign,
    session_touch_channel: p.attribution.sessionTouch.channel,
  });

  const dispatch = (name: EventName, extra: Props, ids?: Ids): string | null => {
    if (previewOn()) {
      suppressed += 1;
      changed();
      return null;
    }
    const profile = syncProfile();
    const id = deps.uuid();
    const props: Props = {
      business_event_id: id,
      schema_version: SCHEMA_VERSION,
      traffic_type: 'live_demo',
      page_id: deps.pageId(),
      session_id: profile.attribution.sessionId,
      ...touchProps(profile),
      ...extra,
    };
    const result = validateEvent(name, props);
    if (!result.ok) {
      dropped += 1;
      changed();
      return null;
    }
    statsig.send(name, props);
    const entry: LogEntry = { id, name, state: 'queued' };
    log = [entry, ...log].slice(0, LOG_LIMIT);
    adapter.track(
      { name, insertId: id, properties: props, ids: ids ?? profile.ids, time: deps.now() },
      (state) => {
        log = log.map((e) => (e.id === id ? { ...e, state } : e));
        changed();
      },
    );
    changed();
    return id;
  };

  const appProps = (a: Application): Props => ({
    loan_type: a.loanType,
    application_id: a.applicationId,
    application_status: a.status,
  });
  const stepProps = (stepId: StepId): Props => ({ step_id: stepId, step_index: STEP_INDEX[stepId] });
  const moneyProps = (a: Application): Props =>
    a.requestedAmount === null ? {} : { requested_amount: a.requestedAmount, amount_band: amountBand(a.requestedAmount) };
  const identityContext = (): Props => {
    const a = deps.getSnapshot().active;
    return a ? { loan_type: a.loanType, application_id: a.applicationId } : {};
  };

  const withActive = (name: EventName, build: (a: Application) => Props) => {
    const a = deps.getSnapshot().active;
    if (!a) return null;
    return dispatch(name, { ...appProps(a), ...build(a) });
  };

  const api = {
    dispatch,
    syncProfile,
    rateCheckStarted(entry: 'hero' | 'dashboard' | 'offers' | 'application' | 'header') {
      const a = deps.getSnapshot().active;
      return dispatch('Rate Check Started', { loan_type: a ? a.loanType : 'unknown', entry_point: entry });
    },
    loanTypeSelected(loanType: LoanType) {
      return dispatch('Loan Type Selected', { loan_type: loanType, entry_point: 'application' });
    },
    stepViewed(stepId: StepId) {
      return withActive('Application Step Viewed', () => stepProps(stepId));
    },
    validationFailed(stepId: StepId, code: ErrorCode) {
      return withActive('Application Validation Failed', () => ({ ...stepProps(stepId), validation_error_code: code }));
    },
    saved(stepId: StepId) {
      return withActive('Application Saved', () => stepProps(stepId));
    },
    resumed(entry: 'application' | 'dashboard') {
      return withActive('Application Resumed', (a) => ({ ...stepProps(a.lastStepId), entry_point: entry }));
    },
    offersViewed() {
      return withActive('Offers Viewed', (a) => moneyProps(a));
    },
    statusViewed() {
      return withActive('Application Status Viewed', () => ({}));
    },
    detailsViewed() {
      return withActive('Loan Details Viewed', () => ({}));
    },
    helpRequested(entry: 'header' | 'help', topic: HelpTopic = 'general') {
      const a = deps.getSnapshot().active;
      return dispatch('Help Requested', {
        loan_type: a ? a.loanType : 'unknown',
        help_topic: topic,
        entry_point: entry,
        ...(a ? { application_id: a.applicationId, application_status: a.status } : {}),
      });
    },
    diagnostics(): Diagnostics {
      if (!diag) diag = { mode: adapter.mode, initState: adapter.initState(), log, dropped, statsigDeclined: statsig.declined(), suppressedByPreview: suppressed };
      return diag;
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    hooks: {} as StoreHooks,
  };

  api.hooks = {
    applicationStarted(app, entry) {
      if (startedIds.has(app.applicationId)) return;
      startedIds.add(app.applicationId);
      dispatch('Application Started', { ...appProps(app), entry_point: entry, ...stepProps('loan_details') });
    },
    offerSelected(app) {
      const offer = findOffer(app.selectedOfferId);
      dispatch('Offer Selected', {
        ...appProps(app),
        ...(offer ? { offer_id: offer.id, term_months: offer.termMonths } : {}),
        ...moneyProps(app),
      });
    },
    submitted(app) {
      if (submittedIds.has(app.applicationId)) return;
      submittedIds.add(app.applicationId);
      const offer = findOffer(app.selectedOfferId);
      const elapsed = Math.max(0, Math.floor((Date.parse(app.submittedAt ?? '') - Date.parse(app.createdAt)) / 1000));
      dispatch('Application Submitted', {
        ...appProps(app),
        ...(offer ? { offer_id: offer.id, term_months: offer.termMonths } : {}),
        ...moneyProps(app),
        elapsed_seconds: Number.isFinite(elapsed) ? elapsed : -1,
      });
    },
    taskCompleted(app, taskId: TaskId) {
      dispatch('Application Task Completed', { ...appProps(app), task_id: taskId });
    },
    signedIn() {
      dispatch('Signed In', { identity_method: 'demo_signin', ...identityContext() });
    },
    signedUp() {
      dispatch('Sign Up Completed', { identity_method: 'demo_signup', ...identityContext() });
    },
    beforeSignOut() {
      const profile = syncProfile();
      dispatch('Signed Out', { identity_method: 'demo_signout', ...identityContext() }, profile.ids);
    },
    personaSelected(id: PersonaId) {
      deps.attribution.setFirstTouch(PERSONA_FIRST_TOUCH[PERSONA_FIRST_TOUCH_CHANNEL[id]]);
    },
    newUserReset() {
      deps.attribution.reset();
      lastIds = '';
      lastSig = '';
    },
  };

  return api;
};

export type Telemetry = ReturnType<typeof createTelemetry>;
