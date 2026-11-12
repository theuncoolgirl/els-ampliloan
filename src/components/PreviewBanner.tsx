import { usePreviewState } from '../integrations/useStatsig';

export function PreviewBanner() {
  const { active } = usePreviewState();
  if (!active) return null;
  return (
    <p className="preview-banner" role="status" data-demo="preview-banner">
      Preview: values are local overrides, not randomized assignments. No events or exposures are sent.
    </p>
  );
}
