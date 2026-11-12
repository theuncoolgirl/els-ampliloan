import { forwardRef } from 'react';

type Props = { title: string; anchor: string; children?: React.ReactNode };

export const ScaffoldPage = forwardRef<HTMLHeadingElement, Props>(function ScaffoldPage(
  { title, anchor, children },
  ref,
) {
  return (
    <section className="page" data-demo={anchor}>
      <h1 ref={ref} tabIndex={-1}>
        {title}
      </h1>
      <p>This page is a demo scaffold. It is not implemented yet.</p>
      {children}
    </section>
  );
});
