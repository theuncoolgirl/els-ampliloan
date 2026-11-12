import { useEffect, useState } from 'react';

export type RoutePath = '/' | '/apply' | '/offers' | '/dashboard' | '/presenter';

const ROUTES: RoutePath[] = ['/', '/apply', '/offers', '/dashboard', '/presenter'];

export function currentRoute(): RoutePath {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const path = raw.split('?')[0];
  return (ROUTES as string[]).includes(path) ? (path as RoutePath) : '/';
}

export function useRoute(): RoutePath {
  const [route, setRoute] = useState<RoutePath>(currentRoute);
  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export const href = (path: RoutePath) => `#${path}`;
