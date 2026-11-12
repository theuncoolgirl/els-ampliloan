import { useEffect, useRef } from 'react';
import { usePageParams } from '../integrations/useStatsig';

export interface FieldError {
  field: string;
  message: string;
}

export function ErrorSummary({ errors }: { errors: FieldError[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errors.length) ref.current?.focus();
  }, [errors]);
  if (!errors.length) return null;
  return (
    <div ref={ref} className="error-summary" tabIndex={-1} role="alert">
      <h2>There is a problem</h2>
      <ul>
        {errors.map((e) => (
          <li key={e.field}>
            <a href={`#${e.field}`} onClick={(ev) => { ev.preventDefault(); document.getElementById(e.field)?.focus(); }}>
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const errorId = (field: string) => `${field}-error`;

export function Stepper({ index }: { index: number }) {
  const style = usePageParams('application').get('progress_style').value;
  const labels = ['Details', 'Offers', 'Review'];
  if (style === 'bar') {
    return (
      <div className="stepper-bar" role="group" aria-label="Progress">
        <div className="bar-track" aria-hidden="true">
          <div className="bar-fill" style={{ width: `${(index / 3) * 100}%` }} />
        </div>
        <ol className="stepper bar-labels">
          {labels.map((l, i) => (
            <li key={l} aria-current={i + 1 === index ? 'step' : undefined}>
              {i + 1 === index ? `Step ${index} of 3: ${l}` : l}
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return (
    <ol className="stepper" aria-label="Progress">
      {labels.map((l, i) => (
        <li key={l} aria-current={i + 1 === index ? 'step' : undefined}>
          {i + 1 === index ? `Step ${index} of 3: ${l}` : l}
        </li>
      ))}
    </ol>
  );
}
