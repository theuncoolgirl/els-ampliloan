import * as amplitude from '@amplitude/unified';
import type { AmplitudeAdapter, DeliveryState, Ids, InitState, TraitUpdate, TrackRequest } from '../telemetry/adapter';

export const INIT_WAIT_MS = 2000;

export const createLocalAdapter = (): AmplitudeAdapter => ({
  mode: 'local',
  initState: () => 'local',
  setIdentity() {},
  identify() {},
  track(_req, onState) {
    onState('local');
  },
});

type Op = { kind: 'identify'; ids: Ids; traits: TraitUpdate } | { kind: 'track'; req: TrackRequest; onState: (s: DeliveryState) => void };

let initPromise: Promise<void> | null = null;

/**
 * Vendor calls live only in this module. `initAll` is called at most once per page load (module-level promise),
 * so React strict-mode double effects and re-renders cannot start a second initialization.
 */
export const createLiveAdapter = (apiKey: string, serverZone: 'US' | 'EU', initialIds: Ids) => {
  let state: InitState = 'initializing';
  let current: Ids = initialIds;
  let generation = 0;
  let appliedGeneration = 0;
  const pending: Op[] = [];

  const applyIdentity = () => {
    amplitude.setDeviceId(current.deviceId);
    amplitude.setUserId(current.userId);
    appliedGeneration = generation;
  };

  const run = (op: Op) => {
    if (op.kind === 'identify') {
      const id = new amplitude.Identify();
      for (const [k, v] of Object.entries(op.traits.set)) id.set(k, v);
      for (const [k, v] of Object.entries(op.traits.setOnce)) id.setOnce(k, v);
      void amplitude.identify(id, { device_id: op.ids.deviceId, user_id: op.ids.userId });
      return;
    }
    const { req, onState } = op;
    amplitude
      .track({
        event_type: req.name,
        event_properties: req.properties,
        insert_id: req.insertId,
        device_id: req.ids.deviceId,
        user_id: req.ids.userId,
        time: req.time,
      })
      .promise.then((r) => onState(r.code === 200 ? 'accepted' : 'failed'))
      .catch(() => onState('failed'));
  };

  const ensureStarted = () => {
    if (initPromise) return initPromise;
    initPromise = amplitude
      .initAll(apiKey, {
        serverZone,
        analytics: {
          deviceId: initialIds.deviceId,
          userId: initialIds.userId,
          autocapture: {
            sessions: true,
            pageViews: { trackHistoryChanges: 'pathOnly' },
            attribution: true,
            elementInteractions: true,
            frustrationInteractions: true,
            formInteractions: false,
            fileDownloads: false,
            networkTracking: false,
            webVitals: false,
          },
        },
        sessionReplay: {
          sampleRate: 1,
          privacyConfig: {
            defaultMaskLevel: 'medium',
            maskSelector: ['input', 'select', 'textarea', '[type="checkbox"]', '[type="radio"]'],
          },
        },
        engagement: {},
      })
      .then(() => {
        state = 'ready';
        if (generation !== appliedGeneration) applyIdentity();
        pending.splice(0).forEach(run);
      })
      .catch(() => {
        state = 'failed';
        pending.length = 0;
      });
    return initPromise;
  };

  const adapter: AmplitudeAdapter & { start(): Promise<void> } = {
    mode: 'live',
    initState: () => state,
    setIdentity(ids) {
      current = ids;
      generation += 1;
      if (state === 'ready') applyIdentity();
    },
    identify(ids, traits) {
      const op: Op = { kind: 'identify', ids, traits };
      if (state === 'ready') run(op);
      else if (state !== 'failed') pending.push(op);
    },
    track(req, onState) {
      if (state === 'failed') {
        onState('failed');
        return;
      }
      onState('queued');
      const op: Op = { kind: 'track', req, onState };
      if (state === 'ready') run(op);
      else pending.push(op);
    },
    start() {
      const started = ensureStarted();
      return Promise.race([
        started,
        new Promise<void>((resolve) =>
          window.setTimeout(() => {
            if (state === 'initializing') state = 'timed_out';
            resolve();
          }, INIT_WAIT_MS),
        ),
      ]);
    },
  };
  return adapter;
};
