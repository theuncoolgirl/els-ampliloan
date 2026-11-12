import {
  AMOUNT_BANDS,
  LOAN_FIXTURES,
  STATUSES,
  findOffer,
  type AmountBand,
  type ErrorCode,
  type LoanType,
  type PersonaId,
  type StepId,
  type Status,
  type TaskId,
} from './fixtures';

export interface Application {
  applicationId: string;
  loanType: LoanType;
  status: Status;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  requestedAmount: number | null;
  purposeId: string | null;
  selectedOfferId: string | null;
  lastStepId: StepId;
  tasks: Partial<Record<TaskId, boolean>>;
}

export interface OwnerData {
  active: Application | null;
  history: Application[];
}

export interface Persisted {
  schemaVersion: 1;
  anonymousId: string;
  profileId: string | null;
  lastProfileId: string | null;
  intent: LoanType | null;
  persona?: PersonaId | null;
  owners: Record<string, OwnerData>;
}

export const amountBand = (amount: number): AmountBand => {
  if (amount < 25000) return AMOUNT_BANDS[0];
  if (amount < 100000) return AMOUNT_BANDS[1];
  if (amount < 500000) return AMOUNT_BANDS[2];
  return AMOUNT_BANDS[3];
};

export const BAND_LABELS: Record<AmountBand, string> = {
  under_25k: 'Under $25,000',
  '25k_to_under_100k': '$25,000 to under $100,000',
  '100k_to_under_500k': '$100,000 to under $500,000',
  '500k_plus': '$500,000 and above',
};

export const monthlyPayment = (principal: number, aprPercent: number, termMonths: number): number => {
  const r = aprPercent / 100 / 12;
  const payment = r === 0 ? principal / termMonths : (principal * r) / (1 - Math.pow(1 + r, -termMonths));
  return Math.round(payment * 100) / 100;
};

export const validateDetails = (app: Pick<Application, 'loanType' | 'requestedAmount' | 'purposeId'>): ErrorCode | null => {
  const f = LOAN_FIXTURES[app.loanType];
  const a = app.requestedAmount;
  if (a === null || !Number.isFinite(a) || a < f.amountMin || a > f.amountMax) return 'invalid_amount';
  if (!app.purposeId || !f.purposes.some((p) => p.id === app.purposeId)) return 'required_field';
  return null;
};

export const validateOffer = (app: Pick<Application, 'loanType' | 'selectedOfferId'>): ErrorCode | null => {
  const o = findOffer(app.selectedOfferId);
  return o && o.loanType === app.loanType ? null : 'missing_offer';
};

export const validateReview = (app: Application, consent: boolean): ErrorCode | null =>
  validateDetails(app) ?? validateOffer(app) ?? (consent ? null : 'missing_consent');

export const nextStatus = (s: Status): Status | null => STATUSES[STATUSES.indexOf(s) + 1] ?? null;

export const tasksAvailable = (s: Status): TaskId[] =>
  s === 'submitted' || s === 'under_review'
    ? ['verify_details', 'review_documents']
    : s === 'decision_ready'
      ? ['verify_details', 'review_documents', 'confirm_next_steps']
      : [];

export const shortReference = (id: string) => id.slice(-8);

export const formatUsd = (n: number, cents = false) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
