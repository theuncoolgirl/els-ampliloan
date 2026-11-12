export type DeliveryState = 'queued' | 'accepted' | 'failed' | 'local';
export type InitState = 'local' | 'initializing' | 'ready' | 'timed_out' | 'failed';

export interface Ids {
  deviceId: string;
  userId?: string;
}

export interface TraitUpdate {
  set: Record<string, string | number | boolean>;
  setOnce: Record<string, string>;
}

export interface TrackRequest {
  name: string;
  insertId: string;
  properties: Record<string, unknown>;
  ids: Ids;
  time: number;
}

export interface AmplitudeAdapter {
  mode: 'live' | 'local';
  initState(): InitState;
  setIdentity(ids: Ids): void;
  identify(ids: Ids, traits: TraitUpdate): void;
  track(req: TrackRequest, onState: (s: DeliveryState) => void): void;
}
