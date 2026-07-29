'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import {
  ADDABLE_SECTION_TYPES,
  SECTION_LABELS,
  sectionFromPreset,
  type SectionInstance,
  type SectionPreset,
  type SectionType,
} from '@segevision/renderer';
import { presetStore } from '../lib/presets';
import { VariantMini } from './variant-picker';
import { GroupLabel, StudioButton } from './studio';

/** Short "what is this for" line per type — the add flow should not assume vocabulary. */
const PURPOSE: Partial<Record<SectionType, string>> = {
  hero: 'המסך הראשון שרואים',
  trust: 'שלוש עובדות שבונות אמון',
  services: 'מה אתם מציעים',
  process: 'איך העבודה מתנהלת',
  features: 'למה דווקא אתכם',
  team: 'מי האנשים',
  faq: 'שאלות שחוזרות',
  contact: 'איך מגיעים ואיך יוצרים קשר',
  appointment: 'טופס לפניות',
};

export function AddSectionPanel({
  onAdd,
  onInsertPreset,
}: {
  onAdd: (type: SectionType) => void;
  onInsertPreset: (section: SectionInstance) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [presets, setPresets] = React.useState<SectionPreset[]>([]);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) setPresets(presetStore.list());
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <StudioButton
        size="sm"
        variant="subtle"
        className="w-full justify-center"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        הוספת סקשן
      </StudioButton>

      {open && (
        <div className="studio-pop studio-scroll absolute z-50 mt-1.5 max-h-[24rem] w-[19rem] overflow-y-auto rounded-xl bg-studio-panel p-2 shadow-studio-lg ring-1 ring-studio-line">
          <GroupLabel className="px-1.5 pb-1">סקשנים</GroupLabel>
          <ul className="grid grid-cols-2 gap-1.5">
            {ADDABLE_SECTION_TYPES.map((type) => (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); onAdd(type); }}
                  className="flex w-full flex-col gap-1 rounded-lg p-1.5 text-start transition-colors duration-[var(--t-state)] hover:bg-studio-raised"
                >
                  <span className="block h-12 overflow-hidden rounded-md ring-1 ring-inset ring-studio-line">
                    <VariantMini type={type} variant="default" />
                  </span>
                  <span className="block text-ui-sm font-semibold text-studio-ink">{SECTION_LABELS[type]}</span>
                  <span className="block text-ui-label leading-snug text-studio-faint">{PURPOSE[type]}</span>
                </button>
              </li>
            ))}
          </ul>

          {presets.length > 0 && (
            <>
              <GroupLabel className="px-1.5 pb-1 pt-3">פריסטים שמורים</GroupLabel>
              <ul className="flex flex-col gap-0.5">
                {presets.map((preset) => (
                  <li key={preset.id}>
                    <button
                      type="button"
                      onClick={() => { setOpen(false); onInsertPreset(sectionFromPreset(preset)); }}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-start text-ui-sm transition-colors hover:bg-studio-raised"
                    >
                      <span className="truncate font-medium text-studio-ink">{preset.name}</span>
                      <span className="shrink-0 text-ui-label text-studio-faint">{SECTION_LABELS[preset.type]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function PresetsPanel() {
  return null;
}
