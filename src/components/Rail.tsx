import { LOAN_FIXTURES, findOffer } from '../state/fixtures';
import { formatUsd, type Application } from '../state/model';

export function Rail({ app }: { app: Application }) {
  const f = LOAN_FIXTURES[app.loanType];
  const purpose = f.purposes.find((p) => p.id === app.purposeId);
  const offer = findOffer(app.selectedOfferId);
  return (
    <aside className="rail" aria-label="Your request" data-demo="request-summary">
      <h2>Your request</h2>
      <dl>
        <div><dt>Loan type</dt><dd>{f.label}</dd></div>
        <div><dt>Amount</dt><dd>{app.requestedAmount !== null ? formatUsd(app.requestedAmount) : 'Not set yet'}</dd></div>
        <div><dt>Purpose</dt><dd>{purpose?.label ?? 'Not set yet'}</dd></div>
        <div><dt>Offer</dt><dd>{offer ? offer.label : 'Not selected yet'}</dd></div>
      </dl>
    </aside>
  );
}
