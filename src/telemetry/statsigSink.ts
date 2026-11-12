import type { StatsigService } from '../integrations/statsig';

export interface EventSink {
  readonly name: 'statsig';
  send(eventName: string, properties: Record<string, unknown>): void;
  declined(): number;
}

/** Flat string metadata: booleans become true/false, numbers canonical decimal strings, null/undefined are omitted. */
export const toStatsigMetadata = (properties: Record<string, unknown>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(properties)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'boolean') out[k] = v ? 'true' : 'false';
    else if (typeof v === 'number') {
      if (!Number.isFinite(v)) continue;
      out[k] = Number.isInteger(v) ? v.toFixed(0) : String(v);
    } else out[k] = String(v);
  }
  return out;
};

/** Local sink with no Statsig service: counts what it declined and sends nothing. */
export const createDisabledStatsigSink = (): EventSink => {
  let declined = 0;
  return {
    name: 'statsig',
    send() {
      declined += 1;
    },
    declined: () => declined,
  };
};

export const createStatsigSink = (service: StatsigService): EventSink => ({
  name: 'statsig',
  send(eventName, properties) {
    service.logEvent(eventName, toStatsigMetadata(properties));
  },
  declined: () => service.diagnostics().declined,
});
