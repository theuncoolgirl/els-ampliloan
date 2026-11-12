import type { ReactNode } from 'react';
import { href, type RoutePath } from '../router';
import { useSnapshot, store } from '../state/useStore';

const NAV: { path: RoutePath; label: string }[] = [
  { path: '/', label: 'Home' },
  { path: '/apply', label: 'Apply' },
  { path: '/offers', label: 'Offers' },
  { path: '/dashboard', label: 'Dashboard' },
];

export function Header({ route, onHelp }: { route: RoutePath; onHelp: () => void }) {
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
          <li>
            <button type="button" className="link-button" data-demo="help-entry" onClick={onHelp}>
              Help
            </button>
          </li>
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
      <p>Demo with synthetic data. No real loans, rates, or credit checks.</p>
      <a href={href('/presenter')}>Demo controls</a>
    </footer>
  );
}
