import { useEffect, useRef, useState } from 'react';
import { useLocation } from './router';
import { Footer, Header, Main, Notice } from './components/Layout';
import { Hero } from './components/Hero';
import { HelpPanel } from './components/HelpPanel';
import { ApplyPage } from './pages/ApplyPage';
import { OffersPage } from './pages/OffersPage';
import { DashboardPage } from './pages/DashboardPage';
import { PresenterPage } from './pages/PresenterPage';

export function App() {
  const loc = useLocation();
  const [help, setHelp] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    document.querySelector<HTMLElement>('main h1')?.focus();
  }, [loc.key]);

  let page;
  switch (loc.path) {
    case '/apply':
      page = <ApplyPage step={loc.step} />;
      break;
    case '/offers':
      page = <OffersPage />;
      break;
    case '/dashboard':
      page = <DashboardPage />;
      break;
    case '/presenter':
      page = <PresenterPage />;
      break;
    default:
      page = <Hero />;
  }

  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector<HTMLElement>('main h1')?.focus();
        }}
      >
        Skip to content
      </a>
      <Header route={loc.path} onHelp={() => setHelp(true)} />
      <Notice />
      <Main>{page}</Main>
      <Footer />
      <HelpPanel open={help} onClose={() => setHelp(false)} />
    </>
  );
}
