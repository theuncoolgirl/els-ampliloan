import { useSyncExternalStore } from 'react';
import { createStore, STORAGE_KEY } from './store';

export const store = createStore(window.localStorage);

window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY || e.key === null) store.refresh();
});

export const useSnapshot = () => useSyncExternalStore(store.subscribe, store.getSnapshot);
