'use client';

import * as React from 'react';
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
import { Popover } from './floating';

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

/**
 * The add-section picker.
 *
 * Previously an `absolute` panel with a hard `max-h-[24rem]`. It lives inside the editor's
 * scrolling structure rail, so it was clipped by that rail long before it ever reached the
 * viewport edge, and on a short window the fixed max-height cut the list off with no way to
 * reach the rest. It now portals out and lets the floating layer measure the space that is
 * actually available.
 */
export function AddSectionPanel({
  onAdd,
  onInsertPreset,
}: {
  onAdd: (type: SectionType) => void;
  onInsertPreset: (section: SectionInstance) => void;
}) {
  const [presets, setPresets] = React.useState<SectionPreset[]>([]);

  return (
    <Popover
      label="הוספת סקשן"
      placement="bottom"
      className="w-[min(19rem,calc(100vw-1.5rem))] p-2"
      onOpenChange={(open) => {
        if (open) setPresets(presetStore.list());
      }}
      trigger={({ ref, open, props }) => (
        <StudioButton
          ref={ref as React.Ref<HTMLButtonElement>}
          size="sm"
          variant="subtle"
          className="w-full justify-center"
          aria-expanded={open}
          aria-haspopup="dialog"
          {...props}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          הוספת סקשן
        </StudioButton>
      )}
    >
      {(close) => (
        <>
          <GroupLabel className="px-1.5 pb-1">סקשנים</GroupLabel>
          <ul className="grid grid-cols-2 gap-1.5">
            {ADDABLE_SECTION_TYPES.map((type) => (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onAdd(type);
                  }}
                  className="flex w-full flex-col gap-1 rounded-lg p-1.5 text-start transition-colors duration-[var(--t-state)] hover:bg-studio-raised focus-visible:bg-studio-raised"
                >
                  <span className="block h-12 overflow-hidden rounded-md ring-1 ring-inset ring-studio-line">
                    <VariantMini type={type} variant="default" />
                  </span>
                  <span className="block text-ui-sm font-semibold text-studio-ink">
                    {SECTION_LABELS[type]}
                  </span>
                  <span className="block text-ui-label leading-snug text-studio-faint">
                    {PURPOSE[type]}
                  </span>
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
                      onClick={() => {
                        close();
                        onInsertPreset(sectionFromPreset(preset));
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-start text-ui-sm transition-colors hover:bg-studio-raised focus-visible:bg-studio-raised"
                    >
                      <span className="truncate font-medium text-studio-ink">{preset.name}</span>
                      <span className="shrink-0 text-ui-label text-studio-faint">
                        {SECTION_LABELS[preset.type]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </Popover>
  );
}

export function PresetsPanel() {
  return null;
}
