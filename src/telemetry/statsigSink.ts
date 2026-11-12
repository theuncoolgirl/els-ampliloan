/** Statsig is intentionally disabled until a later phase: it records how many events it declined and sends nothing. */
export const createDisabledStatsigSink = () => {
  let declined = 0;
  return {
    name: 'statsig' as const,
    enabled: false as const,
    decline() {
      declined += 1;
    },
    declined: () => declined,
  };
};
