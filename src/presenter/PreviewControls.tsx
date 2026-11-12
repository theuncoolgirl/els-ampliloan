import { usePreviewState } from '../integrations/useStatsig';
import { PAGE_SPECS, PROGRESS_STYLES } from '../integrations/pageParameters';
import { preview } from '../telemetry/runtime';

const P = PAGE_SPECS;

export function PreviewControls() {
  const s = usePreviewState();
  const str = (store: string, key: string, def: string) => (
    <label className="field" key={key}>
      {key}
      <input data-amp-mask type="text" value={String(s.params[`${store}.${key}`] ?? '')} placeholder={def} onChange={(e) => preview.setParam(store, key, e.target.value === '' ? undefined : e.target.value)} />
    </label>
  );
  const bool = (store: string, key: string) => (
    <label className="choice" key={key}>
      <input data-amp-mask type="checkbox" checked={s.params[`${store}.${key}`] === true} onChange={(e) => preview.setParam(store, key, e.target.checked)} />
      <span>{key}</span>
    </label>
  );
  return (
    <section aria-labelledby="preview-title" data-preview-controls>
      <h2 id="preview-title">Preview (local overrides)</h2>
      <p className="muted">Overrides are kept in memory for this session only. While on, nothing is evaluated by Statsig and no events or exposures are sent.</p>
      <label className="choice">
        <input type="checkbox" checked={s.active} onChange={(e) => preview.setActive(e.target.checked)} />
        <span>Preview mode</span>
      </label>
      {s.active && (
        <div>
          <h3>Home</h3>
          {str(P.home.store, 'hero_headline', P.home.params.hero_headline)}
          {str(P.home.store, 'cta_label', P.home.params.cta_label)}
          <h3>Application</h3>
          {bool(P.application.store, 'show_reassurance')}
          <label className="field">
            progress_style
            <select data-amp-mask value={String(s.params[`${P.application.store}.progress_style`] ?? 'steps')} onChange={(e) => preview.setParam(P.application.store, 'progress_style', e.target.value)}>
              {PROGRESS_STYLES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <h3>Offers</h3>
          {bool(P.offers.store, 'show_comparison_hint')}
          <h3>Dashboard</h3>
          <label className="choice">
            <input data-amp-mask type="checkbox" checked={s.params[`${P.dashboard.store}.show_next_steps`] !== false} onChange={(e) => preview.setParam(P.dashboard.store, 'show_next_steps', e.target.checked)} />
            <span>show_next_steps</span>
          </label>
          <h3>Standalone</h3>
          <label className="choice">
            <input data-amp-mask type="checkbox" checked={s.gate === true} onChange={(e) => preview.setGate(e.target.checked)} />
            <span>ampliloan_contextual_help</span>
          </label>
          <label className="field">
            support heading
            <input data-amp-mask type="text" value={String(s.config.heading ?? '')} onChange={(e) => preview.setConfig('heading', e.target.value === '' ? undefined : e.target.value)} />
          </label>
          <label className="field">
            support max_items
            <input data-amp-mask type="number" min={1} max={5} value={String(s.config.max_items ?? '')} onChange={(e) => preview.setConfig('max_items', e.target.value === '' ? undefined : Number(e.target.value))} />
          </label>
          <h3>Preview values</h3>
          <ul>
            {Object.entries(s.params).map(([k, v]) => (
              <li key={k}>
                <code>{k}</code> = {String(v)} <strong>preview</strong>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => preview.clear()}>
            Clear overrides
          </button>
        </div>
      )}
    </section>
  );
}
