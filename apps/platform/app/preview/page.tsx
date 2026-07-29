'use client';

import * as React from 'react';
import {
  WebsiteRenderer,
  buildFontHref,
  parseEditPath,
  safeParseProject,
  type Project,
} from '@segevision/renderer';

/**
 * The preview document.
 *
 * Always loaded inside an iframe, and that is the point: an iframe has a real
 * viewport, so the media queries inside @segevision/ui resolve against the device
 * width being previewed rather than the editor window.
 *
 * In select mode it also acts as the click-to-edit surface. Identification is done by
 * walking up from the clicked node to the nearest [data-edit-path] — an explicit
 * contract stamped by the components themselves. Nothing here assumes "the first h1"
 * or any other positional rule, which is why switching a section variant cannot break
 * it.
 */

export const dynamic = 'force-dynamic';

export default function PreviewPage() {
  const [project, setProject] = React.useState<Project | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectMode, setSelectMode] = React.useState(false);
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null);
  const thumbnail = React.useRef(false);

  React.useEffect(() => {
    document.body.dataset.surface = 'preview';
    // Thumbnails render the same route but must never animate or trap the pointer.
    thumbnail.current = new URLSearchParams(window.location.search).get('thumb') === '1';
    if (thumbnail.current) document.body.dataset.thumb = '1';
  }, []);

  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    let cancelled = false;

    fetch(`/api/projects/${id}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? 'הפרויקט לא נמצא');
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        const parsed = safeParseProject(data.project);
        if (parsed.success) setProject(parsed.data);
        else setError('מבנה הפרויקט אינו תקין');
      })
      .catch((cause: Error) => {
        if (cancelled) return;
        setError(cause.message);
        window.parent?.postMessage({ type: 'segevision:preview-error' }, window.location.origin);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'segevision:project') return;
      const parsed = safeParseProject(event.data.project);
      if (parsed.success) {
        setProject(parsed.data);
        setError(null);
      }
      setSelectMode(Boolean(event.data.selectMode));
      setSelectedPath(event.data.selectedPath ?? null);
      setSelectedSectionId(event.data.selectedSectionId ?? null);
    };

    window.addEventListener('message', onMessage);
    window.parent?.postMessage({ type: 'segevision:preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  /** Click capture is only installed in select mode, so normal preview stays interactive. */
  React.useEffect(() => {
    if (!selectMode) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const field = target.closest<HTMLElement>('[data-edit-path]');
      const owner = target.closest<HTMLElement>('[data-section-id]');
      if (!field && !owner) return;

      event.preventDefault();
      event.stopPropagation();

      // A click always selects the section it landed in, and additionally the field
      // when one was hit. That is what keeps navigator and preview in step even when
      // the user clicks empty space inside a section.
      if (owner?.dataset.sectionId) {
        setSelectedSectionId(owner.dataset.sectionId);
        window.parent?.postMessage(
          { type: 'segevision:select-section', sectionId: owner.dataset.sectionId },
          window.location.origin,
        );
      }

      if (field) {
        const raw = field.dataset.editPath!;
        const { sectionId, path } = parseEditPath(raw);
        setSelectedPath(raw);
        window.parent?.postMessage({ type: 'segevision:select-field', sectionId, path, raw }, window.location.origin);
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [selectMode]);

  if (error && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <p className="text-sm text-studio-muted">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <p className="text-sm text-studio-muted">טוען תצוגה מקדימה…</p>
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href={buildFontHref(project.design)} />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            [data-section-id]{scroll-margin-top:24px}
            [data-section-id][data-section-selected="true"]{position:relative}
            [data-section-id][data-section-selected="true"]::after{
              content:"";position:absolute;inset:0;pointer-events:none;z-index:40;
              outline:2px solid hsl(232 90% 66% / .9);outline-offset:-2px;border-radius:2px;
              box-shadow:0 0 0 9999px hsl(232 90% 66% / 0.04) inset;
            }
            ${
              selectMode
                ? `
              [data-edit-path]{outline:1px dashed hsl(232 90% 66% / .5);outline-offset:3px;cursor:pointer;transition:outline-color .12s}
              [data-edit-path]:hover{outline:2px solid hsl(232 90% 66%);outline-offset:3px}
              [data-edit-path][data-selected="true"]{outline:2px solid hsl(232 90% 66%);outline-offset:3px;background:hsl(232 90% 66% / .06)}
            `
                : ''
            }
          `,
        }}
      />
      <SelectionMarker selectedPath={selectedPath} selectedSectionId={selectedSectionId} enabled={selectMode} />
      <WebsiteRenderer project={project} preview />
    </>
  );
}

/**
 * Applies the current selection to the DOM after every render.
 *
 * Done imperatively rather than through props because the marked nodes live inside
 * @segevision/ui components, which must stay unaware that an editor exists.
 */
function SelectionMarker({
  selectedPath,
  selectedSectionId,
  enabled,
}: {
  selectedPath: string | null;
  selectedSectionId: string | null;
  enabled: boolean;
}) {
  const lastSection = React.useRef<string | null>(null);

  React.useEffect(() => {
    document.querySelectorAll('[data-section-selected]').forEach((node) => {
      (node as HTMLElement).removeAttribute('data-section-selected');
    });
    if (selectedSectionId) {
      const section = document.querySelector<HTMLElement>(`[data-section-id="${CSS.escape(selectedSectionId)}"]`);
      if (section) {
        section.dataset.sectionSelected = 'true';
        // Only scroll when the selection actually changed, so typing in a field does
        // not yank the preview on every keystroke.
        if (lastSection.current !== selectedSectionId) {
          section.scrollIntoView({ block: 'start', behavior: 'smooth' });
          lastSection.current = selectedSectionId;
        }
      }
    } else {
      lastSection.current = null;
    }
  });

  React.useEffect(() => {
    document.querySelectorAll('[data-edit-path][data-selected]').forEach((node) => {
      (node as HTMLElement).removeAttribute('data-selected');
    });
    if (!enabled || !selectedPath) return;
    const node = document.querySelector<HTMLElement>(`[data-edit-path="${CSS.escape(selectedPath)}"]`);
    if (node) node.dataset.selected = 'true';
  });

  return null;
}
