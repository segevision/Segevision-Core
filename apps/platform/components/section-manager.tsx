'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import {
  ADDABLE_SECTION_TYPES,
  SECTION_LABELS,
  createSection,
  createPreset,
  duplicateSection,
  homePage,
  homeSections,
  insertAfter,
  moveSection,
  removeSection,
  reorder,
  sectionFromPreset,
  variantsFor,
  type Project,
  type SectionInstance,
  type SectionPreset,
  type SectionType,
} from '@segevision/renderer';
import { TEMPLATE_LIST } from '@segevision/templates';
import { presetStore } from '../lib/presets';
import type { PanelProps } from './editor-shared';
import { EmptyNote, Field, Panel, SelectInput, StatusPill, StudioButton, TextInput } from './studio';
import { sectionDisplayName } from './panel-content';

/** Replaces the home page's section list, keeping order in sync. */
function withSections(project: Project, sections: SectionInstance[]): Project {
  const home = homePage(project);
  if (!home) return project;
  return {
    ...project,
    pages: project.pages.map((page) => (page.id === home.id ? { ...page, sections: reorder(sections) } : page)),
  };
}

/** The template's original content for one section type, used by "reset". */
function templateContentFor(project: Project, type: SectionType) {
  const template = TEMPLATE_LIST.find((item) => item.id === project.template) ?? TEMPLATE_LIST[0];
  const fresh = template.buildContent(project.business.displayName || project.name);
  switch (type) {
    case 'hero': return { hero: fresh.hero };
    case 'trust': return { trustPoints: fresh.trustPoints };
    case 'services': return { heading: fresh.servicesHeading, services: fresh.services };
    case 'process': return { heading: fresh.processHeading, process: fresh.process };
    case 'features': return { heading: fresh.featuresHeading, features: fresh.features };
    case 'team': return { heading: fresh.teamHeading, team: fresh.team };
    case 'faq': return { heading: fresh.faqHeading, faq: fresh.faq };
    case 'contact': return { heading: fresh.contactHeading };
    case 'footer': return { footer: fresh.footer };
    default: return {};
  }
}

export function SectionManagerPanel({
  project,
  update,
  onEditSection,
}: PanelProps & { onEditSection?: (sectionId: string) => void }) {
  const sections = homeSections(project);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
  const [presetFor, setPresetFor] = React.useState<string | null>(null);
  const [presetName, setPresetName] = React.useState('');
  const [presets, setPresets] = React.useState<SectionPreset[]>([]);
  const [addType, setAddType] = React.useState<SectionType>('services');

  React.useEffect(() => setPresets(presetStore.list()), []);

  const apply = (recipe: (list: SectionInstance[]) => SectionInstance[]) =>
    update((draft) => withSections(draft, recipe(homeSections(draft))));

  return (
    <div className="flex flex-col gap-8">
      <Panel
        title="סקשנים בעמוד הבית"
        description="הסדר כאן הוא הסדר באתר. כל סקשן מחזיק תוכן משלו — שכפול יוצר עותק עצמאי לחלוטין."
      >
        <ul className="flex flex-col">
          {sections.map((section, index) => {
            const variants = variantsFor(section.type);
            const confirming = confirmingId === section.id;
            const savingPreset = presetFor === section.id;

            return (
              <li key={section.id} className="border-b border-studio-line py-4 last:border-b-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="font-studio-mono text-xs tabular-nums text-studio-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={cn('flex-1 text-sm font-semibold', section.enabled ? 'text-studio-ink' : 'text-studio-muted line-through')}>
                    {sectionDisplayName(section, sections)}
                  </span>
                  {section.presetId && <StatusPill>מפריסט</StatusPill>}

                  <span className="inline-flex">
                    {[
                      { offset: -1, label: 'הזזה למעלה', disabled: index === 0, path: 'm18 15-6-6-6 6' },
                      { offset: 1, label: 'הזזה למטה', disabled: index === sections.length - 1, path: 'm6 9 6 6 6-6' },
                    ].map((button) => (
                      <button
                        key={button.label}
                        type="button"
                        aria-label={`${button.label} — ${SECTION_LABELS[section.type]}`}
                        disabled={button.disabled}
                        onClick={() => apply((list) => moveSection(list, section.id, button.offset))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-studio-muted transition-colors hover:bg-studio-raised hover:text-studio-ink disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d={button.path} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ))}
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={section.enabled}
                    aria-label={`${section.enabled ? 'כיבוי' : 'הפעלת'} ${SECTION_LABELS[section.type]}`}
                    onClick={() =>
                      apply((list) => list.map((item) => (item.id === section.id ? { ...item, enabled: !item.enabled } : item)))
                    }
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent focus-visible:ring-offset-2 focus-visible:ring-offset-studio-panel',
                      section.enabled ? 'bg-studio-accent' : 'bg-studio-line',
                    )}
                  >
                    <span aria-hidden="true" className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition-all', section.enabled ? 'end-1' : 'end-6')} />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 ps-8">
                  {variants.length > 1 && (
                    <label className="flex items-center gap-2 text-xs text-studio-muted">
                      וריאנט
                      <SelectInput
                        value={section.variant}
                        aria-label={`וריאנט עבור ${SECTION_LABELS[section.type]}`}
                        className="h-8 w-auto min-w-[9rem] text-xs"
                        onChange={(e) =>
                          apply((list) => list.map((item) => (item.id === section.id ? { ...item, variant: e.target.value } : item)))
                        }
                      >
                        {variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>{variant.label}</option>
                        ))}
                      </SelectInput>
                    </label>
                  )}

                  {onEditSection && (
                    <StudioButton size="sm" onClick={() => onEditSection(section.id)}>עריכת תוכן</StudioButton>
                  )}
                  <StudioButton
                    size="sm"
                    onClick={() => apply((list) => insertAfter(list, section.id, duplicateSection(section)))}
                  >
                    שכפול
                  </StudioButton>
                  <StudioButton
                    size="sm"
                    onClick={() =>
                      apply((list) =>
                        list.map((item) =>
                          item.id === section.id ? { ...item, content: templateContentFor(project, item.type) } : item,
                        ),
                      )
                    }
                  >
                    איפוס
                  </StudioButton>
                  <StudioButton size="sm" onClick={() => { setPresetFor(section.id); setPresetName(SECTION_LABELS[section.type]); }}>
                    שמירה כפריסט
                  </StudioButton>

                  {confirming ? (
                    <span className="flex items-center gap-2 rounded-md bg-studio-raised px-2 py-1">
                      <span className="text-xs font-semibold text-studio-ink">למחוק את הסקשן?</span>
                      <StudioButton
                        size="sm"
                        variant="danger"
                        onClick={() => { apply((list) => removeSection(list, section.id)); setConfirmingId(null); }}
                      >
                        מחיקה
                      </StudioButton>
                      <StudioButton size="sm" variant="ghost" onClick={() => setConfirmingId(null)}>ביטול</StudioButton>
                    </span>
                  ) : (
                    <StudioButton size="sm" variant="ghost" onClick={() => setConfirmingId(section.id)}>מחיקה</StudioButton>
                  )}
                </div>

                {savingPreset && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 rounded-md bg-studio-raised p-3 ps-8">
                    <Field label="שם הפריסט" className="min-w-[12rem] flex-1">
                      <TextInput value={presetName} onChange={(e) => setPresetName(e.target.value)} autoFocus />
                    </Field>
                    <StudioButton
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const preset = createPreset(section, presetName.trim() || SECTION_LABELS[section.type], {
                          primaryColor: project.design.primaryColor,
                          secondaryColor: project.design.secondaryColor,
                          radius: project.design.radius,
                        });
                        presetStore.save(preset);
                        setPresets(presetStore.list());
                        setPresetFor(null);
                      }}
                    >
                      שמירה
                    </StudioButton>
                    <StudioButton size="sm" variant="ghost" onClick={() => setPresetFor(null)}>ביטול</StudioButton>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="הוספת סקשן">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="סוג" className="min-w-[12rem] flex-1">
            <SelectInput value={addType} onChange={(e) => setAddType(e.target.value as SectionType)}>
              {ADDABLE_SECTION_TYPES.map((type) => (
                <option key={type} value={type}>{SECTION_LABELS[type]}</option>
              ))}
            </SelectInput>
          </Field>
          <StudioButton
            variant="primary"
            onClick={() => apply((list) => [...list, createSection(addType, templateContentFor(project, addType))])}
          >
            הוספה לסוף העמוד
          </StudioButton>
        </div>
      </Panel>

      <Panel
        title="פריסטים שמורים"
        description="פריסט הוא תצלום מצב. הוספה שלו יוצרת סקשן עצמאי חדש שאינו מקושר לפריסט המקורי."
      >
        {presets.length === 0 ? (
          <EmptyNote>עוד לא נשמרו פריסטים. אפשר לשמור כל סקשן כפריסט ולהשתמש בו בפרויקטים אחרים.</EmptyNote>
        ) : (
          <ul className="flex flex-col">
            {presets.map((preset) => (
              <li key={preset.id} className="flex flex-wrap items-center gap-3 border-b border-studio-line py-3 last:border-b-0">
                <span className="flex-1 text-sm font-semibold text-studio-ink">{preset.name}</span>
                <span className="text-xs text-studio-muted">{SECTION_LABELS[preset.type]}</span>
                <StudioButton size="sm" onClick={() => apply((list) => [...list, sectionFromPreset(preset)])}>הוספה</StudioButton>
                <StudioButton
                  size="sm"
                  variant="ghost"
                  onClick={() => { presetStore.remove(preset.id); setPresets(presetStore.list()); }}
                >
                  הסרה
                </StudioButton>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
