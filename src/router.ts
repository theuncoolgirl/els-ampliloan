import { useEffect, useState } from 'react';

export type RoutePath = '/' | '/apply' | '/offers' | '/dashboard' | '/presenter';

const ROUTES: RoutePath[] = ['/', '/apply', '/offers', '/dashboard', '/presenter'];

export interface Location {
  path: RoutePath;
  step: string | null;
  key: string;
}

export function currentLocation(): Location {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [p, q = ''] = raw.split('?');
  const path = (ROUTES as string[]).includes(p) ? (p as RoutePath) : '/';
  return { path, step: new URLSearchParams(q).get('step'), key: `${path}?${q}` };
}

export function useLocation(): Location {
  const [loc, setLoc] = useState<Location>(currentLocation);
  useEffect(() => {
    const onChange = () => setLoc(currentLocation());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return loc;
}

export const href = (path: RoutePath, step?: string) => `#${path}${step ? `?step=${step}` : ''}`;

export const navigate = (path: RoutePath, step?: string) => {
  window.location.hash = href(path, step);
};
