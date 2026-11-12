import type { StorageLike } from '../state/store';

export const ATTRIBUTION_KEY = 'ampliloan.attribution.v1';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const SOURCES = ['google', 'bing', 'newsletter', 'partner_hub'];
const MEDIUMS = ['cpc', 'email', 'referral'];
const CAMPAIGNS = ['spring_rates', 'first_loan_guide', 'partner_launch'];
const CHANNEL_BY_MEDIUM: Record<string, string> = { cpc: 'paid_search', email: 'email', referral: 'partner' };

export interface Touch {
  source: string;
  medium: string;
  campaign: string;
  channel: string;
}

export const DIRECT_TOUCH: Touch = { source: 'unknown', medium: 'unknown', campaign: 'unknown', channel: 'direct' };

export const PERSONA_FIRST_TOUCH: Record<string, Touch> = {
  paid_search: { source: 'google', medium: 'cpc', campaign: 'spring_rates', channel: 'paid_search' },
  email: { source: 'newsletter', medium: 'email', campaign: 'first_loan_guide', channel: 'email' },
  partner: { source: 'partner_hub', medium: 'referral', campaign: 'partner_launch', channel: 'partner' },
  direct: DIRECT_TOUCH,
};

export const touchFromSearch = (search: string): Touch => {
  const q = new URLSearchParams(search);
  const rawSource = q.get('utm_source');
  const rawMedium = q.get('utm_medium');
  const rawCampaign = q.get('utm_campaign');
  if (rawSource === null && rawMedium === null && rawCampaign === null) return DIRECT_TOUCH;
  const source = rawSource !== null && SOURCES.includes(rawSource) ? rawSource : 'unknown';
  const medium = rawMedium !== null && MEDIUMS.includes(rawMedium) ? rawMedium : 'unknown';
  const campaign = rawCampaign !== null && CAMPAIGNS.includes(rawCampaign) ? rawCampaign : 'unknown';
  const channel = source !== 'unknown' && medium !== 'unknown' ? CHANNEL_BY_MEDIUM[medium] : 'unknown';
  return { source, medium, campaign, channel };
};

const isTouch = (t: unknown): t is Touch =>
  !!t && typeof t === 'object' && ['source', 'medium', 'campaign', 'channel'].every((k) => typeof (t as Record<string, unknown>)[k] === 'string');

interface Stored {
  firstTouch: Touch;
  sessionTouch: Touch;
  sessionId: string;
  lastActivityAt: number;
}

export interface AttributionState {
  firstTouch: Touch;
  sessionTouch: Touch;
  sessionId: string;
}

export const createAttribution = (opts: {
  storage: StorageLike;
  now: () => number;
  search: () => string;
  uuid: () => string;
}) => {
  const read = (): Stored | null => {
    try {
      const raw = opts.storage.getItem(ATTRIBUTION_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (isTouch(p.firstTouch) && isTouch(p.sessionTouch) && typeof p.sessionId === 'string' && typeof p.lastActivityAt === 'number') {
        return p as unknown as Stored;
      }
    } catch {
      /* treated as absent */
    }
    return null;
  };
  const write = (s: Stored) => opts.storage.setItem(ATTRIBUTION_KEY, JSON.stringify(s));

  return {
    /** Returns current attribution, starting a new app session after 30 minutes of inactivity. */
    current(): AttributionState {
      const now = opts.now();
      const stored = read();
      const landing = touchFromSearch(opts.search());
      const expired = !stored || now - stored.lastActivityAt >= SESSION_TIMEOUT_MS;
      const retagged = !!stored && !expired && landing.channel !== 'direct' && JSON.stringify(landing) !== JSON.stringify(stored.sessionTouch);
      if (!stored || expired || retagged) {
        const next: Stored = {
          firstTouch: stored?.firstTouch ?? landing,
          sessionTouch: landing,
          sessionId: opts.uuid(),
          lastActivityAt: now,
        };
        write(next);
        return { firstTouch: next.firstTouch, sessionTouch: next.sessionTouch, sessionId: next.sessionId };
      }
      write({ ...stored, lastActivityAt: now });
      return { firstTouch: stored.firstTouch, sessionTouch: stored.sessionTouch, sessionId: stored.sessionId };
    },
    setFirstTouch(t: Touch) {
      const cur = this.current();
      write({ firstTouch: t, sessionTouch: cur.sessionTouch, sessionId: cur.sessionId, lastActivityAt: opts.now() });
    },
    reset() {
      write({ firstTouch: DIRECT_TOUCH, sessionTouch: DIRECT_TOUCH, sessionId: opts.uuid(), lastActivityAt: opts.now() });
    },
  };
};

export type Attribution = ReturnType<typeof createAttribution>;
