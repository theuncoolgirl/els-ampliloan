import { useSyncExternalStore } from 'react';
import { pageParams, preview } from '../telemetry/runtime';
import type { PageName } from './pageParameters';

/** Re-renders when Preview overrides change; reads stay lazy and cached for the current navigation. */
export const usePageParams = <P extends PageName>(page: P) => {
  useSyncExternalStore(preview.subscribe, preview.getState);
  return pageParams.getPageParams(page);
};

export const usePreviewState = () => useSyncExternalStore(preview.subscribe, preview.getState);
