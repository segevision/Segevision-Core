'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import {
  STATUS_LABELS,
  TEMPLATE_LABELS,
  homeSections,
  mediaSlots,
  type Project,
} from '@segevision/renderer';
import { Addressable, uid, type PanelProps } from './editor-shared';
import { EmptyNote, Field, Panel, RepeaterItem, SelectInput, StudioButton, TextInput } from './studio';

export function buildReadiness(project: Project) {
  const sections = homeSections(project);
  const hero = sections.find((section) => section.type === 'hero')?.content.hero;
  const services = sections.flatMap((section) => section.content.services ?? []);
  const faq = sections.flatMap((section) => section.content.faq ?? []);
  const appointment = sections.find((section) => section.type === 'appointment')?.content.appointment;

  return [
    { label: 'כותרת ראשית מוגדרת', ok: Boolean(hero?.headline.trim()), hint: 'ללא כותרת, אזור הפתיחה מציג את שם העסק בלבד.' },
    { label: 'קריאה לפעולה ראשית', ok: Boolean(hero?.primaryCtaLabel.trim()), hint: 'בלי כפתור ראשי אין מסלול המרה בעמוד.' },
    { label: 'טלפון הוזן', ok: project.business.phone.trim().length > 0, hint: 'מוצג באתר כ״ממתין לפרטים״.' },
    { label: 'וואטסאפ הוזן', ok: project.business.whatsapp.trim().length > 0, hint: 'כפתור הוואטסאפ לא יופיע עד שיוזן מספר.' },
    { label: 'כתובת הוזנה', ok: project.business.address.trim().length > 0, hint: 'סעיף ההגעה יישאר חלקי.' },
    { label: 'לפחות שירות אחד', ok: services.length > 0, hint: 'סקשן השירותים לא יוצג.' },
    {
      label: 'כותרת SEO ותיאור',
      ok: project.seo.title.trim().length > 0 && project.seo.description.trim().length > 0,
      hint: 'נדרש לפני עלייה לאוויר.',
    },
    { label: 'אין תשובות שממתינות לאישור', ok: faq.every((item) => !item.pending), hint: 'יש שאלות שסומנו כממתינות לאישור הלקוח.' },
    {
      label: 'כל מסגרות התמונה מולאו',
      ok: mediaSlots(project).every((slot) => {
        const entry = project.media.find((item) => item.slot === slot.slot);
        return Boolean(entry && entry.src.trim());
      }),
      hint: 'חלק מהמסגרות עדיין מציגות מציין מקום במקום צילום אמיתי.',
    },
    { label: 'יעד לטופס הפנייה', ok: Boolean(appointment?.destination.trim()), hint: 'הטופס פועל במצב הדגמה.' },
  ];
}

export function OverviewPanel({ project, update }: PanelProps) {
  const checks = buildReadiness(project);
  const done = checks.filter((check) => check.ok).length;

  const setBusiness = (patch: Partial<Project['business']>, coalesceKey?: string) =>
    update((draft) => ({ ...draft, business: { ...draft.business, ...patch } }), { coalesceKey });

  return (
    <div className="flex flex-col gap-8">
      <Panel title="פרטי הפרויקט" description="שם ומזהה משמשים בלוח הפרויקטים ובכתובת האתר.">
        <div className="grid gap-5 tablet:grid-cols-2">
          <Field label="שם הפרויקט">
            <TextInput
              value={project.name}
              onChange={(event) => update((draft) => ({ ...draft, name: event.target.value }), { coalesceKey: 'name' })}
            />
          </Field>
          <Field label="ענף">
            <TextInput
              value={project.industry}
              onChange={(event) => update((draft) => ({ ...draft, industry: event.target.value }), { coalesceKey: 'industry' })}
            />
          </Field>
          <Field label="מזהה לכתובת">
            <TextInput
              value={project.slug}
              dir="ltr"
              className="text-start font-studio-mono text-sm"
              onChange={(event) =>
                update((draft) => ({ ...draft, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }), {
                  coalesceKey: 'slug',
                })
              }
            />
          </Field>
          <Field label="סטטוס">
            <SelectInput
              value={project.status}
              onChange={(event) => update((draft) => ({ ...draft, status: event.target.value as Project['status'] }))}
            >
              {(Object.keys(STATUS_LABELS) as Project['status'][]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <dl className="mt-2 grid gap-x-6 gap-y-2 border-t border-studio-line pt-4 text-sm tablet:grid-cols-2">
          <div className="flex justify-between gap-3">
            <dt className="text-studio-muted">תבנית</dt>
            <dd className="font-semibold">{TEMPLATE_LABELS[project.template]}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-studio-muted">שפה וכיוון</dt>
            <dd className="font-semibold">
              {project.language === 'he' ? 'עברית' : 'אנגלית'} · {project.direction.toUpperCase()}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel title="פרטי העסק" description="הפרטים האלה מזינים את הכותרת, אזור הפתיחה, יצירת הקשר והתחתית.">
        <div className="grid gap-5 tablet:grid-cols-2">
          <Field label="שם תצוגה">
            <TextInput value={project.business.displayName} onChange={(e) => setBusiness({ displayName: e.target.value }, 'dn')} />
          </Field>
          <Field label="תת־כותרת" hint="משפט קצר שמופיע ליד הלוגו.">
            <TextInput value={project.business.tagline} onChange={(e) => setBusiness({ tagline: e.target.value }, 'tg')} />
          </Field>
          <Field label="שנת הקמה">
            <TextInput
              value={project.business.foundedYear}
              dir="ltr"
              className="text-start"
              onChange={(e) => setBusiness({ foundedYear: e.target.value }, 'fy')}
            />
          </Field>
          <Field label="יישוב">
            <TextInput value={project.business.location} onChange={(e) => setBusiness({ location: e.target.value }, 'loc')} />
          </Field>
          <Addressable path="business.phone">
            <Field label="טלפון">
              <TextInput
                value={project.business.phone}
                dir="ltr"
                className="text-start"
                onChange={(e) => setBusiness({ phone: e.target.value }, 'ph')}
              />
            </Field>
          </Addressable>
          <Field label="וואטסאפ">
            <TextInput
              value={project.business.whatsapp}
              dir="ltr"
              className="text-start"
              onChange={(e) => setBusiness({ whatsapp: e.target.value }, 'wa')}
            />
          </Field>
          <Addressable path="business.email">
            <Field label="דוא״ל">
              <TextInput
                value={project.business.email}
                dir="ltr"
                className="text-start"
                onChange={(e) => setBusiness({ email: e.target.value }, 'em')}
              />
            </Field>
          </Addressable>
          <Addressable path="business.address">
            <Field label="כתובת מלאה">
              <TextInput value={project.business.address} onChange={(e) => setBusiness({ address: e.target.value }, 'ad')} />
            </Field>
          </Addressable>
        </div>
      </Panel>

      <Panel
        title="שעות פעילות"
        action={
          <StudioButton
            size="sm"
            onClick={() =>
              update((draft) => ({
                ...draft,
                business: { ...draft.business, hours: [...draft.business.hours, { id: uid('h'), days: '', hours: '' }] },
              }))
            }
          >
            הוספת שורה
          </StudioButton>
        }
      >
        {project.business.hours.length === 0 ? (
          <EmptyNote>עוד לא הוגדרו שעות פעילות.</EmptyNote>
        ) : (
          <div className="flex flex-col">
            {project.business.hours.map((row, index) => (
              <RepeaterItem
                key={row.id}
                title={`שורה ${index + 1}`}
                onRemove={() =>
                  update((draft) => ({
                    ...draft,
                    business: { ...draft.business, hours: draft.business.hours.filter((item) => item.id !== row.id) },
                  }))
                }
              >
                <div className="grid gap-3 tablet:grid-cols-2">
                  <TextInput
                    value={row.days}
                    placeholder="ראשון – חמישי"
                    onChange={(e) =>
                      update(
                        (draft) => ({
                          ...draft,
                          business: {
                            ...draft.business,
                            hours: draft.business.hours.map((item) => (item.id === row.id ? { ...item, days: e.target.value } : item)),
                          },
                        }),
                        { coalesceKey: `hd-${row.id}` },
                      )
                    }
                  />
                  <TextInput
                    value={row.hours}
                    placeholder="08:00 – 19:00"
                    onChange={(e) =>
                      update(
                        (draft) => ({
                          ...draft,
                          business: {
                            ...draft.business,
                            hours: draft.business.hours.map((item) => (item.id === row.id ? { ...item, hours: e.target.value } : item)),
                          },
                        }),
                        { coalesceKey: `ht-${row.id}` },
                      )
                    }
                  />
                </div>
              </RepeaterItem>
            ))}
          </div>
        )}
        <Field label="הערה לשעות">
          <TextInput value={project.business.hoursNote} onChange={(e) => setBusiness({ hoursNote: e.target.value }, 'hn')} />
        </Field>
      </Panel>

      <Panel title="מוכנות לפרסום" description={`${done} מתוך ${checks.length} בדיקות עברו.`}>
        <ul className="flex flex-col">
          {checks.map((check) => (
            <li key={check.label} className="flex items-start gap-3 border-b border-studio-line py-3 last:border-b-0">
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  check.ok ? 'bg-studio-ok/15 text-studio-ok' : 'bg-studio-warn/15 text-studio-warn',
                )}
              >
                {check.ok ? '✓' : '!'}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-studio-ink">{check.label}</span>
                {!check.ok && <span className="block text-sm text-studio-muted">{check.hint}</span>}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
