import { useState, type ReactNode } from 'react';
import { href } from '../router';
import { formatUsd, monthlyPayment } from '../state/model';
import { Hero } from './Hero';
import { img } from './assets';

const DEMO_APR = 9.9;
const TERMS = [12, 24, 36, 48, 60] as const;

const STATS: [string, string][] = [
  ['$1k to $75k', 'Illustrative range'],
  ['About 2 min', 'To see options'],
  ['Fixed payments', 'Same amount every month'],
  ['No prepayment fees', 'On every option'],
];

const STEPS: [string, string, string][] = [
  ['step-1.webp', 'Tell us what you need', 'Choose a loan type, an amount, and a purpose.'],
  ['step-2.webp', 'Compare your options', 'See three illustrative offers side by side.'],
  ['step-3.webp', 'Choose and track it', 'Pick an option, submit, and follow your next steps.'],
];

const USES: [string, string, string][] = [
  ['use-debt.webp', 'Consolidate debt', 'Combine balances into one predictable monthly payment.'],
  ['use-home.webp', 'Home improvement', 'Fund the repair or upgrade you have been planning.'],
  ['use-medical.webp', 'Medical expenses', 'Spread out the cost of care over fixed payments.'],
  ['use-purchase.webp', 'Major purchase', 'Plan a big purchase without surprises.'],
  ['use-move.webp', 'Move or relocate', 'Cover the costs of settling into a new place.'],
  ['use-business.webp', 'Grow your small business', 'Invest in equipment, inventory, or space.'],
];

const WHY: [string, string, ReactNode][] = [
  ['Transparent by default', 'Every cost is shown up front, in plain language.', <path key="a" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z" />],
  ['Built around you', 'One journey that adapts to your details.', <path key="b" d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 0116 0z" />],
  ['Stay in the loop', 'Your dashboard tracks status and next steps.', <path key="c" d="M5 4h14v16H5zM8 9h8M8 13h8M8 17h5" />],
];

const TRUST: [string, string][] = [
  ['Your information stays private', 'Details you enter stay in your browser.'],
  ['Estimates, clearly labeled', 'Figures are illustrative, not an approval or decision.'],
  ['Secure by design', 'No documents are uploaded and no accounts are opened.'],
];

const FAQ: [string, string][] = [
  ['Is this a real loan?', 'Your options are estimates based on what you tell us. Final terms would depend on a full review, and nothing here is an approval or commitment to lend.'],
  ['Will checking my options affect my credit?', 'Seeing your illustrative options here does not include a credit check.'],
  ['How long does it take?', 'About two minutes to see illustrative options. You can change your answers at any time.'],
  ['How are offers shown?', 'You see three illustrative offers with a term, an APR, and an estimated monthly payment. They are not quotes.'],
  ['Can I save and come back?', 'Yes. Save your draft and choose Resume your application. It is stored in this browser.'],
  ['Which loan types can I explore?', 'Personal, mortgage, and small business loans, all through the same simple journey.'],
];

const Section = ({ id, tint, children }: { id: string; tint?: boolean; children: ReactNode }) => (
  <section id={id} data-demo={id} className={`section${tint ? ' tint' : ''}`} aria-labelledby={`${id}-title`}>
    <div className="container">{children}</div>
  </section>
);

const Cta = ({ label = 'Check your rate', dark }: { label?: string; dark?: boolean }) => (
  <a className={`button ${dark ? 'on-dark' : 'primary'}`} href={href('/apply')}>{label}</a>
);

function Estimator() {
  const [amount, setAmount] = useState(18500);
  const [term, setTerm] = useState<number>(36);
  const pay = monthlyPayment(amount, DEMO_APR, term);
  return (
    <div className="estimator" data-demo="landing-estimator">
      <div className="controls">
        <div>
          <label htmlFor="est-amount">Amount: <output htmlFor="est-amount" className="tabular">{formatUsd(amount)}</output></label>
          <input id="est-amount" type="range" min={1000} max={75000} step={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <fieldset className="term-pills">
          <legend>Term (months)</legend>
          {TERMS.map((t) => (
            <label key={t}>
              <input type="radio" name="est-term" value={t} checked={term === t} onChange={() => setTerm(t)} />
              <span>{t}</span>
            </label>
          ))}
        </fieldset>
        <p className="hint">Illustrative only. Uses a fixed {DEMO_APR}% APR. Not a quote or an offer.</p>
      </div>
      <div className="estimate" role="status" aria-live="polite">
        <span className="tag">Illustrative</span>
        <span>Estimated monthly payment</span>
        <span className="big">{formatUsd(pay, true)}</span>
        <p>{formatUsd(amount)} over {term} months at {DEMO_APR}% APR.</p>
      </div>
    </div>
  );
}

const PAGE_LINKS: [string, string][] = [
  ['landing-rates', 'Rates'],
  ['landing-how', 'How it works'],
  ['landing-faq', 'FAQ'],
];

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
};

export function Landing() {
  return (
    <>
      <Hero />
      <nav className="container page-jump" aria-label="On this page">
        {PAGE_LINKS.map(([id, label]) => (
          <button key={id} type="button" className="link-button" onClick={() => scrollToSection(id)}>{label}</button>
        ))}
      </nav>
      <div className="container strip" data-demo="landing-stats" id="landing-stats">
        <ul className="stats">
          {STATS.map(([a, b]) => (
            <li key={a}><strong>{a}</strong><span>{b}</span></li>
          ))}
        </ul>
        <p className="hint">Ranges and features are illustrative.</p>
      </div>

      <Section id="landing-how">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2 id="landing-how-title">Three steps to see your options</h2>
        </div>
        <ol className="grid cols-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {STEPS.map(([file, title, body], i) => (
            <li key={title} className="step-card">
              <img src={img(file)} alt="" width="240" height="240" loading="lazy" />
              <h3><span className="step-num" aria-hidden="true">{i + 1}</span>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
        <div className="section-cta"><Cta /></div>
      </Section>

      <Section id="landing-uses" tint>
        <div className="section-head">
          <span className="eyebrow">What it is for</span>
          <h2 id="landing-uses-title">Start with what you want to do</h2>
          <p>Personal, home, and small business loans all use the same simple flow.</p>
        </div>
        <ul className="grid cols-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {USES.map(([file, title, body]) => (
            <li key={title} className="use-card">
              <img src={img(file)} alt="" width="800" height="600" loading="lazy" />
              <div className="body">
                <h3>{title}</h3>
                <p>{body}</p>
                <a href={href('/apply')}>Get started<span className="sr-only"> with {title.toLowerCase()}</span></a>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="landing-rates">
        <div className="section-head">
          <span className="eyebrow">Rates</span>
          <h2 id="landing-rates-title">Estimate a monthly payment</h2>
          <p>Slide to an amount and pick a term. This is a calculator for illustration only.</p>
        </div>
        <Estimator />
      </Section>

      <Section id="landing-why" tint>
        <div className="section-head">
          <span className="eyebrow">Why AmpliLoan</span>
          <h2 id="landing-why-title">Clear from the first step</h2>
        </div>
        <ul className="grid cols-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {WHY.map(([title, body, icon]) => (
            <li key={title} className="why-card">
              <span className="icon-dot" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <section id="landing-trust" data-demo="landing-trust" className="section trust" aria-labelledby="landing-trust-title">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ color: 'var(--c-mint)' }}>Trust</span>
            <h2 id="landing-trust-title">Explore with confidence</h2>
            <p>Every figure is labeled as an estimate.</p>
          </div>
          <ul className="grid cols-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {TRUST.map(([title, body]) => (
              <li key={title} className="trust-card"><h3>{title}</h3><p>{body}</p></li>
            ))}
          </ul>
          <figure className="quote">
            <blockquote style={{ margin: 0 }}><p>&ldquo;Seeing every option laid out clearly made the decision feel easy.&rdquo;</p></blockquote>
            <figcaption>Illustrative quote.</figcaption>
          </figure>
        </div>
      </section>

      <Section id="landing-faq">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2 id="landing-faq-title">Questions, answered</h2>
        </div>
        <div className="faq">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </Section>

      <section id="landing-final-cta" data-demo="landing-final-cta" className="cta-band" aria-labelledby="landing-final-title" style={{ backgroundImage: `url(${img('cta-band.webp')})` }}>
        <div className="container">
          <h2 id="landing-final-title">Ready to see your illustrative options?</h2>
          <p>Takes about two minutes. Figures are illustrative.</p>
          <Cta dark />
        </div>
      </section>
    </>
  );
}
