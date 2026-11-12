import { useEffect } from 'react';

let navId = 0;
let navigating = false;
const emitted = new Set<string>();

window.addEventListener('hashchange', () => {
  navId += 1;
  navigating = false;
  emitted.clear();
});

/** Runs `fn` at most once per actual navigation, even when React re-mounts a page in development. */
export const emitOncePerNavigation = (key: string, fn: () => void) => {
  if (emitted.has(key)) return;
  emitted.add(key);
  fn();
};

export const useNavigationEvent = (key: string, fn: () => void, enabled = true) => {
  useEffect(() => {
    if (enabled) emitOncePerNavigation(key, fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
};

/** Blocks repeat activations until the next navigation completes. */
export const guardNavigatingClick = (fn: () => void) => {
  if (navigating) return;
  navigating = true;
  fn();
};

export const currentNavigationId = () => navId;
