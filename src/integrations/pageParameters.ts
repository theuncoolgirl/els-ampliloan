import type { StatsigService, Resolved } from './statsig';

export const SUPPORT_CONFIG = 'ampliloan_support_content';
export const HELP_GATE = 'ampliloan_contextual_help';
export const PROGRESS_STYLES = ['steps', 'bar'] as const;
export type ProgressStyle = (typeof PROGRESS_STYLES)[number];

export const PAGE_SPECS = {
  home: { store: 'ampliloan_home', layer: 'ampliloan_home_layer', params: { hero_headline: 'Your next chapter starts here', cta_label: 'Check your rate' } },
  application: { store: 'ampliloan_application', layer: 'ampliloan_application_layer', params: { show_reassurance: false, progress_style: 'steps' as ProgressStyle } },
  offers: { store: 'ampliloan_offers', layer: 'ampliloan_offers_layer', params: { show_comparison_hint: false } },
  dashboard: { store: 'ampliloan_dashboard', layer: 'ampliloan_dashboard_layer', params: { show_next_steps: true } },
} as const;

export type PageName = keyof typeof PAGE_SPECS;
export type PageParamValues<P extends PageName> = { -readonly [K in keyof (typeof PAGE_SPECS)[P]['params']]: (typeof PAGE_SPECS)[P]['params'][K] };

const validators: Record<string, (v: unknown) => boolean> = {
  progress_style: (v) => (PROGRESS_STYLES as readonly unknown[]).includes(v),
};

/** Each parameter is read lazily on `get`; a parameter the page never asks for causes no SDK read and no exposure. */
export const createPageParams = (service: StatsigService) => ({
  getPageParams<P extends PageName>(page: P) {
    const spec = PAGE_SPECS[page];
    return {
      get<K extends keyof PageParamValues<P> & string>(key: K): Resolved<PageParamValues<P>[K]> {
        const def = (spec.params as Record<string, string | boolean>)[key];
        return service.readParam(spec.store, key, def, validators[key] as ((v: typeof def) => boolean) | undefined) as unknown as Resolved<PageParamValues<P>[K]>;
      },
    };
  },
  contextualHelp(): Resolved<boolean> {
    return service.readGate(HELP_GATE, false);
  },
  supportContent(): { heading: string; body: string; maxItems: number; source: Resolved<unknown>['source']; reason?: Resolved<unknown>['reason'] } {
    const r = service.readConfig(SUPPORT_CONFIG);
    const v = r.value ?? {};
    const mi = v.max_items;
    const validMax = typeof mi === 'number' && Number.isInteger(mi);
    return {
      heading: typeof v.heading === 'string' && v.heading ? v.heading : DEFAULT_SUPPORT.heading,
      body: typeof v.body === 'string' && v.body ? v.body : DEFAULT_SUPPORT.body,
      maxItems: validMax ? Math.min(5, Math.max(1, mi as number)) : DEFAULT_SUPPORT.maxItems,
      source: r.source,
      reason: r.reason,
    };
  },
});

export const DEFAULT_SUPPORT = { heading: 'Help and answers', body: 'Browse common questions about your sample application.', maxItems: 3 };
