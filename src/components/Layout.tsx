import { useEffect, useState, type ReactNode } from 'react';
import { href, type RoutePath } from '../router';
import { useSnapshot, store } from '../state/useStore';

const NAV: { path: RoutePath; label: string }[] = [
  { path: '/', label: 'Home' },
  { path: '/apply', label: 'Apply' },
  { path: '/offers', label: 'Offers' },
  { path: '/dashboard', label: 'Dashboard' },
];

const PAGE_LINKS: [string, string][] = [
  ['landing-rates', 'Rates'],
  ['landing-how', 'How it works'],
  ['landing-faq', 'FAQ'],
];

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
};

function useHeroOutOfView(enabled: boolean) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setOut(false);
      return;
    }
    const target = document.querySelector('[data-demo="home-cta"]');
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setOut(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(target);
    return () => io.disconnect();
  }, [enabled]);
  return out;
}

export function Header({ route, onHelp }: { route: RoutePath; onHelp: () => void }) {
  const showCta = useHeroOutOfView(route === '/');
  return (
    <header className="site-header">
      <a className="brand" href={href('/')}>
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="28" height="28" />
        AmpliLoan
      </a>
      <nav aria-label="Primary">
        <ul>
          {NAV.map((n) => (
            <li key={n.path}>
              <a href={href(n.path)} aria-current={route === n.path ? 'page' : undefined}>
                {n.label}
              </a>
            </li>
          ))}
          {route === '/' &&
            PAGE_LINKS.map(([id, label]) => (
              <li key={id} className="page-links">
                <button type="button" className="link-button" onClick={() => scrollTo(id)}>
                  {label}
                </button>
              </li>
            ))}
          <li>
            <button type="button" className="link-button" data-demo="help-entry" onClick={onHelp}>
              Help
            </button>
          </li>
          {route === '/' && showCta && (
            <li>
              <a className="button primary header-cta visible" href={href('/apply')}>
                Check your rate
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export function Notice() {
  const { notice } = useSnapshot();
  if (!notice) return null;
  return (
    <div className="notice" role="status">
      <span>{notice}</span>
      <button type="button" onClick={() => store.dismissNotice()}>
        Dismiss
      </button>
    </div>
  );
}

export function Main({ children }: { children: ReactNode }) {
  return <main id="main">{children}</main>;
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <a className="brand" href={href('/')}>AmpliLoan</a>
        <p>Demo with synthetic data. No real loans, rates, or credit checks. Amounts, rates, and offers shown are illustrative only.</p>
        <nav className="footer-links" aria-label="Footer">
          <a href={href('/apply')}>Apply</a>
          <a href={href('/offers')}>Offers</a>
          <a href={href('/dashboard')}>Dashboard</a>
          <a href={href('/presenter')}>Demo controls</a>
        </nav>
        <p>&copy; 2026 AmpliLoan demo.</p>
      </div>
    </footer>
  );
}
