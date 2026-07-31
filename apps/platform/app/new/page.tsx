'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@segevision/utils';
import {
  SECTION_LABELS,
  THEME_PRESET_LABELS,
  variantsFor,
  type Project,
  type TemplateId,
  type ThemePreset,
} from '@segevision/renderer';
import { TEMPLATE_LIST, createProjectFromTemplate } from '@segevision/templates';
import { createProject } from '../../lib/client';
import { slugify } from '../../lib/format';
import { Field, GroupLabel, StudioButton, TextInput, SelectInput } from '../../components/studio';
import { ThemeToggle } from '../../components/theme-toggle';
import { SignOutButton } from '../../components/sign-out-button';
import { VariantMini } from '../../components/variant-picker';

/** Palette per preset, mirrored from the template defaults so the swatch is truthful. */
const THEME_SWATCHES: Partial<Record<ThemePreset, [string, string]>> = {
  medical: ['#12545C', '#8FA33F'],
  corporate: ['#1E3A5F', '#B08D57'],
  restaurant: ['#8A3B24', '#4F6B3A'],
  luxury: ['#1F1F1F', '#B8912F'],
  fitness: ['#E0521A', '#1A1A1A'],
  hotel: ['#2F5F63', '#C79A5B'],
  legal: ['#1E3D2F', '#A78A4E'],
  construction: ['#D18521', '#4A5259'],
  technology: ['#6B4EE6', '#111111'],
};

const STEPS = [
  { id: 'business', label: 'העסק', why: 'השם מופיע בכותרת, בכתובת ובקרדיט התחתון.' },
  { id: 'template', label: 'תבנית', why: 'התבנית קובעת אילו סקשנים יש בעמוד ובאיזה סדר. הכול ניתן לשינוי אחר כך.' },
  { id: 'look', label: 'שפה ומראה', why: 'ברירת המחדל היא עברית ו‑RTL. אפשר להחליף ערכת צבע בכל רגע בעורך.' },
  { id: 'contact', label: 'פרטי קשר', why: 'כל פרט שחסר מוצג באתר עם סימון גלוי, במקום ערך מומצא.' },
  { id: 'summary', label: 'סיכום', why: 'בדיקה אחרונה לפני שהפרויקט נוצר.' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [industry, setIndustry] = React.useState('');
  const [template, setTemplate] = React.useState<TemplateId>('medical');
  const [language, setLanguage] = React.useState<Project['language']>('he');
  const [direction, setDirection] = React.useState<Project['direction']>('rtl');
  const [theme, setTheme] = React.useState<ThemePreset | ''>('');
  const [phone, setPhone] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [location, setLocation] = React.useState('');

  const current = STEPS[step];
  const currentTemplate = TEMPLATE_LIST.find((item) => item.id === template) ?? TEMPLATE_LIST[0];
  const effectiveTheme = (theme || currentTemplate.theme) as ThemePreset;
  const canAdvance = current.id === 'business' ? name.trim().length > 1 && slug.trim().length > 0 : true;

  const updateName = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const draft = createProjectFromTemplate({
        name: name.trim(), slug: slug.trim(), industry: industry.trim(), template,
        language, direction, theme: theme || undefined,
        phone: phone.trim(), whatsapp: whatsapp.trim(), email: email.trim(),
        location: location.trim(), address: location.trim(),
      });
      const created = await createProject(draft);
      router.push(`/projects/${created.id}`);
    } catch (cause) {
      setError((cause as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-studio-line bg-studio-panel">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-5 py-3">
          <Link href="/" className="inline-flex items-center gap-2 text-ui-sm font-semibold text-studio-soft transition-colors hover:text-studio-ink">
            <svg viewBox="0 0 24 24" className="h-4 w-4 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <path d="M19 12H5m6 6-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            חזרה לפרויקטים
          </Link>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-5 py-8 desktop:py-12">
        <h1 className="text-ui-3xl font-extrabold tracking-tight text-studio-ink">פרויקט חדש</h1>

        {/* Stepper: numbered, with a rail that fills right-to-left in reading direction. */}
        <ol className="mt-7 flex items-start gap-1.5" aria-label="שלבי יצירת הפרויקט">
          {STEPS.map((item, index) => {
            const state = index < step ? 'done' : index === step ? 'current' : 'todo';
            return (
              <li key={item.id} className="flex flex-1 flex-col gap-2">
                <span className={cn('h-1 rounded-full transition-colors duration-[var(--t-move)]', state === 'todo' ? 'bg-studio-line' : 'bg-studio-accent')} />
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-studio-mono text-[10px] font-bold transition-colors duration-[var(--t-move)]',
                      state === 'done' ? 'bg-studio-accent text-studio-accent-ink' : state === 'current' ? 'bg-studio-accent-soft text-studio-accent ring-1 ring-studio-accent' : 'bg-studio-sunken text-studio-faint',
                    )}
                    dir="ltr"
                  >
                    {state === 'done' ? '✓' : index + 1}
                  </span>
                  <span className={cn('hidden truncate text-ui-xs font-semibold tablet:block', state === 'current' ? 'text-studio-ink' : 'text-studio-faint')}>
                    {item.label}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 grid gap-6 desktop:grid-cols-[1fr_20rem] desktop:gap-10">
          <div key={current.id} className="studio-enter min-h-[24rem]">
            {current.id === 'business' && (
              <div className="flex flex-col gap-5">
                <Field label="שם העסק" hint="השם שיופיע באתר ובכותרת העליונה.">
                  <TextInput value={name} onChange={(e) => updateName(e.target.value)} placeholder="לדוגמה: פיזיותלטיקס" autoFocus />
                </Field>
                <div className="grid gap-5 tablet:grid-cols-2">
                  <Field label="ענף" hint="לזיהוי מהיר בלוח הפרויקטים.">
                    <TextInput value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="לדוגמה: פיזיותרפיה" />
                  </Field>
                  <Field label="מזהה לכתובת" hint="אותיות לטיניות קטנות, ספרות ומקפים.">
                    <TextInput
                      value={slug}
                      dir="ltr"
                      className="text-start font-studio-mono text-ui-sm"
                      onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }}
                      placeholder="physiothletics"
                    />
                  </Field>
                </div>
              </div>
            )}

            {current.id === 'template' && (
              <div className="flex flex-col gap-2.5">
                {TEMPLATE_LIST.map((item) => {
                  const active = item.id === template;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTemplate(item.id)}
                      aria-pressed={active}
                      className={cn(
                        'flex gap-4 rounded-xl p-4 text-start transition-[background-color,box-shadow] duration-[var(--t-state)] ease-studio',
                        active ? 'bg-studio-accent-soft ring-2 ring-studio-accent' : 'bg-studio-panel ring-1 ring-studio-line hover:ring-studio-line-strong',
                      )}
                    >
                      <span className="hidden h-20 w-28 shrink-0 flex-col gap-1 overflow-hidden rounded-lg bg-studio-sunken p-1.5 ring-1 ring-inset ring-studio-line tablet:flex">
                        {item.sections.filter((t) => !['header', 'footer', 'mobileBar'].includes(t)).slice(0, 4).map((type, i) => (
                          <span key={i} className="block h-4 flex-1 overflow-hidden rounded-sm">
                            {/* The template's own first variant, so the three templates
                                actually look different from one another here. */}
                            <VariantMini type={type} variant={variantsFor(type)[0]?.id ?? 'default'} />
                          </span>
                        ))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={cn('text-ui-base font-bold', active ? 'text-studio-accent' : 'text-studio-ink')}>{item.label}</span>
                          <span className="text-ui-label text-studio-faint">{item.sections.length} סקשנים</span>
                        </span>
                        <span className="mt-1 block text-ui-sm leading-relaxed text-studio-muted">{item.description}</span>
                        <span className="mt-2.5 flex flex-wrap gap-1">
                          {item.sections.filter((t) => !['header', 'footer', 'mobileBar'].includes(t)).slice(0, 6).map((type) => (
                            <span key={type} className="rounded-full bg-studio-sunken px-2 py-0.5 text-ui-label text-studio-muted">{SECTION_LABELS[type]}</span>
                          ))}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {current.id === 'look' && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-5 tablet:grid-cols-2">
                  <Field label="שפה ראשית">
                    <SelectInput
                      value={language}
                      onChange={(e) => {
                        const next = e.target.value as Project['language'];
                        setLanguage(next);
                        setDirection(next === 'he' ? 'rtl' : 'ltr');
                      }}
                    >
                      <option value="he">עברית</option>
                      <option value="en">אנגלית</option>
                    </SelectInput>
                  </Field>
                  <Field label="כיוון כתיבה" hint="נקבע אוטומטית לפי השפה.">
                    <SelectInput value={direction} onChange={(e) => setDirection(e.target.value as Project['direction'])}>
                      <option value="rtl">מימין לשמאל</option>
                      <option value="ltr">משמאל לימין</option>
                    </SelectInput>
                  </Field>
                </div>

                <div>
                  <GroupLabel>ערכת צבע</GroupLabel>
                  <div role="radiogroup" aria-label="ערכת צבע" className="mt-2 grid grid-cols-2 gap-2 tablet:grid-cols-3">
                    {(Object.keys(THEME_PRESET_LABELS) as ThemePreset[]).map((preset) => {
                      const active = effectiveTheme === preset;
                      const swatch = THEME_SWATCHES[preset] ?? ['#334155', '#94A3B8'];
                      return (
                        <button
                          key={preset}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setTheme(preset)}
                          className={cn(
                            'flex items-center gap-2.5 rounded-lg p-2.5 text-start transition-[background-color,box-shadow] duration-[var(--t-state)]',
                            active ? 'bg-studio-accent-soft ring-2 ring-studio-accent' : 'bg-studio-panel ring-1 ring-studio-line hover:ring-studio-line-strong',
                          )}
                        >
                          <span className="flex shrink-0 overflow-hidden rounded-md ring-1 ring-inset ring-black/10">
                            <span className="block h-7 w-4" style={{ background: swatch[0] }} />
                            <span className="block h-7 w-4" style={{ background: swatch[1] }} />
                          </span>
                          <span className="min-w-0">
                            <span className={cn('block truncate text-ui-sm font-semibold', active ? 'text-studio-accent' : 'text-studio-ink')}>
                              {THEME_PRESET_LABELS[preset]}
                            </span>
                            {preset === currentTemplate.theme && <span className="block text-ui-label text-studio-faint">ברירת מחדל לתבנית</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {current.id === 'contact' && (
              <div className="grid gap-5 tablet:grid-cols-2">
                <Field label="טלפון"><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="text-start" placeholder="04-0000000" /></Field>
                <Field label="וואטסאפ" hint="מספר נייד לשליחת הודעות."><TextInput value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} dir="ltr" className="text-start" placeholder="050-0000000" /></Field>
                <Field label="דוא״ל"><TextInput value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="text-start" type="email" placeholder="info@example.co.il" /></Field>
                <Field label="יישוב או כתובת"><TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="לדוגמה: גבעת חיים איחוד" /></Field>
              </div>
            )}

            {current.id === 'summary' && (
              <div className="flex flex-col gap-4">
                <p className="text-ui-base text-studio-soft">
                  זה מה שייווצר. הכול ניתן לעריכה מיד אחר כך.
                </p>
                <dl className="overflow-hidden rounded-xl bg-studio-panel ring-1 ring-studio-line">
                  {[
                    ['שם העסק', name || '—'],
                    ['ענף', industry || 'לא הוזן'],
                    ['כתובת האתר', slug],
                    ['תבנית', `${currentTemplate.label} · ${currentTemplate.sections.length} סקשנים`],
                    ['ערכת צבע', THEME_PRESET_LABELS[effectiveTheme]],
                    ['שפה', `${language === 'he' ? 'עברית' : 'אנגלית'} · ${direction.toUpperCase()}`],
                    ['טלפון', phone || 'יסומן כממתין לפרטים'],
                    ['וואטסאפ', whatsapp || 'יסומן כממתין לפרטים'],
                    ['כתובת', location || 'יסומן כממתין לפרטים'],
                  ].map(([label, value], index) => (
                    <div key={label} className={cn('flex items-baseline justify-between gap-4 px-4 py-2.5', index > 0 && 'border-t border-studio-line')}>
                      <dt className="text-ui-sm text-studio-muted">{label}</dt>
                      <dd className={cn('text-ui-sm font-semibold', String(value).startsWith('יסומן') || value === 'לא הוזן' ? 'text-studio-warn' : 'text-studio-ink')}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Contextual side rail: why this step exists, and what the result will contain. */}
          <aside className="desktop:sticky desktop:top-8 desktop:self-start">
            <div className="rounded-xl bg-studio-panel p-4 ring-1 ring-studio-line">
              <GroupLabel>למה זה נדרש</GroupLabel>
              <p className="mt-2 text-ui-sm leading-relaxed text-studio-soft">{current.why}</p>
              {(current.id === 'template' || current.id === 'summary') && (
                <>
                  <div className="my-3 h-px bg-studio-line" />
                  <GroupLabel>מה ייבנה</GroupLabel>
                  <ul className="mt-2 flex flex-col gap-1">
                    {currentTemplate.sections.filter((t) => !['header', 'footer', 'mobileBar'].includes(t)).map((type, index) => (
                      <li key={type} className="flex items-center gap-2 text-ui-xs text-studio-muted">
                        <span className="font-studio-mono text-[10px] text-studio-faint" dir="ltr">{String(index + 1).padStart(2, '0')}</span>
                        {SECTION_LABELS[type]}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </aside>
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-studio-danger/10 px-4 py-3 text-ui-sm text-studio-danger ring-1 ring-inset ring-studio-danger/25">{error}</p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-studio-line pt-5">
          <StudioButton onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0}>הקודם</StudioButton>
          <div className="flex items-center gap-3">
            <span className="hidden text-ui-xs text-studio-faint tablet:block">שלב {step + 1} מתוך {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <StudioButton variant="primary" onClick={() => setStep((v) => v + 1)} disabled={!canAdvance}>המשך</StudioButton>
            ) : (
              <StudioButton variant="primary" onClick={submit} disabled={submitting || !name.trim()}>
                {submitting ? 'יוצר…' : 'יצירת הפרויקט'}
              </StudioButton>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
