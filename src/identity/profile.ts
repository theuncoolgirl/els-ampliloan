import type { Snapshot } from '../state/store';
import type { Ids, TraitUpdate } from '../telemetry/adapter';
import type { AttributionState } from './attribution';
import { profileTraits, type PageId } from './traits';

export interface Profile {
  ids: Ids;
  traits: TraitUpdate;
  attribution: AttributionState;
}

export const buildProfile = (snap: Snapshot, attribution: AttributionState, page: PageId): Profile => ({
  ids: { deviceId: snap.anonymousId, userId: snap.profileId ?? undefined },
  traits: {
    set: profileTraits(snap, page),
    setOnce: { acquisition_channel_first_touch: attribution.firstTouch.channel },
  },
  attribution,
});
