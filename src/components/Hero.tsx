import { usePageParams } from '../integrations/useStatsig';
import { href } from '../router';
import { guardNavigatingClick } from '../telemetry/navigation';
import { telemetry } from '../telemetry/runtime';
import { img } from './assets';

export function Hero() {
  const params = usePageParams('home');
  const headline = params.get('hero_headline').value;
  const cta = params.get('cta_label').value;
  return (
    <div className="hero-wrap" data-demo="landing-hero">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title" tabIndex={-1}>
            {headline}
          </h1>
          <p className="lede">See illustrative options in about two minutes. One simple journey for personal, home, and small business loans.</p>
          <a className="cta" href={href('/apply')} data-demo="home-cta" onClick={() => guardNavigatingClick(() => telemetry.rateCheckStarted('hero'))}>
            {cta}
          </a>
          <p className="disclaimer">Demo only. No real credit check, loans, or rates.</p>
        </div>
        <div className="hero-art">
          <img className="hero-glow" src={img('hero-card-glow.webp')} alt="" width="640" height="640" />
          <img className="hero-img" src={img('hero.webp')} alt="" width="1402" height="1122" fetchPriority="high" />
          <div className="example-card" data-demo="landing-example-offer">
            <span className="tag">Illustrative</span>
            <strong>$573/mo</strong>
            <span className="sub">Example offer: $18,500, 36 months</span>
          </div>
        </div>
      </section>
    </div>
  );
}
