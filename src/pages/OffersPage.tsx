import { useState } from 'react';
import { ErrorSummary, Stepper, errorId, type FieldError } from '../components/Forms';
import { usePageParams } from '../integrations/useStatsig';
import { href, navigate } from '../router';
import { LOAN_FIXTURES, offersFor } from '../state/fixtures';
import { formatUsd, monthlyPayment } from '../state/model';
import { store, useSnapshot } from '../state/useStore';
import { guardNavigatingClick, useNavigationEvent } from '../telemetry/navigation';
import { telemetry } from '../telemetry/runtime';

export function OffersPage() {
  const { active } = useSnapshot();
  const params = usePageParams('offers');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const viewable = !!active && active.status === 'draft';
  useNavigationEvent('offers-view', () => {
    telemetry.stepViewed('offers');
    telemetry.offersViewed();
  }, viewable);

  if (!active) {
    return (
      <section className="page" data-demo="offers-root">
        <h1 tabIndex={-1}>Offers</h1>
        <p>Start your application first.</p>
        <a className="button primary" href={href('/apply')} onClick={() => guardNavigatingClick(() => telemetry.rateCheckStarted('offers'))}>Check your rate</a>
      </section>
    );
  }

  const draft = active.status === 'draft';
  const amount = active.requestedAmount ?? LOAN_FIXTURES[active.loanType].amountDefault;

  const next = () => {
    if (!active.selectedOfferId) {
      setErrors([{ field: 'offer-group', message: 'Choose an offer to continue.' }]);
      telemetry.validationFailed('offers', 'missing_offer');
      return;
    }
    store.saveDraft({ lastStepId: 'review' });
    navigate('/apply', 'review');
  };

  return (
    <section className="page" data-demo="offers-root">
      <Stepper index={2} />
      <h1 tabIndex={-1}>Your sample offers</h1>
      <p className="banner">Illustrative offers from sample data. Not an approval, rate quote, or commitment.</p>
      {params.get('show_comparison_hint').value && (
        <p className="comparison-hint" data-demo="comparison-hint">Compare the monthly payment and APR side by side before you choose.</p>
      )}
      <ErrorSummary errors={errors} />
      <fieldset id="offer-group" className="offers" aria-describedby={errors.length ? errorId('offer-group') : undefined}>
        <legend>Choose an offer for {formatUsd(amount)}</legend>
        {offersFor(active.loanType).map((o) => (
          <label key={o.id} className={`offer-card${active.selectedOfferId === o.id ? ' selected' : ''}`} data-offer-id={o.id}>
            <input
              data-amp-mask
              type="radio"
              name="offer"
              value={o.id}
              checked={active.selectedOfferId === o.id}
              disabled={!draft}
              onChange={() => { store.selectOffer(o.id); setErrors([]); }}
            />
            <span className="offer-body">
              <strong>{o.label}</strong>
              <span>{o.blurb}</span>
              <span>Term: {o.termMonths} months</span>
              <span>Illustrative APR: {o.apr.toFixed(1)}%</span>
              <span className="payment">About {formatUsd(monthlyPayment(amount, o.apr, o.termMonths), true)} per month</span>
            </span>
          </label>
        ))}
        {errors.length > 0 && <p className="field-error" id={errorId('offer-group')}>Choose an offer to continue.</p>}
      </fieldset>
      {draft ? (
        <div className="actions">
          <a className="button" href={href('/apply', 'details')} onClick={() => store.saveDraft({ lastStepId: 'loan_details' })}>Back</a>
          <button type="button" className="primary" onClick={next}>Continue to review</button>
        </div>
      ) : (
        <a className="button" href={href('/dashboard')}>Back to your dashboard</a>
      )}
    </section>
  );
}
