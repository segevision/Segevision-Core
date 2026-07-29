'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';

/**
 * Live project thumbnail.
 *
 * Renders the real preview route in a scaled iframe rather than a stored screenshot,
 * so a thumbnail can never show a version of the site that no longer exists. Loading
 * is deferred until the row is near the viewport — a dashboard with twenty projects
 * must not boot twenty renderers at once.
 */
export function ProjectThumbnail({
  projectId,
  width = 1440,
  className,
  eager = false,
}: {
  projectId: string;
  width?: number;
  className?: string;
  eager?: boolean;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(eager);
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [scale, setScale] = React.useState(0.1);

  React.useEffect(() => {
    if (visible) return;
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [visible]);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const rect = host.getBoundingClientRect();
      if (rect.width > 0) setScale(rect.width / width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [width]);

  // A thumbnail that never loads must not spin forever.
  React.useEffect(() => {
    if (!visible || loaded) return;
    const timer = window.setTimeout(() => setFailed(true), 12000);
    return () => window.clearTimeout(timer);
  }, [visible, loaded]);

  return (
    <div
      ref={hostRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-studio-sunken ring-1 ring-inset ring-studio-line',
        className,
      )}
    >
      {visible && !failed && (
        <iframe
          src={`/preview?id=${projectId}&thumb=1`}
          title=""
          aria-hidden="true"
          tabIndex={-1}
          scrolling="no"
          onLoad={() => setLoaded(true)}
          style={{
            width,
            height: width * 0.72,
            transform: `scale(${scale})`,
            transformOrigin: 'top right',
          }}
          className="pointer-events-none absolute inset-0 border-0"
        />
      )}
      {!loaded && !failed && <div className="studio-skeleton absolute inset-0" />}
      {failed && (
        <div className="absolute inset-0 grid place-items-center">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-studio-faint" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="4.5" width="18" height="15" rx="2" />
            <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L20 21" />
          </svg>
        </div>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-black/[0.04]" />
    </div>
  );
}
