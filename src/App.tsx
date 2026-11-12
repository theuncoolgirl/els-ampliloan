import { useEffect, useRef } from 'react';
import { useRoute } from './router';
import { Footer, Header, Main } from './components/Layout';
import { Hero } from './components/Hero';
import { ScaffoldPage } from './components/ScaffoldPage';

export function App() {
  const route = useRoute();
  const h1 = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    h1.current?.focus();
  }, [route]);

  let page;
  switch (route) {
    case '/apply':
      page = <ScaffoldPage ref={h1} title="Apply" anchor="application-root" />;
      break;
    case '/offers':
      page = <ScaffoldPage ref={h1} title="Offers" anchor="offers-root" />;
      break;
    case '/dashboard':
      page = <ScaffoldPage ref={h1} title="Dashboard" anchor="dashboard-root" />;
      break;
    case '/presenter':
      page = <ScaffoldPage ref={h1} title="Demo controls" anchor="presenter-root" />;
      break;
    default:
      page = <Hero ref={h1} />;
  }

  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); h1.current?.focus(); }}>
        Skip to content
      </a>
      <Header route={route} />
      <Main>{page}</Main>
      <Footer />
    </>
  );
}
