import {
  AMOUNT_BANDS,
  ERROR_CODES,
  HELP_TOPICS,
  LOAN_TYPES,
  STATUSES,
  STEP_IDS,
  STEP_INDEX,
  TASK_IDS,
} from '../state/fixtures';
import { amountBand } from '../state/model';

export const SCHEMA_VERSION = '1.0';
export const TRAFFIC_TYPES = ['live_demo', 'synthetic_population'] as const;
export const PAGE_IDS = ['home', 'application', 'offers', 'dashboard', 'presenter'] as const;
export const ENTRY_POINTS = ['hero', 'header', 'dashboard', 'application', 'offers', 'help', 'persona_control'] as const;
export const IDENTITY_METHODS = ['demo_signup', 'demo_signin', 'demo_signout'] as const;
export const TOUCH_SOURCES = ['google', 'bing', 'newsletter', 'partner_hub', 'unknown'] as const;
export const TOUCH_MEDIUMS = ['cpc', 'email', 'referral', 'unknown'] as const;
export const TOUCH_CAMPAIGNS = ['spring_rates', 'first_loan_guide', 'partner_launch', 'unknown'] as const;
export const TOUCH_CHANNELS = ['paid_search', 'email', 'partner', 'direct', 'unknown'] as const;
export const OFFER_IDS = [
  'personal_standard_36',
  'personal_low_payment_60',
  'personal_fast_24',
  'mortgage_30yr_fixed',
  'mortgage_15yr_fixed',
  'mortgage_7_1_arm',
  'small_business_term_24',
  'small_business_term_48',
  'small_business_term_60',
] as const;

export const EVENT_NAMES = [
  'Rate Check Started',
  'Loan Type Selected',
  'Application Started',
  'Application Step Viewed',
  'Application Validation Failed',
  'Application Saved',
  'Application Resumed',
  'Offers Viewed',
  'Offer Selected',
  'Application Submitted',
  'Application Status Viewed',
  'Loan Details Viewed',
  'Application Task Completed',
  'Help Requested',
  'Sign Up Completed',
  'Signed In',
  'Signed Out',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

type Spec = { type: 'string' | 'integer' | 'number'; values?: readonly string[] };
const str = (values?: readonly string[]): Spec => ({ type: 'string', values });

export const PROPERTY_SPECS: Record<string, Spec> = {
  business_event_id: str(),
  schema_version: str([SCHEMA_VERSION]),
  traffic_type: str(TRAFFIC_TYPES),
  page_id: str(PAGE_IDS),
  session_id: str(),
  loan_type: str([...LOAN_TYPES, 'unknown']),
  application_id: str(),
  application_status: str(STATUSES),
  entry_point: str(ENTRY_POINTS),
  step_id: str(STEP_IDS),
  step_index: { type: 'integer' },
  requested_amount: { type: 'number' },
  amount_band: str(AMOUNT_BANDS),
  offer_id: str(OFFER_IDS),
  term_months: { type: 'integer' },
  validation_error_code: str(ERROR_CODES),
  elapsed_seconds: { type: 'integer' },
  task_id: str(TASK_IDS),
  help_topic: str(HELP_TOPICS),
  identity_method: str(IDENTITY_METHODS),
  first_touch_source: str(TOUCH_SOURCES),
  first_touch_medium: str(TOUCH_MEDIUMS),
  first_touch_campaign: str(TOUCH_CAMPAIGNS),
  first_touch_channel: str(TOUCH_CHANNELS),
  session_touch_source: str(TOUCH_SOURCES),
  session_touch_medium: str(TOUCH_MEDIUMS),
  session_touch_campaign: str(TOUCH_CAMPAIGNS),
  session_touch_channel: str(TOUCH_CHANNELS),
};

const BASE = ['business_event_id', 'schema_version', 'traffic_type', 'page_id', 'session_id'];
const TOUCH = [
  'first_touch_source',
  'first_touch_medium',
  'first_touch_campaign',
  'first_touch_channel',
  'session_touch_source',
  'session_touch_medium',
  'session_touch_campaign',
  'session_touch_channel',
];
const APP = ['loan_type', 'application_id', 'application_status'];
const STEP = ['step_id', 'step_index'];
const MONEY = ['requested_amount', 'amount_band'];
const OFFER = ['offer_id', 'term_months'];

export const EVENT_CONTRACT: Record<EventName, { required: string[]; optional: string[] }> = {
  'Rate Check Started': { required: [...BASE, ...TOUCH, 'loan_type', 'entry_point'], optional: [] },
  'Loan Type Selected': { required: [...BASE, ...TOUCH, 'loan_type', 'entry_point'], optional: [] },
  'Application Started': { required: [...BASE, ...TOUCH, ...APP, 'entry_point', ...STEP], optional: [] },
  'Application Step Viewed': { required: [...BASE, ...TOUCH, ...APP, ...STEP], optional: [] },
  'Application Validation Failed': { required: [...BASE, ...TOUCH, ...APP, ...STEP, 'validation_error_code'], optional: [] },
  'Application Saved': { required: [...BASE, ...TOUCH, ...APP, ...STEP], optional: [] },
  'Application Resumed': { required: [...BASE, ...TOUCH, ...APP, ...STEP, 'entry_point'], optional: [] },
  'Offers Viewed': { required: [...BASE, ...TOUCH, ...APP, ...MONEY], optional: [] },
  'Offer Selected': { required: [...BASE, ...TOUCH, ...APP, ...OFFER, ...MONEY], optional: [] },
  'Application Submitted': { required: [...BASE, ...TOUCH, ...APP, ...OFFER, ...MONEY, 'elapsed_seconds'], optional: [] },
  'Application Status Viewed': { required: [...BASE, ...TOUCH, ...APP], optional: [] },
  'Loan Details Viewed': { required: [...BASE, ...TOUCH, ...APP], optional: [] },
  'Application Task Completed': { required: [...BASE, ...TOUCH, ...APP, 'task_id'], optional: [] },
  'Help Requested': { required: [...BASE, ...TOUCH, 'loan_type', 'help_topic', 'entry_point'], optional: ['application_id', 'application_status'] },
  'Sign Up Completed': { required: [...BASE, ...TOUCH, 'identity_method'], optional: ['loan_type', 'application_id'] },
  'Signed In': { required: [...BASE, ...TOUCH, 'identity_method'], optional: ['loan_type', 'application_id'] },
  'Signed Out': { required: [...BASE, ...TOUCH, 'identity_method'], optional: ['loan_type', 'application_id'] },
};

const UNKNOWN_LOAN_TYPE_OK: ReadonlySet<string> = new Set(['Rate Check Started', 'Help Requested', 'Sign Up Completed', 'Signed In', 'Signed Out']);

export type ValidationResult = { ok: true } | { ok: false; reason: string };

const checkValue = (key: string, v: unknown): string | null => {
  const spec = PROPERTY_SPECS[key];
  if (!spec) return `unknown property ${key}`;
  if (v === null || v === undefined) return `${key} missing`;
  if (spec.type === 'string') {
    if (typeof v !== 'string' || v === '') return `${key} must be a non-empty string`;
    if (spec.values && !spec.values.includes(v)) return `${key} not in enum`;
  } else if (spec.type === 'integer') {
    if (typeof v !== 'number' || !Number.isInteger(v)) return `${key} must be an integer`;
    if (key === 'elapsed_seconds' ? v < 0 : v < 1) return `${key} out of range`;
  } else if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) {
    return `${key} must be a finite positive number`;
  }
  return null;
};

export function validateEvent(name: string, props: Record<string, unknown>): ValidationResult {
  const contract = (EVENT_CONTRACT as Record<string, { required: string[]; optional: string[] }>)[name];
  if (!contract) return { ok: false, reason: `event name not in contract: ${name}` };
  const allowed = new Set([...contract.required, ...contract.optional]);
  for (const k of Object.keys(props)) if (!allowed.has(k)) return { ok: false, reason: `property not allowed: ${k}` };
  for (const k of contract.required) {
    if (!(k in props)) return { ok: false, reason: `${k} missing` };
  }
  for (const k of allowed) {
    if (k in props) {
      const e = checkValue(k, props[k]);
      if (e) return { ok: false, reason: e };
    }
  }
  if (props.loan_type === 'unknown' && !UNKNOWN_LOAN_TYPE_OK.has(name)) return { ok: false, reason: 'loan_type unknown not allowed' };
  if ('application_id' in props && name === 'Help Requested') {
    if (!('application_status' in props) || props.loan_type === 'unknown') return { ok: false, reason: 'help with application needs status and loan_type' };
  }
  if (name === 'Help Requested' && 'application_status' in props && !('application_id' in props)) {
    return { ok: false, reason: 'application_status without application_id' };
  }
  if ('step_id' in props && STEP_INDEX[props.step_id as keyof typeof STEP_INDEX] !== props.step_index) {
    return { ok: false, reason: 'step_index does not match step_id' };
  }
  if ('requested_amount' in props && amountBand(props.requested_amount as number) !== props.amount_band) {
    return { ok: false, reason: 'amount_band does not match requested_amount' };
  }
  if (name === 'Application Submitted' && props.application_status !== 'submitted') {
    return { ok: false, reason: 'Application Submitted requires status submitted' };
  }
  if (name === 'Application Started' && props.application_status !== 'draft') {
    return { ok: false, reason: 'Application Started requires status draft' };
  }
  return { ok: true };
}
