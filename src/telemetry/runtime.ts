import { createAttribution } from '../identity/attribution';
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

const snap = store.getSnapshot();
const live = apiKey ? createLiveAdapter(apiKey, zone, { deviceId: snap.anonymousId, userId: snap.profileId ?? undefined }) : null;

export const telemetry = createTelemetry({
  adapter: live ?? createLocalAdapter(),
  attribution,
  getSnapshot: store.getSnapshot,
  pageId: () => PAGE_BY_PATH[currentLocation().path],
  now: () => Date.now(),
  uuid: () => crypto.randomUUID(),
});

bindStoreHooks(telemetry.hooks);

export const startTelemetry = async (): Promise<void> => {
  attribution.current();
  if (live) await live.start();
};
