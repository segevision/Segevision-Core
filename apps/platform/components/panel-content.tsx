'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import {
  SECTION_LABELS,
  homeSections,
  type Project,
  type SectionContent,
  type SectionInstance,
} from '@segevision/renderer';
import { Addressable, ReorderButtons, moveItem, uid, type PanelProps } from './editor-shared';
import { EmptyNote, Field, Panel, RepeaterItem, StatusPill, StudioButton, TextArea, TextInput } from './studio';

/** Applies a change to one section instance's content, stamping updatedAt. */
export function updateSectionContent(
  project: Project,
  sectionId: string,
  recipe: (content: SectionContent) => SectionContent,
): Project {
  return {
    ...project,
    pages: project.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) =>
        section.id === sectionId
          ? { ...section, content: recipe(section.content), updatedAt: new Date().toISOString() }
          : section,
      ),
    })),
  };
}

const CONTENT_TYPES = new Set([
  'hero', 'trust', 'services', 'process', 'features', 'team', 'faq', 'contact', 'appointment', 'footer',
]);

export function contentSections(project: Project): SectionInstance[] {
  return homeSections(project).filter((section) => CONTENT_TYPES.has(section.type));
}

/** Disambiguates duplicated sections in a list, e.g. "שירותים · 2". */
export function sectionDisplayName(section: SectionInstance, all: SectionInstance[]): string {
  const sameType = all.filter((item) => item.type === section.type);
  if (sameType.length < 2) return SECTION_LABELS[section.type];
  return `${SECTION_LABELS[section.type]} · ${sameType.indexOf(section) + 1}`;
}

export function ContentPanel({
  project,
  update,
  activeSectionId,
  onActiveSectionChange,
}: PanelProps & { activeSectionId?: string; onActiveSectionChange?: (id: string) => void }) {
  const sections = contentSections(project);
  const active = sections.find((section) => section.id === activeSectionId) ?? sections[0];

  if (!active) return <EmptyNote>אין סקשנים עם תוכן. אפשר להוסיף סקשן בלשונית הסקשנים.</EmptyNote>;

  const setContent = (recipe: (content: SectionContent) => SectionContent, coalesceKey?: string) =>
    update((draft) => updateSectionContent(draft, active.id, recipe), { coalesceKey });

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="בחירת סקשן לעריכה" className="flex flex-wrap gap-1.5">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onActiveSectionChange?.(section.id)}
            aria-current={section.id === active.id ? 'true' : undefined}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent',
              section.id === active.id ? 'bg-studio-ink text-studio-bg' : 'text-studio-muted hover:bg-studio-raised hover:text-studio-ink',
              !section.enabled && 'opacity-50',
            )}
          >
            {sectionDisplayName(section, sections)}
            {!section.enabled && ' · מכובה'}
          </button>
        ))}
      </nav>

      <SectionContentEditor section={active} setContent={setContent} />
    </div>
  );
}

export function SectionContentEditor({
  section,
  setContent,
}: {
  section: SectionInstance;
  setContent: (recipe: (content: SectionContent) => SectionContent, coalesceKey?: string) => void;
}) {
  const { id, type, content } = section;

  const headingFields = (
    <div className="flex flex-col gap-4 border-b border-studio-line pb-5">
      <div className="grid gap-4 tablet:grid-cols-2">
        <Field label="כותרת עליונה קטנה">
          <TextInput
            value={content.heading?.eyebrow ?? ''}
            onChange={(e) =>
              setContent((d) => ({ ...d, heading: { title: '', lead: '', ...d.heading, eyebrow: e.target.value } }), `${id}-he`)
            }
          />
        </Field>
        <Addressable sectionId={id} path="content.heading.title">
          <Field label="כותרת הסקשן">
            <TextInput
              value={content.heading?.title ?? ''}
              onChange={(e) =>
                setContent((d) => ({ ...d, heading: { eyebrow: '', lead: '', ...d.heading, title: e.target.value } }), `${id}-ht`)
              }
            />
          </Field>
        </Addressable>
      </div>
      <Field label="פסקת פתיחה לסקשן">
        <TextArea
          value={content.heading?.lead ?? ''}
          rows={2}
          onChange={(e) =>
            setContent((d) => ({ ...d, heading: { eyebrow: '', title: '', ...d.heading, lead: e.target.value } }), `${id}-hl`)
          }
        />
      </Field>
    </div>
  );

  if (type === 'hero' && content.hero) {
    const hero = content.hero;
    const setHero = (patch: Partial<typeof hero>, key: string) =>
      setContent((d) => ({ ...d, hero: { ...d.hero!, ...patch } }), `${id}-${key}`);

    return (
      <Panel title="אזור הפתיחה" description="הדבר הראשון שרואים. משפט אחד, לא פסקה.">
        <Addressable sectionId={id} path="content.hero.eyebrow">
          <Field label="כותרת עליונה קטנה">
            <TextInput value={hero.eyebrow} onChange={(e) => setHero({ eyebrow: e.target.value }, 'eb')} />
          </Field>
        </Addressable>
        <Addressable sectionId={id} path="content.hero.headline">
          <Field label="כותרת ראשית">
            <TextInput value={hero.headline} onChange={(e) => setHero({ headline: e.target.value }, 'h1')} />
          </Field>
        </Addressable>
        <Addressable sectionId={id} path="content.hero.headlineSecondary">
          <Field label="שורה שנייה" hint="מוצגת בגוון מעומעם באותה כותרת.">
            <TextInput value={hero.headlineSecondary} onChange={(e) => setHero({ headlineSecondary: e.target.value }, 'h2')} />
          </Field>
        </Addressable>
        <Addressable sectionId={id} path="content.hero.subheadline">
          <Field label="פסקת פתיחה">
            <TextArea value={hero.subheadline} rows={4} onChange={(e) => setHero({ subheadline: e.target.value }, 'sub')} />
          </Field>
        </Addressable>
        <div className="grid gap-5 tablet:grid-cols-2">
          <Addressable sectionId={id} path="content.hero.primaryCtaLabel">
            <Field label="כפתור ראשי">
              <TextInput value={hero.primaryCtaLabel} onChange={(e) => setHero({ primaryCtaLabel: e.target.value }, 'c1')} />
            </Field>
          </Addressable>
          <Addressable sectionId={id} path="content.hero.secondaryCtaLabel">
            <Field label="כפתור משני">
              <TextInput value={hero.secondaryCtaLabel} onChange={(e) => setHero({ secondaryCtaLabel: e.target.value }, 'c2')} />
            </Field>
          </Addressable>
        </div>
        <Field label="תיאור התמונה" hint="מוצג כמציין מקום מעוצב עד שיתקבל צילום אמיתי.">
          <TextInput value={hero.mediaLabel} onChange={(e) => setHero({ mediaLabel: e.target.value }, 'ml')} />
        </Field>
      </Panel>
    );
  }

  if (type === 'trust') {
    const points = content.trustPoints ?? [];
    return (
      <Panel
        title="רצועת אמון"
        description="עובדות מאומתות בלבד. בלי מספרים שלא אושרו על ידי הלקוח."
        action={
          <StudioButton
            size="sm"
            onClick={() => setContent((d) => ({ ...d, trustPoints: [...(d.trustPoints ?? []), { id: uid('trust'), title: '', description: '' }] }))}
          >
            הוספה
          </StudioButton>
        }
      >
        {points.length === 0 ? (
          <EmptyNote>אין נקודות אמון — הרצועה לא תוצג באתר.</EmptyNote>
        ) : (
          <div className="flex flex-col">
            {points.map((point, index) => (
              <RepeaterItem
                key={point.id}
                title={`נקודה ${index + 1}`}
                onRemove={() => setContent((d) => ({ ...d, trustPoints: (d.trustPoints ?? []).filter((i) => i.id !== point.id) }))}
              >
                <Addressable sectionId={id} path={index === 0 ? 'content.trustPoints.0.title' : `tp-${point.id}`}>
                  <TextInput
                    value={point.title}
                    placeholder="כותרת קצרה"
                    onChange={(e) =>
                      setContent(
                        (d) => ({ ...d, trustPoints: (d.trustPoints ?? []).map((i) => (i.id === point.id ? { ...i, title: e.target.value } : i)) }),
                        `${id}-tp-${point.id}-t`,
                      )
                    }
                  />
                </Addressable>
                <TextArea
                  value={point.description}
                  rows={2}
                  placeholder="משפט הסבר"
                  onChange={(e) =>
                    setContent(
                      (d) => ({ ...d, trustPoints: (d.trustPoints ?? []).map((i) => (i.id === point.id ? { ...i, description: e.target.value } : i)) }),
                      `${id}-tp-${point.id}-d`,
                    )
                  }
                />
              </RepeaterItem>
            ))}
          </div>
        )}
      </Panel>
    );
  }

  if (type === 'services') {
    const services = content.services ?? [];
    return (
      <Panel
        title="שירותים"
        action={
          <StudioButton
            size="sm"
            onClick={() => setContent((d) => ({ ...d, services: [...(d.services ?? []), { id: uid('srv'), title: '', description: '', tags: [] }] }))}
          >
            הוספה
          </StudioButton>
        }
      >
        {headingFields}
        <div className="flex flex-col">
          {services.map((service, index) => (
            <RepeaterItem
              key={service.id}
              title={`שירות ${index + 1}`}
              onRemove={() => setContent((d) => ({ ...d, services: (d.services ?? []).filter((i) => i.id !== service.id) }))}
            >
              <div className="flex items-start gap-2">
                <Addressable sectionId={id} path={index === 0 ? 'content.services.0.title' : `sv-${service.id}-t`}>
                  <TextInput
                    value={service.title}
                    placeholder="שם השירות"
                    onChange={(e) =>
                      setContent(
                        (d) => ({ ...d, services: (d.services ?? []).map((i) => (i.id === service.id ? { ...i, title: e.target.value } : i)) }),
                        `${id}-sv-${service.id}-t`,
                      )
                    }
                  />
                </Addressable>
                <ReorderButtons
                  index={index}
                  length={services.length}
                  onMove={(offset) => setContent((d) => ({ ...d, services: moveItem(d.services ?? [], index, offset) }))}
                />
              </div>
              <Addressable sectionId={id} path={index === 0 ? 'content.services.0.description' : `sv-${service.id}-d`}>
                <TextArea
                  value={service.description}
                  rows={3}
                  placeholder="תיאור קצר"
                  onChange={(e) =>
                    setContent(
                      (d) => ({ ...d, services: (d.services ?? []).map((i) => (i.id === service.id ? { ...i, description: e.target.value } : i)) }),
                      `${id}-sv-${service.id}-d`,
                    )
                  }
                />
              </Addressable>
              <Field label="תגיות" hint="מופרדות בפסיק.">
                <TextInput
                  value={service.tags.join(', ')}
                  onChange={(e) =>
                    setContent(
                      (d) => ({
                        ...d,
                        services: (d.services ?? []).map((i) =>
                          i.id === service.id ? { ...i, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } : i,
                        ),
                      }),
                      `${id}-sv-${service.id}-g`,
                    )
                  }
                />
              </Field>
            </RepeaterItem>
          ))}
        </div>
      </Panel>
    );
  }

  if (type === 'process') {
    const steps = content.process ?? [];
    return (
      <Panel
        title="תהליך העבודה"
        action={
          <StudioButton
            size="sm"
            onClick={() => setContent((d) => ({ ...d, process: [...(d.process ?? []), { id: uid('step'), title: '', description: '', outcome: '' }] }))}
          >
            הוספת שלב
          </StudioButton>
        }
      >
        {headingFields}
        {steps.length === 0 ? (
          <EmptyNote>אין שלבים — הסקשן לא יוצג.</EmptyNote>
        ) : (
          <div className="flex flex-col">
            {steps.map((step, index) => (
              <RepeaterItem
                key={step.id}
                title={`שלב ${index + 1}`}
                onRemove={() => setContent((d) => ({ ...d, process: (d.process ?? []).filter((i) => i.id !== step.id) }))}
              >
                <div className="flex items-start gap-2">
                  <TextInput
                    value={step.title}
                    placeholder="שם השלב"
                    onChange={(e) =>
                      setContent((d) => ({ ...d, process: (d.process ?? []).map((i) => (i.id === step.id ? { ...i, title: e.target.value } : i)) }), `${id}-st-${step.id}-t`)
                    }
                  />
                  <ReorderButtons
                    index={index}
                    length={steps.length}
                    onMove={(offset) => setContent((d) => ({ ...d, process: moveItem(d.process ?? [], index, offset) }))}
                  />
                </div>
                <TextArea
                  value={step.description}
                  rows={2}
                  placeholder="מה קורה בשלב הזה"
                  onChange={(e) =>
                    setContent((d) => ({ ...d, process: (d.process ?? []).map((i) => (i.id === step.id ? { ...i, description: e.target.value } : i)) }), `${id}-st-${step.id}-d`)
                  }
                />
                <TextInput
                  value={step.outcome}
                  placeholder="מה יוצאים איתו"
                  onChange={(e) =>
                    setContent((d) => ({ ...d, process: (d.process ?? []).map((i) => (i.id === step.id ? { ...i, outcome: e.target.value } : i)) }), `${id}-st-${step.id}-o`)
                  }
                />
              </RepeaterItem>
            ))}
          </div>
        )}
      </Panel>
    );
  }

  if (type === 'features') {
    const features = content.features ?? [];
    return (
      <Panel
        title="למה אנחנו"
        action={
          <StudioButton size="sm" onClick={() => setContent((d) => ({ ...d, features: [...(d.features ?? []), { id: uid('feat'), title: '', description: '' }] }))}>
            הוספה
          </StudioButton>
        }
      >
        {headingFields}
        {features.length === 0 ? (
          <EmptyNote>אין נקודות בידול — הסקשן לא יוצג.</EmptyNote>
        ) : (
          <div className="flex flex-col">
            {features.map((feature, index) => (
              <RepeaterItem
                key={feature.id}
                title={`נקודה ${index + 1}`}
                onRemove={() => setContent((d) => ({ ...d, features: (d.features ?? []).filter((i) => i.id !== feature.id) }))}
              >
                <TextInput
                  value={feature.title}
                  placeholder="כותרת"
                  onChange={(e) =>
                    setContent((d) => ({ ...d, features: (d.features ?? []).map((i) => (i.id === feature.id ? { ...i, title: e.target.value } : i)) }), `${id}-ft-${feature.id}-t`)
                  }
                />
                <TextArea
                  value={feature.description}
                  rows={2}
                  placeholder="הסבר קצר"
                  onChange={(e) =>
                    setContent((d) => ({ ...d, features: (d.features ?? []).map((i) => (i.id === feature.id ? { ...i, description: e.target.value } : i)) }), `${id}-ft-${feature.id}-d`)
                  }
                />
              </RepeaterItem>
            ))}
          </div>
        )}
      </Panel>
    );
  }

  if (type === 'team') {
    const team = content.team ?? [];
    return (
      <Panel
        title="צוות"
        action={
          <StudioButton
            size="sm"
            onClick={() => setContent((d) => ({ ...d, team: [...(d.team ?? []), { id: uid('team'), name: '', role: '', bio: '', credentials: [], photoLabel: '' }] }))}
          >
            הוספת איש צוות
          </StudioButton>
        }
      >
        {headingFields}
        {team.length === 0 ? (
          <EmptyNote>אין אנשי צוות — הסקשן לא יוצג.</EmptyNote>
        ) : (
          <div className="flex flex-col">
            {team.map((member, index) => (
              <RepeaterItem
                key={member.id}
                title={`איש צוות ${index + 1}`}
                onRemove={() => setContent((d) => ({ ...d, team: (d.team ?? []).filter((i) => i.id !== member.id) }))}
              >
                <div className="grid gap-3 tablet:grid-cols-2">
                  <TextInput
                    value={member.name}
                    placeholder="שם מלא"
                    onChange={(e) =>
                      setContent((d) => ({ ...d, team: (d.team ?? []).map((i) => (i.id === member.id ? { ...i, name: e.target.value } : i)) }), `${id}-tm-${member.id}-n`)
                    }
                  />
                  <TextInput
                    value={member.role}
                    placeholder="תפקיד"
                    onChange={(e) =>
                      setContent((d) => ({ ...d, team: (d.team ?? []).map((i) => (i.id === member.id ? { ...i, role: e.target.value } : i)) }), `${id}-tm-${member.id}-r`)
                    }
                  />
                </div>
                <TextArea
                  value={member.bio}
                  rows={2}
                  placeholder="שתי שורות על הגישה המקצועית"
                  onChange={(e) =>
                    setContent((d) => ({ ...d, team: (d.team ?? []).map((i) => (i.id === member.id ? { ...i, bio: e.target.value } : i)) }), `${id}-tm-${member.id}-b`)
                  }
                />
                <Field label="הסמכות" hint="שורה לכל הסמכה.">
                  <TextArea
                    value={member.credentials.join('\n')}
                    rows={3}
                    onChange={(e) =>
                      setContent(
                        (d) => ({ ...d, team: (d.team ?? []).map((i) => (i.id === member.id ? { ...i, credentials: e.target.value.split('\n').filter(Boolean) } : i)) }),
                        `${id}-tm-${member.id}-c`,
                      )
                    }
                  />
                </Field>
              </RepeaterItem>
            ))}
          </div>
        )}
      </Panel>
    );
  }

  if (type === 'faq') {
    const faq = content.faq ?? [];
    return (
      <Panel
        title="שאלות נפוצות"
        description="תשובה שלא אושרה על ידי הלקוח מסומנת גלויות באתר."
        action={
          <StudioButton size="sm" onClick={() => setContent((d) => ({ ...d, faq: [...(d.faq ?? []), { id: uid('faq'), question: '', answer: '', pending: false }] }))}>
            הוספת שאלה
          </StudioButton>
        }
      >
        {headingFields}
        {faq.length === 0 ? (
          <EmptyNote>אין שאלות — הסקשן לא יוצג.</EmptyNote>
        ) : (
          <div className="flex flex-col">
            {faq.map((item, index) => (
              <RepeaterItem
                key={item.id}
                title={`שאלה ${index + 1}`}
                onRemove={() => setContent((d) => ({ ...d, faq: (d.faq ?? []).filter((r) => r.id !== item.id) }))}
              >
                <div className="flex items-start gap-2">
                  <Addressable sectionId={id} path={index === 0 ? 'content.faq.0.question' : `fq-${item.id}-q`}>
                    <TextInput
                      value={item.question}
                      placeholder="השאלה"
                      onChange={(e) =>
                        setContent((d) => ({ ...d, faq: (d.faq ?? []).map((r) => (r.id === item.id ? { ...r, question: e.target.value } : r)) }), `${id}-fq-${item.id}-q`)
                      }
                    />
                  </Addressable>
                  <ReorderButtons
                    index={index}
                    length={faq.length}
                    onMove={(offset) => setContent((d) => ({ ...d, faq: moveItem(d.faq ?? [], index, offset) }))}
                  />
                </div>
                <Addressable sectionId={id} path={index === 0 ? 'content.faq.0.answer' : `fq-${item.id}-a`}>
                  <TextArea
                    value={item.answer}
                    rows={3}
                    placeholder="התשובה. שורה חדשה מפרידה בין פסקאות."
                    onChange={(e) =>
                      setContent((d) => ({ ...d, faq: (d.faq ?? []).map((r) => (r.id === item.id ? { ...r, answer: e.target.value } : r)) }), `${id}-fq-${item.id}-a`)
                    }
                  />
                </Addressable>
                <label className="flex items-center gap-2 text-sm text-studio-soft">
                  <input
                    type="checkbox"
                    checked={item.pending}
                    onChange={(e) => setContent((d) => ({ ...d, faq: (d.faq ?? []).map((r) => (r.id === item.id ? { ...r, pending: e.target.checked } : r)) }))}
                    className="h-4 w-4 rounded border-studio-line text-studio-accent focus-visible:ring-studio-accent"
                  />
                  התשובה ממתינה לאישור הלקוח
                </label>
              </RepeaterItem>
            ))}
          </div>
        )}
      </Panel>
    );
  }

  if (type === 'appointment' && content.appointment) {
    const form = content.appointment;
    const setForm = (patch: Partial<typeof form>, key: string) =>
      setContent((d) => ({ ...d, appointment: { ...d.appointment!, ...patch } }), `${id}-${key}`);

    return (
      <div className="flex flex-col gap-8">
        <Panel title="טופס פנייה" description="הטופס הוא בקשה ליצירת קשר, ולא אישור אוטומטי.">
          <div className="grid gap-5 tablet:grid-cols-2">
            <Field label="כותרת עליונה קטנה">
              <TextInput value={form.eyebrow} onChange={(e) => setForm({ eyebrow: e.target.value }, 'fe')} />
            </Field>
            <Field label="כותרת">
              <TextInput value={form.title} onChange={(e) => setForm({ title: e.target.value }, 'ft')} />
            </Field>
          </div>
          <Field label="פסקת פתיחה">
            <TextArea value={form.lead} rows={2} onChange={(e) => setForm({ lead: e.target.value }, 'fl')} />
          </Field>
          <Field label="טקסט הכפתור">
            <TextInput value={form.submitLabel} onChange={(e) => setForm({ submitLabel: e.target.value }, 'fs')} />
          </Field>
        </Panel>

        <Panel title="הודעת אישור">
          <Field label="כותרת ההצלחה">
            <TextInput value={form.successTitle} onChange={(e) => setForm({ successTitle: e.target.value }, 'st')} />
          </Field>
          <Field label="גוף ההודעה">
            <TextArea value={form.successBody} rows={3} onChange={(e) => setForm({ successBody: e.target.value }, 'sb')} />
          </Field>
          <Field label="הבהרה מתחת לכפתור">
            <TextArea value={form.disclaimer} rows={2} onChange={(e) => setForm({ disclaimer: e.target.value }, 'dc')} />
          </Field>
        </Panel>

        <Panel title="הבטחות למבקר" description="שורה לכל הבטחה.">
          <TextArea
            value={form.assurances.join('\n')}
            rows={4}
            onChange={(e) => setForm({ assurances: e.target.value.split('\n').filter(Boolean) }, 'as')}
          />
        </Panel>

        <Panel title="יעד שליחה" description="כל עוד היעד ריק, הטופס פועל במצב הדגמה ואומר זאת למבקר.">
          <Field label="כתובת דוא״ל או Webhook">
            <TextInput
              value={form.destination}
              dir="ltr"
              className="text-start font-studio-mono text-sm"
              placeholder="info@example.co.il"
              onChange={(e) => setForm({ destination: e.target.value }, 'ds')}
            />
          </Field>
          <StatusPill tone={form.destination ? 'ok' : 'warn'}>
            {form.destination ? 'מחובר ליעד' : 'מצב הדגמה — הפניות לא נשלחות'}
          </StatusPill>
        </Panel>
      </div>
    );
  }

  if (type === 'footer' && content.footer) {
    const footer = content.footer;
    const setFooter = (patch: Partial<typeof footer>, key: string) =>
      setContent((d) => ({ ...d, footer: { ...d.footer!, ...patch } }), `${id}-${key}`);

    return (
      <Panel title="כותרת תחתונה">
        <Field label="תיאור קצר">
          <TextArea value={footer.description} rows={3} onChange={(e) => setFooter({ description: e.target.value }, 'fd')} />
        </Field>
        <Field label="שורת זכויות" hint="ריק — ותיווצר שורה אוטומטית עם שם העסק והשנה.">
          <TextInput value={footer.copyright} onChange={(e) => setFooter({ copyright: e.target.value }, 'fc')} />
        </Field>
      </Panel>
    );
  }

  return (
    <Panel title={SECTION_LABELS[type]} description="פרטי הקשר עצמם נמצאים בלשונית הסקירה.">
      {headingFields}
    </Panel>
  );
}
