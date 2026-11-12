export const LOAN_TYPES = ['personal', 'mortgage', 'small_business'] as const;
export type LoanType = (typeof LOAN_TYPES)[number];

export const STATUSES = ['draft', 'submitted', 'under_review', 'decision_ready'] as const;
export type Status = (typeof STATUSES)[number];

export const STEP_IDS = ['loan_details', 'offers', 'review'] as const;
export type StepId = (typeof STEP_IDS)[number];
export const STEP_INDEX: Record<StepId, number> = { loan_details: 1, offers: 2, review: 3 };

export const ERROR_CODES = ['required_field', 'invalid_amount', 'missing_offer', 'missing_consent'] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export const TASK_IDS = ['verify_details', 'review_documents', 'confirm_next_steps'] as const;
export type TaskId = (typeof TASK_IDS)[number];

export const HELP_TOPICS = ['application', 'offers', 'status', 'general'] as const;
export type HelpTopic = (typeof HELP_TOPICS)[number];

export const PERSONA_IDS = ['first_time_personal', 'returning_mortgage', 'business_owner', 'existing_customer'] as const;
export type PersonaId = (typeof PERSONA_IDS)[number];

export const AMOUNT_BANDS = ['under_25k', '25k_to_under_100k', '100k_to_under_500k', '500k_plus'] as const;
export type AmountBand = (typeof AMOUNT_BANDS)[number];

export interface Purpose {
  id: string;
  label: string;
}

export interface LoanTypeFixture {
  id: LoanType;
  label: string;
  headline: string;
  helper: string;
  amountMin: number;
  amountMax: number;
  amountDefault: number;
  purposes: Purpose[];
}

export const LOAN_FIXTURES: Record<LoanType, LoanTypeFixture> = {
  personal: {
    id: 'personal',
    label: 'Personal loan',
    headline: 'Tell us about your personal loan',
    helper: 'Consolidate debt, fund a project, or cover a big purchase.',
    amountMin: 1000,
    amountMax: 50000,
    amountDefault: 15000,
    purposes: [
      { id: 'debt_consolidation', label: 'Debt consolidation' },
      { id: 'home_improvement', label: 'Home improvement' },
      { id: 'major_purchase', label: 'Major purchase' },
    ],
  },
  mortgage: {
    id: 'mortgage',
    label: 'Mortgage',
    headline: 'Tell us about your home financing',
    helper: 'Buying a home or refinancing the one you have.',
    amountMin: 100000,
    amountMax: 1000000,
    amountDefault: 350000,
    purposes: [
      { id: 'purchase', label: 'Purchase' },
      { id: 'refinance', label: 'Refinance' },
    ],
  },
  small_business: {
    id: 'small_business',
    label: 'Small business loan',
    headline: 'Tell us about your business financing',
    helper: 'Equipment, cash flow, or room to grow.',
    amountMin: 5000,
    amountMax: 500000,
    amountDefault: 75000,
    purposes: [
      { id: 'equipment', label: 'Equipment' },
      { id: 'working_capital', label: 'Working capital' },
      { id: 'expansion', label: 'Expansion' },
    ],
  },
};

export interface OfferFixture {
  id: string;
  loanType: LoanType;
  label: string;
  termMonths: number;
  apr: number;
  blurb: string;
}

export const OFFERS: OfferFixture[] = [
  { id: 'personal_standard_36', loanType: 'personal', label: 'Standard, 36 months', termMonths: 36, apr: 11.9, blurb: 'Balanced payment and total cost.' },
  { id: 'personal_low_payment_60', loanType: 'personal', label: 'Low payment, 60 months', termMonths: 60, apr: 13.4, blurb: 'Smallest monthly payment.' },
  { id: 'personal_fast_24', loanType: 'personal', label: 'Fast payoff, 24 months', termMonths: 24, apr: 10.5, blurb: 'Pay it off sooner.' },
  { id: 'mortgage_30yr_fixed', loanType: 'mortgage', label: '30-year fixed', termMonths: 360, apr: 6.6, blurb: 'Steady payment for 30 years.' },
  { id: 'mortgage_15yr_fixed', loanType: 'mortgage', label: '15-year fixed', termMonths: 180, apr: 5.9, blurb: 'Higher payment, less interest overall.' },
  { id: 'mortgage_7_1_arm', loanType: 'mortgage', label: '7/1 adjustable', termMonths: 360, apr: 5.7, blurb: 'Fixed for 7 years, then adjusts yearly.' },
  { id: 'small_business_term_24', loanType: 'small_business', label: 'Term loan, 24 months', termMonths: 24, apr: 9.8, blurb: 'Shorter term, lower total cost.' },
  { id: 'small_business_term_48', loanType: 'small_business', label: 'Term loan, 48 months', termMonths: 48, apr: 10.9, blurb: 'Balanced payment for growth.' },
  { id: 'small_business_term_60', loanType: 'small_business', label: 'Term loan, 60 months', termMonths: 60, apr: 11.6, blurb: 'Lowest monthly payment.' },
];

export const offersFor = (t: LoanType) => OFFERS.filter((o) => o.loanType === t);
export const findOffer = (id: string | null) => OFFERS.find((o) => o.id === id) ?? null;

export const TASK_LABELS: Record<TaskId, string> = {
  verify_details: 'Verify your details',
  review_documents: 'Review your documents',
  confirm_next_steps: 'Confirm your next steps',
};

export const STATUS_LABELS: Record<Status, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  decision_ready: 'Sample result ready',
};
