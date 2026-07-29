'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import {
  BACKGROUND_MODE_LABELS,
  BUTTON_STYLE_LABELS,
  FONT_OPTIONS,
  RADIUS_LABELS,
  THEME_PRESET_LABELS,
  contrastRatio,
  mediaSlots,
  type MediaSlotDefinition,
  type ProjectDesign,
  type ThemePreset,
} from '@segevision/renderer';
import { uploadMedia } from '../lib/client';
import type { PanelProps } from './editor-shared';
import { ColorInput, EmptyNote, Field, Panel, Segmented, SelectInput, StatusPill, StudioButton, TextArea, TextInput } from './studio';

export function DesignPanel({ project, update }: PanelProps) {
  const { design } = project;
  const setDesign = (patch: Partial<ProjectDesign>) =>
    update((draft) => ({ ...draft, design: { ...draft.design, ...patch } }));

  const onWhite = contrastRatio(design.primaryColor, '#FFFFFF');

  return (
    <div className="flex flex-col gap-8">
      <Panel title="ערכת נושא" description="הבסיס שקובע את הניטרליים, הצללים והמשטחים.">
        <Field label="ערכה">
          <SelectInput
            value={project.theme}
            onChange={(e) => update((draft) => ({ ...draft, theme: e.target.value as ThemePreset }))}
          >
            {(Object.keys(THEME_PRESET_LABELS) as ThemePreset[]).map((preset) => (
              <option key={preset} value={preset}>{THEME_PRESET_LABELS[preset]}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="מצב רקע">
          <Segmented
            label="מצב רקע"
            value={design.backgroundMode}
            onChange={(value) => setDesign({ backgroundMode: value })}
            options={[
              { value: 'light', label: BACKGROUND_MODE_LABELS.light },
              { value: 'dark', label: BACKGROUND_MODE_LABELS.dark },
            ]}
          />
        </Field>
      </Panel>

      <Panel title="צבעים" description="צבע ראשי לפעולות ולמיתוג, צבע משני לדגשים ולאייקונים.">
        <Field label="צבע ראשי">
          <ColorInput value={design.primaryColor} onChange={(value) => setDesign({ primaryColor: value })} />
        </Field>
        {onWhite < 4.5 && (
          <p className="rounded-md bg-studio-warn/10 px-3 py-2 text-xs leading-relaxed text-studio-warn ring-1 ring-inset ring-studio-warn/25">
            הניגודיות מול לבן היא {onWhite.toFixed(2)}:1, מתחת לסף 4.5:1. הכפתורים יוכהו אוטומטית כדי לשמור על קריאוּת.
          </p>
        )}
        <Field label="צבע משני">
          <ColorInput value={design.secondaryColor} onChange={(value) => setDesign({ secondaryColor: value })} />
        </Field>
      </Panel>

      <Panel title="טיפוגרפיה" description="שתי משפחות בלבד. שתיהן תומכות בעברית במלואה.">
        <Field label="גופן כותרות" hint={FONT_OPTIONS.find((f) => f.value === design.headingFont)?.note}>
          <SelectInput value={design.headingFont} onChange={(e) => setDesign({ headingFont: e.target.value as ProjectDesign['headingFont'] })}>
            {FONT_OPTIONS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
          </SelectInput>
        </Field>
        <Field label="גופן טקסט" hint={FONT_OPTIONS.find((f) => f.value === design.bodyFont)?.note}>
          <SelectInput value={design.bodyFont} onChange={(e) => setDesign({ bodyFont: e.target.value as ProjectDesign['bodyFont'] })}>
            {FONT_OPTIONS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
          </SelectInput>
        </Field>
      </Panel>

      <Panel title="צורה">
        <Field label="עיגול פינות">
          <Segmented
            label="עיגול פינות"
            value={design.radius}
            onChange={(value) => setDesign({ radius: value })}
            options={(Object.keys(RADIUS_LABELS) as ProjectDesign['radius'][]).map((value) => ({ value, label: RADIUS_LABELS[value] }))}
          />
        </Field>
        <Field label="סגנון כפתורים">
          <Segmented
            label="סגנון כפתורים"
            value={design.buttonStyle}
            onChange={(value) => setDesign({ buttonStyle: value })}
            options={(Object.keys(BUTTON_STYLE_LABELS) as ProjectDesign['buttonStyle'][]).map((value) => ({ value, label: BUTTON_STYLE_LABELS[value] }))}
          />
        </Field>
      </Panel>
    </div>
  );
}

export function SeoPanel({ project, update }: PanelProps) {
  return (
    <Panel title="קידום אורגני" description="נכתב כקופי לקורא אנושי, לא כרשימת מילות מפתח.">
      <Field label="כותרת העמוד" hint={`${project.seo.title.length} תווים. מומלץ עד 60.`}>
        <TextInput
          value={project.seo.title}
          onChange={(e) => update((d) => ({ ...d, seo: { ...d.seo, title: e.target.value } }), { coalesceKey: 'seo-t' })}
        />
      </Field>
      <Field label="תיאור" hint={`${project.seo.description.length} תווים. מומלץ 120–160.`}>
        <TextArea
          value={project.seo.description}
          rows={3}
          onChange={(e) => update((d) => ({ ...d, seo: { ...d.seo, description: e.target.value } }), { coalesceKey: 'seo-d' })}
        />
      </Field>
      <Field label="מילות מפתח" hint="מופרדות בפסיק. כדאי לכלול גם שגיאות כתיב נפוצות בעברית.">
        <TextInput
          value={project.seo.keywords.join(', ')}
          onChange={(e) =>
            update((d) => ({ ...d, seo: { ...d.seo, keywords: e.target.value.split(',').map((w) => w.trim()).filter(Boolean) } }), { coalesceKey: 'seo-k' })
          }
        />
      </Field>
      <Field label="אזור גיאוגרפי" hint="היישובים שמהם מגיעים לקוחות — מזין חיפוש מקומי.">
        <TextInput
          value={project.seo.localArea}
          onChange={(e) => update((d) => ({ ...d, seo: { ...d.seo, localArea: e.target.value } }), { coalesceKey: 'seo-a' })}
        />
      </Field>
    </Panel>
  );
}

export function MediaPanel({ project, update }: PanelProps) {
  const slots = mediaSlots(project);
  return (
    <Panel title="מדיה" description="כל מסגרת תמונה באתר מופיעה כאן אוטומטית לפי התוכן והסקשנים הפעילים.">
      {slots.length === 0 ? (
        <EmptyNote>אין מסגרות תמונה — הסקשנים שמכילים תמונות מכובים כרגע.</EmptyNote>
      ) : (
        <div className="flex flex-col gap-6">
          {slots.map((slot) => <MediaSlotEditor key={slot.slot} slot={slot} project={project} update={update} />)}
        </div>
      )}
    </Panel>
  );
}

function MediaSlotEditor({ slot, project, update }: PanelProps & { slot: MediaSlotDefinition }) {
  const entry = project.media.find((item) => item.slot === slot.slot);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const writeEntry = (patch: { src?: string; alt?: string }) =>
    update((draft) => {
      const existing = draft.media.find((item) => item.slot === slot.slot);
      if (existing) {
        return { ...draft, media: draft.media.map((item) => (item.slot === slot.slot ? { ...item, ...patch } : item)) };
      }
      return {
        ...draft,
        media: [
          ...draft.media,
          {
            id: `media-${slot.slot.replace(/[^a-zA-Z0-9]/g, '-')}`,
            slot: slot.slot,
            label: slot.label,
            note: slot.description,
            src: '',
            alt: '',
            ...patch,
          },
        ],
      };
    });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadMedia(project.id, file);
      writeEntry({ src: uploaded.url });
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-studio-line pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-studio-ink">{slot.label}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-studio-muted">{slot.description}</p>
        </div>
        <StatusPill tone={entry?.src ? 'ok' : 'warn'}>{entry?.src ? 'יש תמונה' : 'ממתין לצילום'}</StatusPill>
      </div>

      <div className="flex items-start gap-3">
        <div className="relative w-28 shrink-0 overflow-hidden rounded-md bg-studio-raised ring-1 ring-inset ring-studio-line" style={{ aspectRatio: slot.ratio }}>
          {entry?.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={entry.src} alt={entry.alt || slot.label} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-studio-muted">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="4.5" width="18" height="15" rx="2" />
                <circle cx="8.5" cy="9.5" r="1.75" />
                <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L20 21" />
              </svg>
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Off-screen on purpose: the native control renders "Choose File" in the
              browser's own language, which would put English in a Hebrew interface. */}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml,image/gif"
            onChange={(e) => void onFile(e.target.files?.[0])}
            className="sr-only"
            tabIndex={-1}
          />
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); void onFile(e.dataTransfer.files?.[0]); }}
            className={cn(
              'flex flex-wrap items-center gap-2 rounded-md border border-dashed px-3 py-2.5 transition-colors',
              dragging ? 'border-studio-accent bg-studio-accent/[0.06]' : 'border-studio-line',
            )}
          >
            <StudioButton size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? 'מעלה…' : entry?.src ? 'החלפת תמונה' : 'העלאת תמונה'}
            </StudioButton>
            <span className="text-xs text-studio-muted">או גררו לכאן קובץ</span>
          </div>
          <p className="text-xs text-studio-muted">עד 8MB · JPG, PNG, WebP, AVIF, SVG או GIF</p>

          {entry?.src && (
            <>
              <TextInput value={entry.alt} placeholder="תיאור התמונה לקוראי מסך" onChange={(e) => writeEntry({ alt: e.target.value })} />
              <button
                type="button"
                onClick={() => writeEntry({ src: '', alt: '' })}
                className="self-start rounded px-2 py-1 text-xs font-semibold text-studio-muted transition-colors hover:bg-studio-raised hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent dark:hover:text-red-400"
              >
                הסרת התמונה
              </button>
            </>
          )}
          {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
