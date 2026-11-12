import { useState } from 'react';
import { PERSONA_IDS, STATUS_LABELS, type PersonaId } from '../state/fixtures';
import { shortReference } from '../state/model';
import { store, useSnapshot } from '../state/useStore';
import { Diagnostics } from '../presenter/Diagnostics';

const PERSONA_LABELS: Record<PersonaId, string> = {
  first_time_personal: 'First-time personal borrower (no application)',
  returning_mortgage: 'Returning mortgage borrower (saved draft at offers)',
  business_owner: 'Business owner (no application, small business intent)',
  existing_customer: 'Existing customer (personal loan under review)',
};

export function PresenterPage() {
  const snap = useSnapshot();
  const [persona, setPersona] = useState<PersonaId>('first_time_personal');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const a = snap.active;

  return (
    <section className="page" data-demo="presenter-root">
      <h1 tabIndex={-1}>Demo controls</h1>
      <p className="banner">Demo controls. Not part of the borrower experience.</p>

      <fieldset>
        <legend>Persona</legend>
        {PERSONA_IDS.map((id) => (
          <label key={id} className="choice">
            <input data-amp-mask type="radio" name="persona" value={id} checked={persona === id} onChange={() => setPersona(id)} />
            <span>{PERSONA_LABELS[id]}</span>
          </label>
        ))}
        <button type="button" onClick={() => { store.selectPersona(persona); setMessage(`Persona applied: ${persona}.`); }}>
          Apply persona
        </button>
      </fieldset>

      <h2>Application</h2>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            const r = store.advanceStatus();
            setMessage(r.ok ? 'Status advanced one step.' : 'Status cannot advance (needs a submitted application, or already at the last status).');
          }}
        >
          Advance status one step
        </button>
        <button type="button" onClick={() => setMessage(store.resetApplication().ok ? 'Application reset with a new application ID.' : 'No application to reset.')}>
          Reset current application
        </button>
      </div>
      <p className="muted">Simulated status change. No underwriting backend.</p>

      <h2>Demo user</h2>
      <div className="actions">
        <button type="button" onClick={() => { store.signIn(); setMessage('Signed in (simulated).'); }}>Simulated sign-in</button>
        <button type="button" onClick={() => { store.signUp(); setMessage('Signed up (simulated).'); }}>Simulated sign-up</button>
        <button type="button" onClick={() => { store.signOut(); setMessage('Signed out; fresh anonymous browser.'); }}>Sign out</button>
        {!confirming && <button type="button" onClick={() => setConfirming(true)}>Start as a new demo user</button>}
      </div>
      {confirming && (
        <div className="confirm" role="group" aria-label="Confirm new demo user">
          <p>This clears all AmpliLoan demo data stored in this browser.</p>
          <button type="button" onClick={() => { store.startAsNewDemoUser(); setConfirming(false); setMessage('New demo user started.'); }}>
            Yes, clear and start over
          </button>
          <button type="button" onClick={() => setConfirming(false)}>Cancel</button>
        </div>
      )}
      <p role="status">{message}</p>

      <h2>Current state</h2>
      <dl className="summary">
        <div><dt>Owner</dt><dd>{snap.ownerLabel}</dd></div>
        <div><dt>Application ID</dt><dd>{a ? a.applicationId : 'None'}{a && <> (reference {shortReference(a.applicationId)})</>}</dd></div>
        <div><dt>Status</dt><dd>{a ? STATUS_LABELS[a.status] : 'None'}</dd></div>
        <div><dt>Step</dt><dd>{a ? a.lastStepId : 'None'}</dd></div>
      </dl>
      <Diagnostics />
    </section>
  );
}
