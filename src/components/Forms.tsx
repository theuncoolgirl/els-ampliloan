import { useEffect, useRef } from 'react';

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
  return (
    <ol className="stepper" aria-label="Progress">
      {['Details', 'Offers', 'Review'].map((l, i) => (
        <li key={l} aria-current={i + 1 === index ? 'step' : undefined}>
          {i + 1 === index ? `Step ${index} of 3: ${l}` : l}
        </li>
      ))}
    </ol>
  );
}
