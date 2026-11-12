import { href } from '../router';

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1 tabIndex={-1}>
          A clearer path to the loan you need
        </h1>
        <p className="lede">See illustrative options in about two minutes. Same simple journey for personal, home, and small business loans.</p>
        <a className="cta" href={href('/apply')} data-demo="home-cta">
          Check your rate
        </a>
        <p className="disclaimer">Demo with synthetic data. No real loans, rates, or credit checks.</p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
        <svg viewBox="0 0 200 120" className="rise">
          <polyline points="10,100 60,70 100,80 150,35 190,15" />
        </svg>
      </div>
    </section>
  );
}
