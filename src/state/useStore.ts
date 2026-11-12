import { useSyncExternalStore } from 'react';
import { createStore, STORAGE_KEY, type StoreHooks } from './store';

const target: { current: StoreHooks } = { current: {} };

const hooks: Required<StoreHooks> = {
  applicationStarted: (...a) => target.current.applicationStarted?.(...a),
  offerSelected: (...a) => target.current.offerSelected?.(...a),
  submitted: (...a) => target.current.submitted?.(...a),
  taskCompleted: (...a) => target.current.taskCompleted?.(...a),
  signedIn: () => target.current.signedIn?.(),
  signedUp: () => target.current.signedUp?.(),
  beforeSignOut: () => target.current.beforeSignOut?.(),
  personaSelected: (...a) => target.current.personaSelected?.(...a),
  newUserReset: () => target.current.newUserReset?.(),
};

export const bindStoreHooks = (h: StoreHooks) => {
  target.current = h;
};

export const store = createStore(window.localStorage, hooks);

window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY || e.key === null) store.refresh();
});

export const useSnapshot = () => useSyncExternalStore(store.subscribe, store.getSnapshot);
