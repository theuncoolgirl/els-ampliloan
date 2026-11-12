import { createAttribution } from '../identity/attribution';
import { buildProfile } from '../identity/profile';
import { createPageParams } from '../integrations/pageParameters';
import { createRealClient, createStatsigService } from '../integrations/statsig';
import { createPreview } from '../presenter/preview';
import { createStatsigSink } from './statsigSink';
import type { PageId } from '../identity/traits';
import { createLiveAdapter, createLocalAdapter } from '../integrations/amplitude';
import { currentLocation } from '../router';
import { bindStoreHooks, store } from '../state/useStore';
import { createTelemetry } from './telemetry';

const PAGE_BY_PATH: Record<string, PageId> = {
  '/': 'home',
  '/apply': 'application',
  '/offers': 'offers',
  '/dashboard': 'dashboard',
  '/presenter': 'presenter',
};

const apiKey = (import.meta.env.VITE_AMPLITUDE_API_KEY as string | undefined) ?? '';
const zone = import.meta.env.VITE_AMPLITUDE_SERVER_ZONE === 'EU' ? 'EU' : 'US';

const attribution = createAttribution({
  storage: window.localStorage,
  now: () => Date.now(),
  search: () => window.location.search,
  uuid: () => crypto.randomUUID(),
});

const statsigKey = (import.meta.env.VITE_STATSIG_CLIENT_KEY as string | undefined) ?? '';
const pageId = (): PageId => PAGE_BY_PATH[currentLocation().path];

export const preview = createPreview();

export const statsig = createStatsigService({
  key: statsigKey,
  makeClient: (user) => createRealClient(statsigKey, user),
  getProfile: () => buildProfile(store.getSnapshot(), attribution.current(), pageId()),
  preview: preview.resolver,
});
export const pageParams = createPageParams(statsig);

const snap = store.getSnapshot();
const live = apiKey ? createLiveAdapter(apiKey, zone, { deviceId: snap.anonymousId, userId: snap.profileId ?? undefined }) : null;

export const telemetry = createTelemetry({
  adapter: live ?? createLocalAdapter(),
  attribution,
  getSnapshot: store.getSnapshot,
  pageId,
  now: () => Date.now(),
  uuid: () => crypto.randomUUID(),
  statsig: createStatsigSink(statsig),
  previewActive: () => preview.getState().active,
});

bindStoreHooks({
  ...telemetry.hooks,
  newUserReset() {
    telemetry.hooks.newUserReset?.();
    preview.clear();
    statsig.resetSnapshots();
  },
});

window.addEventListener('hashchange', () => statsig.boundary());
if (statsigKey) store.subscribe(() => statsig.syncProfile());

export const startTelemetry = async (): Promise<void> => {
  attribution.current();
  await Promise.all([live ? live.start() : Promise.resolve(), statsig.start()]);
};
