import { useSyncExternalStore } from 'react';
import { statsig, telemetry } from '../telemetry/runtime';
import { useSnapshot } from '../state/useStore';

const short = (id: string) => id.slice(0, 8);

export function Diagnostics() {
  const d = useSyncExternalStore(telemetry.subscribe, telemetry.diagnostics);
  const sd = useSyncExternalStore(statsig.subscribe, statsig.diagnostics);
  const snap = useSnapshot();
  return (
    <section aria-labelledby="diag-title" data-diagnostics>
      <h2 id="diag-title">Telemetry diagnostics (read-only)</h2>
      <dl className="summary">
        <div><dt>Mode</dt><dd>{d.mode === 'live' ? 'Live demo (Amplitude project configured at build time)' : 'Local (no Amplitude key; nothing is sent)'}</dd></div>
        <div><dt>Amplitude init</dt><dd>{d.initState}</dd></div>
        <div><dt>Statsig mode</dt><dd>{sd.mode === 'local' ? 'Local (no Statsig key; no client, nothing is sent)' : sd.mode === 'live' ? 'Live (client initialized)' : 'Fallback (defaults in use)'}</dd></div>
        <div><dt>Statsig init</dt><dd>{sd.initState}</dd></div>
        <div><dt>Bounded wait result</dt><dd>{sd.waitResult}</dd></div>
        <div><dt>Statsig environment tier</dt><dd>{sd.environment}</dd></div>
        <div><dt>Preview</dt><dd>{sd.preview ? 'On (no evaluations, exposures, or sends)' : 'Off'}</dd></div>
        <div><dt>Statsig events declined (local)</dt><dd>{sd.declined}</dd></div>
        <div><dt>Statsig events sent</dt><dd>{sd.sent}</dd></div>
        <div><dt>Events suppressed by preview</dt><dd>{d.suppressedByPreview}</dd></div>
        <div><dt>Dropped (invalid) events</dt><dd>{d.dropped}</dd></div>
        <div><dt>Stable ID (first 8)</dt><dd>{short(snap.anonymousId)}</dd></div>
        <div><dt>Known ID (first 8)</dt><dd>{snap.profileId ? short(snap.profileId) : 'none'}</dd></div>
      </dl>
      <p className="muted">
        Accepted means the SDK reported a successful send response for that event. Queue acceptance is not proof of ingestion; confirm in the Amplitude project.
      </p>
      <h3>Statsig values read this session</h3>
      <p className="muted">A snapshot of values already read by the pages. Viewing this panel evaluates nothing.</p>
      {sd.snapshots.length === 0 ? (
        <p>None read yet.</p>
      ) : (
        <ul data-statsig-snapshots>
          {sd.snapshots.map((e) => (
            <li key={e.name}>
              <code>{e.name}</code> = {e.value} <strong>{e.source}</strong>
              {e.reason ? ` (${e.reason})` : ''}
            </li>
          ))}
        </ul>
      )}
      <h3>Setup failures</h3>
      {sd.setupFailures.length === 0 ? (
        <p>None.</p>
      ) : (
        <ul data-setup-failures>
          {sd.setupFailures.map((f) => (
            <li key={f.name}>
              <code>{f.name}</code>: {f.reason}
            </li>
          ))}
        </ul>
      )}
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
