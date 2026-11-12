import { useSyncExternalStore } from 'react';
import { telemetry } from '../telemetry/runtime';
import { useSnapshot } from '../state/useStore';

const short = (id: string) => id.slice(0, 8);

export function Diagnostics() {
  const d = useSyncExternalStore(telemetry.subscribe, telemetry.diagnostics);
  const snap = useSnapshot();
  return (
    <section aria-labelledby="diag-title" data-diagnostics>
      <h2 id="diag-title">Telemetry diagnostics (read-only)</h2>
      <dl className="summary">
        <div><dt>Mode</dt><dd>{d.mode === 'live' ? 'Live demo (Amplitude project configured at build time)' : 'Local (no Amplitude key; nothing is sent)'}</dd></div>
        <div><dt>Amplitude init</dt><dd>{d.initState}</dd></div>
        <div><dt>Statsig</dt><dd>Disabled, not evaluated ({d.statsigDeclined} events declined)</dd></div>
        <div><dt>Dropped (invalid) events</dt><dd>{d.dropped}</dd></div>
        <div><dt>Stable ID (first 8)</dt><dd>{short(snap.anonymousId)}</dd></div>
        <div><dt>Known ID (first 8)</dt><dd>{snap.profileId ? short(snap.profileId) : 'none'}</dd></div>
      </dl>
      <p className="muted">
        Accepted means the SDK reported a successful send response for that event. Queue acceptance is not proof of ingestion; confirm in the Amplitude project.
      </p>
      <h3>Last 20 business events</h3>
      {d.log.length === 0 ? (
        <p>None yet.</p>
      ) : (
        <ol className="event-log">
          {d.log.map((e) => (
            <li key={e.id}>
              {e.name} <code>{short(e.id)}</code> <strong>{e.state}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
