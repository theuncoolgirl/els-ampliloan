import { useEffect, useRef, useState } from 'react';
import { DEFAULT_SUPPORT } from '../integrations/pageParameters';
import { pageParams } from '../telemetry/runtime';

const GLOSSARY: [string, string][] = [
  ['APR', 'Annual percentage rate: the yearly cost of borrowing shown as a percentage. Values here are illustrative.'],
  ['Term', 'How many months you would take to repay the loan.'],
  ['Principal', 'The amount you borrow, before interest.'],
  ['Monthly payment', 'An estimate based on the amount, APR, and term in the sample offer.'],
  ['Fixed rate', 'A rate that stays the same for the whole term.'],
];

const FAQS: [string, string][] = [
  ['Is this a real application?', 'No. Everything here is a demo with synthetic data.'],
  ['Will you check my credit?', 'No. There are no credit checks.'],
  ['Are the offers real?', 'No. Offers come from sample data and are not approvals, quotes, or commitments.'],
  ['Can I finish later?', 'Yes. Your draft is saved in this browser. Choose Resume your application.'],
  ['Do I upload documents?', 'No. Next steps are simulated and no files are uploaded.'],
];

const TOPICS: [string, string, string][] = [
  ['application', 'The application', 'Choose a loan type, enter an amount and purpose, pick an offer, then review and submit.'],
  ['offers', 'Offers', 'Compare three sample offers by term, APR, and estimated monthly payment.'],
  ['status', 'Status', 'After you submit, status moves from submitted to under review to a sample result. In this demo a presenter advances it.'],
  ['general', 'General', 'This site is a demonstration. Nothing here is financial advice.'],
];

export function HelpPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [content, setContent] = useState(DEFAULT_SUPPORT);
  useEffect(() => {
    if (open) setContent(pageParams.supportContent());
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="help-panel" aria-labelledby="help-title" onClose={onClose}>
      <div className="help-head">
        <h2 id="help-title">{content.heading}</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      {content.body !== '' && <p className="muted">{content.body}</p>}
      <h3>Browse by topic</h3>
      {TOPICS.map(([id, title, body]) => (
        <section key={id} data-topic={id}>
          <h4>{title}</h4>
          <p>{body}</p>
        </section>
      ))}
      <h3>Glossary</h3>
      <dl>
        {GLOSSARY.map(([t, d]) => (
          <div key={t}>
            <dt>{t}</dt>
            <dd>{d}</dd>
          </div>
        ))}
      </dl>
      <h3>Frequently asked questions</h3>
      {FAQS.slice(0, content.maxItems).map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </dialog>
  );
}
