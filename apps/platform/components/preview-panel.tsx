'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import type { Project } from '@segevision/renderer';
import { IconButton, Segmented, StatusPill, Tooltip } from './studio';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile' | 'custom';
export type PreviewZoom = 'fit' | 0.5 | 0.75 | 1;

export const DEVICES: Record<Exclude<PreviewDevice, 'custom'>, { width: number; height: number; label: string }> = {
  desktop: { width: 1440, height: 900, label: 'מחשב' },
  tablet: { width: 834, height: 1112, label: 'טאבלט' },
  mobile: { width: 390, height: 844, label: 'נייד' },
};

/** Which of the design system's breakpoints this width lands in, named in Hebrew. */
function breakpointName(width: number): string {
  if (width >= 1440) return 'מסך רחב';
  if (width >= 1024) return 'מחשב';
  if (width >= 640) return 'טאבלט';
  return 'נייד';
}

const DeviceIcon = ({ device }: { device: Exclude<PreviewDevice, 'custom'> }) => {
  const paths = {
    desktop: (<><rect x="2.5" y="4" width="19" height="13" rx="1.5" /><path d="M9 20h6M12 17v3" strokeLinecap="round" /></>),
    tablet: (<><rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M11 18.5h2" strokeLinecap="round" /></>),
    mobile: (<><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" strokeLinecap="round" /></>),
  } as const;
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{paths[device]}</svg>;
};

export interface PreviewSettings {
  device: PreviewDevice;
  customWidth: number;
  zoom: PreviewZoom;
  selectMode: boolean;
}

export type PreviewStatus = 'loading' | 'ready' | 'error';

/**
 * The preview canvas.
 *
 * One toolbar, one framed device sitting on a recessed canvas. The frame and the
 * shadow are what stop this reading as "an iframe inside a panel" — the site becomes
 * an object on a work surface rather than a region of the admin UI.
 */
export function PreviewPanel({
  project,
  settings,
  onSettingsChange,
  onSelectField,
  onSelectSection,
  selectedPath,
  selectedSectionId,
  saveLabel,
  saveTone,
  onPresent,
  className,
  chromeless = false,
}: {
  project: Project;
  settings: PreviewSettings;
  onSettingsChange: (next: Partial<PreviewSettings>) => void;
  onSelectField: (sectionId: string | undefined, path: string) => void;
  onSelectSection: (sectionId: string) => void;
  selectedPath?: string | null;
  selectedSectionId?: string | null;
  saveLabel?: string;
  saveTone?: 'ok' | 'warn' | 'neutral' | 'danger';
  onPresent?: () => void;
  className?: string;
  chromeless?: boolean;
}) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [fitScale, setFitScale] = React.useState(1);
  const [frameHeight, setFrameHeight] = React.useState(900);
  const [status, setStatus] = React.useState<PreviewStatus>('loading');

  const width = settings.device === 'custom' ? settings.customWidth : DEVICES[settings.device].width;
  const baseHeight = settings.device === 'custom' ? 900 : DEVICES[settings.device].height;
  const fillsHeight = settings.device === 'desktop' || settings.device === 'custom';

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const rect = stage.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const next = fillsHeight
        ? Math.min(rect.width / width, 1)
        : Math.min(rect.width / width, rect.height / baseHeight, 1);
      setFitScale(Number(next.toFixed(4)));
      const effective = settings.zoom === 'fit' ? next : settings.zoom;
      setFrameHeight(Math.max(baseHeight, Math.round(rect.height / Math.max(effective, 0.1))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [width, baseHeight, fillsHeight, settings.zoom]);

  const scale = settings.zoom === 'fit' ? fitScale : settings.zoom;

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (data?.type === 'segevision:preview-ready') setStatus('ready');
      if (data?.type === 'segevision:preview-error') setStatus('error');
      if (data?.type === 'segevision:select-field' && typeof data.path === 'string') {
        onSelectField(data.sectionId || undefined, data.path);
      }
      if (data?.type === 'segevision:select-section' && typeof data.sectionId === 'string') {
        onSelectSection(data.sectionId);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onSelectField, onSelectSection]);

  React.useEffect(() => {
    if (status !== 'ready') return;
    const timer = window.setTimeout(() => {
      frameRef.current?.contentWindow?.postMessage(
        {
          type: 'segevision:project',
          project,
          selectMode: settings.selectMode,
          selectedPath: selectedPath ?? null,
          selectedSectionId: selectedSectionId ?? null,
        },
        window.location.origin,
      );
    }, 80);
    return () => window.clearTimeout(timer);
  }, [project, status, settings.selectMode, selectedPath, selectedSectionId]);

  return (
    <div className={cn('flex min-h-0 flex-col bg-studio-canvas', className)}>
      {!chromeless && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-studio-line bg-studio-panel/80 px-3 py-2 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              label="רוחב תצוגה"
              size="sm"
              value={settings.device === 'custom' ? 'custom' : settings.device}
              onChange={(value) => onSettingsChange({ device: value as PreviewDevice })}
              options={[
                ...(Object.keys(DEVICES) as Array<keyof typeof DEVICES>).map((key) => ({
                  value: key as PreviewDevice,
                  label: DEVICES[key].label,
                  icon: <DeviceIcon device={key} />,
                })),
                { value: 'custom' as PreviewDevice, label: 'מותאם' },
              ]}
            />
            {settings.device === 'custom' && (
              <label className="flex items-center gap-1.5 text-ui-xs text-studio-muted">
                <input
                  type="number"
                  min={320}
                  max={2560}
                  value={settings.customWidth}
                  onChange={(event) => onSettingsChange({ customWidth: Math.max(320, Math.min(2560, Number(event.target.value) || 320)) })}
                  aria-label="רוחב מותאם אישית בפיקסלים"
                  dir="ltr"
                  className="h-7 w-[4.5rem] rounded-md bg-studio-sunken px-2 text-center font-studio-mono text-ui-xs text-studio-ink ring-1 ring-inset ring-transparent focus:bg-studio-panel focus:outline-none focus:ring-studio-accent"
                />
                px
              </label>
            )}
            <Segmented
              label="מרחק תצוגה"
              size="sm"
              value={String(settings.zoom)}
              onChange={(value) => onSettingsChange({ zoom: value === 'fit' ? 'fit' : (Number(value) as PreviewZoom) })}
              options={[
                { value: 'fit', label: 'התאמה' },
                { value: '0.5', label: '50%' },
                { value: '0.75', label: '75%' },
                { value: '1', label: '100%' },
              ]}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {saveLabel && <StatusPill tone={saveTone ?? 'neutral'}>{saveLabel}</StatusPill>}

            <button
              type="button"
              onClick={() => onSettingsChange({ selectMode: !settings.selectMode })}
              aria-pressed={settings.selectMode}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-ui-xs font-semibold transition-[background-color,color] duration-[var(--t-state)]',
                settings.selectMode
                  ? 'bg-studio-accent text-studio-accent-ink shadow-studio-sm'
                  : 'text-studio-soft hover:bg-studio-raised hover:text-studio-ink',
              )}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="m4 3 7 17 2.5-6.5L20 11z" strokeLinejoin="round" />
              </svg>
              {settings.selectMode ? 'לחיצה לעריכה פעילה' : 'לחיצה לעריכה'}
            </button>

            {onPresent && (
              <Tooltip label="תצוגה מלאה ללקוח" shortcut="P">
                <IconButton aria-label="תצוגה מלאה ללקוח" onClick={onPresent}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
                  </svg>
                </IconButton>
              </Tooltip>
            )}
            <Tooltip label="פתיחה בכרטיסייה">
              <a
                href={`/preview?id=${project.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="פתיחה בכרטיסייה"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-studio-muted transition-colors hover:bg-studio-raised hover:text-studio-ink"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Tooltip>
          </div>
        </div>
      )}

      <div ref={stageRef} className="studio-scroll relative flex min-h-0 flex-1 flex-col items-center overflow-auto p-4">
        {/* Digits stay LTR; the breakpoint name is Hebrew and reads with the page. */}
        {!chromeless && (
          <p className="mb-2 shrink-0 text-[10px] text-studio-faint">
            <span className="font-studio-mono tabular-nums" dir="ltr">
              {width} × {settings.device === 'custom' ? '—' : baseHeight} · {Math.round(scale * 100)}%
            </span>
            {' · '}
            {breakpointName(width)}
          </p>
        )}

        <div
          style={{ width: width * scale, height: frameHeight * scale }}
          className={cn(
            'relative shrink-0 overflow-hidden bg-white transition-[width,height] duration-[var(--t-move)] ease-studio',
            chromeless ? 'rounded-lg' : 'rounded-xl shadow-studio-canvas ring-1 ring-black/10',
          )}
        >
          <iframe
            ref={frameRef}
            title={`תצוגה מקדימה — ${width} פיקסלים`}
            src={`/preview?id=${project.id}`}
            style={{ width, height: frameHeight, transform: `scale(${scale})`, transformOrigin: 'top right' }}
            className="border-0"
          />

          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col gap-3 bg-studio-panel p-6">
              <div className="studio-skeleton h-8 w-1/3 rounded-md" />
              <div className="studio-skeleton h-40 w-full rounded-lg" />
              <div className="flex gap-3">
                <div className="studio-skeleton h-20 flex-1 rounded-lg" />
                <div className="studio-skeleton h-20 flex-1 rounded-lg" />
                <div className="studio-skeleton h-20 flex-1 rounded-lg" />
              </div>
              <span className="sr-only">התצוגה נטענת</span>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 grid place-items-center bg-studio-panel p-6 text-center">
              <div>
                <p className="text-ui-base font-bold text-studio-ink">התצוגה לא נטענה</p>
                <p className="mt-1 text-ui-sm text-studio-muted">נסו לרענן את הדף. הנתונים של הפרויקט לא נפגעו.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
