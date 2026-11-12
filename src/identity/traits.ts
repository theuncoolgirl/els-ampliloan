import type { PersonaId } from '../state/fixtures';
import type { Snapshot } from '../state/store';

export type PageId = 'home' | 'application' | 'offers' | 'dashboard' | 'presenter';

interface PersonaTraits {
  customer_relationship: 'prospect' | 'existing_customer';
  borrowing_experience: 'first_time' | 'experienced' | 'unknown';
  employment_type: 'employed' | 'self_employed' | 'business_owner' | 'unknown';
}

export const PERSONA_TRAITS: Record<PersonaId, PersonaTraits> = {
  first_time_personal: { customer_relationship: 'prospect', borrowing_experience: 'first_time', employment_type: 'employed' },
  returning_mortgage: { customer_relationship: 'prospect', borrowing_experience: 'experienced', employment_type: 'employed' },
  business_owner: { customer_relationship: 'prospect', borrowing_experience: 'experienced', employment_type: 'business_owner' },
  existing_customer: { customer_relationship: 'existing_customer', borrowing_experience: 'experienced', employment_type: 'unknown' },
};

export const PERSONA_FIRST_TOUCH_CHANNEL: Record<PersonaId, string> = {
  first_time_personal: 'paid_search',
  returning_mortgage: 'email',
  business_owner: 'partner',
  existing_customer: 'direct',
};

const DEFAULT_TRAITS: PersonaTraits = { customer_relationship: 'prospect', borrowing_experience: 'unknown', employment_type: 'unknown' };

const journeyStage = (snap: Snapshot, page: PageId): string => {
  const a = snap.active;
  if (page === 'dashboard') return 'dashboard';
  if (a && a.status !== 'draft') return 'submitted';
  if (a) return a.lastStepId === 'review' ? 'reviewing' : a.lastStepId === 'offers' ? 'comparing' : 'applying';
  return 'visitor';
};

export const profileTraits = (snap: Snapshot, page: PageId): Record<string, string | number | boolean> => {
  const base = snap.persona ? PERSONA_TRAITS[snap.persona] : DEFAULT_TRAITS;
  const a = snap.active;
  const submitted = snap.history.length + (a && a.status !== 'draft' ? 1 : 0);
  return {
    ...base,
    preferred_language: 'en',
    journey_stage: journeyStage(snap, page),
    active_loan_type: a ? a.loanType : 'unknown',
    active_application_status: a ? a.status : 'none',
    demo_persona: snap.persona ?? 'unassigned',
    traffic_type: 'live_demo',
    has_saved_application: !!a && a.status === 'draft',
    applications_submitted_count: submitted,
  };
};
