import { href, navigate } from '../router';
import {
  LOAN_FIXTURES,
  STATUSES,
  STATUS_LABELS,
  TASK_LABELS,
  findOffer,
  type Status,
} from '../state/fixtures';
import {
  BAND_LABELS,
  amountBand,
  formatUsd,
  monthlyPayment,
  shortReference,
  tasksAvailable,
  type Application,
} from '../state/model';
import { store, useSnapshot } from '../state/useStore';
import { guardNavigatingClick, useNavigationEvent } from '../telemetry/navigation';
import { telemetry } from '../telemetry/runtime';

const NEXT_ACTION: Record<Status, string> = {
  draft: 'Resume your application',
  submitted: 'Your application was received. Review the status below.',
  under_review: 'Your application is under review. Complete the simulated tasks below.',
  decision_ready: 'Sample result: an illustrative offer is ready to review.',
};

export function DashboardPage() {
  const { active, history } = useSnapshot();
  useNavigationEvent('status-view', () => telemetry.statusViewed(), !!active);
  return (
    <section className="page" data-demo="dashboard-root">
      <h1 tabIndex={-1}>Dashboard</h1>
      {active ? (
        <ApplicationCard app={active} />
      ) : (
        <div className="card">
          <p>You have no application yet.</p>
          <a className="button primary" href={href('/apply')} onClick={() => guardNavigatingClick(() => telemetry.rateCheckStarted('dashboard'))}>Check your rate</a>
        </div>
      )}
      {history.length > 0 && (
        <>
          <h2>Earlier applications</h2>
          <ul className="history">
            {history.map((a) => (
              <li key={a.applicationId}>
                {LOAN_FIXTURES[a.loanType].label}, reference {shortReference(a.applicationId)}, {STATUS_LABELS[a.status]}
                {a.requestedAmount !== null && <>, {formatUsd(a.requestedAmount)}</>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const f = LOAN_FIXTURES[app.loanType];
  const offer = findOffer(app.selectedOfferId);
  const tasks = tasksAvailable(app.status);
  const resume = () => {
    telemetry.resumed('dashboard');
    if (app.lastStepId === 'offers') navigate('/offers');
    else navigate('/apply', app.lastStepId === 'review' ? 'review' : 'details');
  };
  return (
    <div className="card">
      <h2>{f.label}</h2>
      <p>
        Status: <span className={`badge badge-${app.status}`} data-demo="dashboard-status">{STATUS_LABELS[app.status]}</span>
      </p>
      <p>{NEXT_ACTION[app.status]}</p>
      {app.status === 'draft' ? (
        <button type="button" className="primary" onClick={resume}>Resume your application</button>
      ) : (
        <ol className="timeline" aria-label="Status timeline">
          {STATUSES.slice(1).map((s) => {
            const reached = STATUSES.indexOf(s) <= STATUSES.indexOf(app.status);
            return (
              <li key={s} className={reached ? 'reached' : ''} aria-current={s === app.status ? 'step' : undefined}>
                {STATUS_LABELS[s]}
              </li>
            );
          })}
        </ol>
      )}
      {tasks.length > 0 && (
        <fieldset className="tasks">
          <legend>Your next steps</legend>
          <p className="muted">Simulated, no files are uploaded.</p>
          {tasks.map((t) => (
            <label key={t} className="choice">
              <input data-amp-mask type="checkbox" checked={!!app.tasks[t]} onChange={(e) => store.completeTask(t, e.target.checked)} />
              <span>{TASK_LABELS[t]}</span>
            </label>
          ))}
        </fieldset>
      )}
      <details onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) telemetry.detailsViewed(); }}>
        <summary>Loan details</summary>
        <dl className="summary">
          <div><dt>Reference</dt><dd>{shortReference(app.applicationId)}</dd></div>
          <div><dt>Loan type</dt><dd>{f.label}</dd></div>
          <div>
            <dt>Amount</dt>
            <dd>
              {app.requestedAmount !== null ? `${formatUsd(app.requestedAmount)} (${BAND_LABELS[amountBand(app.requestedAmount)]})` : 'Not set'}
            </dd>
          </div>
          <div><dt>Selected offer</dt><dd>{offer ? offer.label : 'None yet'}</dd></div>
          {offer && (
            <>
              <div><dt>Term</dt><dd>{offer.termMonths} months</dd></div>
              <div>
                <dt>Illustrative payment</dt>
                <dd>
                  {app.requestedAmount !== null
                    ? `About ${formatUsd(monthlyPayment(app.requestedAmount, offer.apr, offer.termMonths), true)} per month`
                    : 'Not available'}
                </dd>
              </div>
            </>
          )}
        </dl>
      </details>
    </div>
  );
}
