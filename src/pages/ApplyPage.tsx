import { useEffect, useRef, useState } from 'react';
import { ErrorSummary, Stepper, errorId, type FieldError } from '../components/Forms';
import { href, navigate } from '../router';
import {
  LOAN_FIXTURES,
  LOAN_TYPES,
  STATUS_LABELS,
  findOffer,
  type LoanType,
} from '../state/fixtures';
import {
  BAND_LABELS,
  amountBand,
  formatUsd,
  monthlyPayment,
  shortReference,
  validateDetails,
  type Application,
} from '../state/model';
import { store, useSnapshot } from '../state/useStore';
import { useNavigationEvent } from '../telemetry/navigation';
import { telemetry } from '../telemetry/runtime';

const amountMessage = (t: LoanType) => {
  const f = LOAN_FIXTURES[t];
  return `Enter an amount between ${formatUsd(f.amountMin)} and ${formatUsd(f.amountMax)}.`;
};

export function ApplyPage({ step }: { step: string | null }) {
  const { active, intent } = useSnapshot();
  const [replacing, setReplacing] = useState(false);
  const view = !active || replacing ? 'chooser' : active.status !== 'draft' ? 'confirmation' : (step ?? 'gate');
  const prev = useRef(view);
  useEffect(() => {
    if (prev.current !== view) document.querySelector<HTMLElement>('main h1')?.focus();
    prev.current = view;
  }, [view]);

  if (!active || replacing) {
    return <Chooser hasActive={!!active} intent={intent} onDone={() => setReplacing(false)} onCancel={active ? () => setReplacing(false) : undefined} />;
  }
  if (active.status !== 'draft') return <Confirmation app={active} onNew={() => setReplacing(true)} />;
  if (step === 'details') return <DetailsStep app={active} />;
  if (step === 'review') return <ReviewStep app={active} />;
  return <ResumeGate app={active} onNew={() => setReplacing(true)} />;
}

function Chooser({
  hasActive,
  intent,
  onDone,
  onCancel,
}: {
  hasActive: boolean;
  intent: LoanType | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [choice, setChoice] = useState<LoanType | null>(intent);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const go = () => {
    if (!choice) {
      setErrors([{ field: 'loan-type', message: 'Choose a loan type.' }]);
      return;
    }
    telemetry.loanTypeSelected(choice);
    if (hasActive) store.startNewApplication(choice);
    else store.createApplication(choice);
    onDone();
    navigate('/apply', 'details');
  };
  return (
    <section className="page" data-demo="application-root">
      <h1 tabIndex={-1}>Check your rate</h1>
      <p className="muted">Pick the kind of loan you are exploring. The steps are the same for every type.</p>
      <ErrorSummary errors={errors} />
      <form onSubmit={(e) => { e.preventDefault(); go(); }}>
        <fieldset id="loan-type" aria-describedby={errors.length ? errorId('loan-type') : undefined}>
          <legend>Loan type</legend>
          {LOAN_TYPES.map((t) => (
            <label key={t} className="choice">
              <input type="radio" name="loan-type" value={t} checked={choice === t} onChange={() => setChoice(t)} />
              <span>
                <strong>{LOAN_FIXTURES[t].label}</strong>
                <br />
                <span className="muted">{LOAN_FIXTURES[t].helper}</span>
              </span>
            </label>
          ))}
          {errors.length > 0 && <p className="field-error" id={errorId('loan-type')}>Choose a loan type.</p>}
        </fieldset>
        <div className="actions">
          <button type="submit" className="primary">Continue</button>
          {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        </div>
      </form>
    </section>
  );
}

function ResumeGate({ app, onNew }: { app: Application; onNew: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const resume = () => {
    telemetry.resumed('application');
    if (app.lastStepId === 'offers') navigate('/offers');
    else navigate('/apply', app.lastStepId === 'review' ? 'review' : 'details');
  };
  return (
    <section className="page" data-demo="application-root">
      <h1 tabIndex={-1}>Resume your application</h1>
      <p>
        You have a saved {LOAN_FIXTURES[app.loanType].label.toLowerCase()} draft (reference {shortReference(app.applicationId)}).
      </p>
      <div className="actions">
        <button type="button" className="primary" onClick={resume}>Resume your application</button>
        {!confirming && <button type="button" onClick={() => setConfirming(true)}>Start a new application</button>}
      </div>
      {confirming && (
        <div className="confirm" role="group" aria-label="Confirm new application">
          <p>Starting a new application replaces this draft. The loan type of a draft cannot be changed.</p>
          <button type="button" onClick={onNew}>Yes, start a new application</button>
          <button type="button" onClick={() => setConfirming(false)}>Keep my draft</button>
        </div>
      )}
    </section>
  );
}

function DetailsStep({ app }: { app: Application }) {
  const f = LOAN_FIXTURES[app.loanType];
  const [amount, setAmount] = useState(String(app.requestedAmount ?? f.amountDefault));
  const [purpose, setPurpose] = useState(app.purposeId ?? '');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [saved, setSaved] = useState(false);
  const num = amount.trim() === '' ? null : Number(amount);
  const parsed = num !== null && Number.isFinite(num) ? num : null;
  const err = (id: string) => errors.find((e) => e.field === id);
  useNavigationEvent('step:loan_details', () => telemetry.stepViewed('loan_details'));

  const save = (lastStepId: 'loan_details' | 'offers') =>
    store.saveDraft({ requestedAmount: parsed, purposeId: purpose || null, lastStepId });

  const next = () => {
    const code = validateDetails({ loanType: app.loanType, requestedAmount: parsed, purposeId: purpose || null });
    if (code) {
      telemetry.validationFailed('loan_details', code);
      setErrors([
        code === 'invalid_amount'
          ? { field: 'requested-amount', message: amountMessage(app.loanType) }
          : { field: 'purpose', message: 'Choose a purpose.' },
      ]);
      return;
    }
    save('offers');
    navigate('/offers');
  };

  return (
    <section className="page" data-demo="application-root">
      <Stepper index={1} />
      <div data-demo="application-step" data-step-id="loan_details">
        <h1 tabIndex={-1}>{f.headline}</h1>
        <p className="muted">{f.helper}</p>
        <ErrorSummary errors={errors} />
        <form onSubmit={(e) => { e.preventDefault(); next(); }} noValidate>
          <div className="field">
            <label htmlFor="requested-amount">Amount you would like (USD)</label>
            <input
              id="requested-amount"
              type="number"
              inputMode="decimal"
              step="any"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setSaved(false); }}
              aria-invalid={err('requested-amount') ? true : undefined}
              aria-describedby={`amount-hint${err('requested-amount') ? ` ${errorId('requested-amount')}` : ''}`}
            />
            <p id="amount-hint" className="hint">
              Sample range {formatUsd(f.amountMin)} to {formatUsd(f.amountMax)}.
              {parsed !== null && parsed > 0 && <> Amount band: {BAND_LABELS[amountBand(parsed)]}.</>}
            </p>
            {err('requested-amount') && <p className="field-error" id={errorId('requested-amount')}>{err('requested-amount')!.message}</p>}
          </div>
          <div className="field">
            <label htmlFor="purpose">Purpose</label>
            <select
              id="purpose"
              value={purpose}
              onChange={(e) => { setPurpose(e.target.value); setSaved(false); }}
              aria-invalid={err('purpose') ? true : undefined}
              aria-describedby={err('purpose') ? errorId('purpose') : undefined}
            >
              <option value="">Select a purpose</option>
              {f.purposes.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {err('purpose') && <p className="field-error" id={errorId('purpose')}>{err('purpose')!.message}</p>}
          </div>
          <div className="actions">
            <button type="button" onClick={() => { if (save('loan_details').ok) { setSaved(true); telemetry.saved('loan_details'); } }}>Save draft</button>
            <button type="submit" className="primary">Next</button>
          </div>
          <p role="status" className="muted">{saved ? 'Draft saved on this browser.' : ''}</p>
        </form>
      </div>
    </section>
  );
}

function ReviewStep({ app }: { app: Application }) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [saved, setSaved] = useState(false);
  const f = LOAN_FIXTURES[app.loanType];
  const offer = findOffer(app.selectedOfferId);
  const purpose = f.purposes.find((p) => p.id === app.purposeId);
  useNavigationEvent('step:review', () => telemetry.stepViewed('review'));

  const submit = () => {
    if (busy) return;
    const pre = validateDetails(app);
    if (pre) {
      telemetry.validationFailed('review', pre);
      setErrors([{ field: 'review-summary', message: pre === 'invalid_amount' ? amountMessage(app.loanType) : 'Choose a purpose.' }]);
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const r = store.submit({ consent });
      setBusy(false);
      if (!r.ok) {
        if (r.code === 'missing_consent' || r.code === 'missing_offer' || r.code === 'invalid_amount' || r.code === 'required_field') telemetry.validationFailed('review', r.code);
        if (r.code === 'missing_consent') setErrors([{ field: 'consent', message: 'Confirm to submit.' }]);
        else if (r.code === 'missing_offer') setErrors([{ field: 'review-summary', message: 'Choose an offer to continue.' }]);
      }
    }, 350);
  };

  return (
    <section className="page" data-demo="application-root">
      <Stepper index={3} />
      <div data-demo="application-step" data-step-id="review">
        <h1 tabIndex={-1}>Review and submit</h1>
        <ErrorSummary errors={errors} />
        <dl className="summary" id="review-summary" tabIndex={-1}>
          <div><dt>Loan type</dt><dd>{f.label}</dd></div>
          <div>
            <dt>Amount</dt>
            <dd>
              {app.requestedAmount !== null ? formatUsd(app.requestedAmount) : 'Not set'}{' '}
              <a href={href('/apply', 'details')}>Edit amount and purpose</a>
            </dd>
          </div>
          <div><dt>Purpose</dt><dd>{purpose?.label ?? 'Not set'}</dd></div>
          <div>
            <dt>Offer</dt>
            <dd>{offer ? offer.label : 'Not selected'} <a href={href('/offers')}>Edit offer</a></dd>
          </div>
        </dl>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <div className="field">
            <label className="choice">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-describedby={errors.some((e) => e.field === 'consent') ? errorId('consent') : undefined}
              />
              <span>I understand this is a demo with synthetic data.</span>
            </label>
            {errors.some((e) => e.field === 'consent') && <p className="field-error" id={errorId('consent')}>Confirm to submit.</p>}
          </div>
          <div className="actions">
            <a className="button" href={href('/offers')}>Back</a>
            <button type="button" onClick={() => { if (store.saveDraft({ lastStepId: 'review' }).ok) { setSaved(true); telemetry.saved('review'); } }}>Save draft</button>
            <button type="submit" className="primary" data-demo="submit-application" disabled={busy} aria-busy={busy}>
              {busy ? 'Submitting' : 'Submit'}
            </button>
          </div>
          <p role="status" className="muted">{saved ? 'Draft saved on this browser.' : ''}</p>
        </form>
      </div>
    </section>
  );
}

function Confirmation({ app, onNew }: { app: Application; onNew: () => void }) {
  const offer = findOffer(app.selectedOfferId);
  return (
    <section className="page" data-demo="application-root">
      <h1 tabIndex={-1}>Application submitted</h1>
      <p>
        Reference <strong>{shortReference(app.applicationId)}</strong>. Status: {STATUS_LABELS[app.status]}.
      </p>
      {offer && app.requestedAmount !== null && (
        <p className="muted">
          Sample offer: {offer.label}, about {formatUsd(monthlyPayment(app.requestedAmount, offer.apr, offer.termMonths), true)} per month (illustrative).
        </p>
      )}
      <div className="actions">
        <a className="button primary" href={href('/dashboard')}>Go to your dashboard</a>
        <button type="button" onClick={onNew}>Start a new application</button>
      </div>
    </section>
  );
}
