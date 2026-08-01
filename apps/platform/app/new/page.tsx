'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@segevision/utils';
import type { Project } from '@segevision/renderer';
import { createProjectFromTemplate } from '@segevision/templates';
import { createProject } from '../../lib/client';
import { slugify } from '../../lib/format';
import {
  ARCHETYPES,
  MODES,
  STYLES,
  archetypeById,
  archetypesFor,
  defaultStyleFor,
  goalById,
  goalsForMode,
  modeById,
  recommendedArchetype,
  siteTypeById,
  siteTypesForGoal,
  styleById,
  type Archetype,
  type BusinessGoal,
  type ProjectMode,
  type SiteType,
  type StyleSystem,
} from '../../lib/wizard/catalog';
import { Field, StudioButton, TextInput, SelectInput } from '../../components/studio';
import { ThemeToggle } from '../../components/theme-toggle';
import { SignOutButton } from '../../components/sign-out-button';
import { ArchetypeMini, ModeMini, StyleMini } from '../../components/wizard/minis';
import { OptionCard } from '../../components/wizard/option-card';
import { ProjectSummary } from '../../components/wizard/summary';

/**
 * The project wizard.
 *
 * Organised around intent rather than around templates: the first question is what we are
 * building and why, and the structure and visual language follow from that. The old wizard
 * asked for a template on step two, which meant the decision that shapes the whole project
 * was made before the person had said what the project was for.
 *
 * Seven steps, each one question. A live summary sits alongside from the first step so the
 * project is visible as it is composed, not only at the end.
 *
 * MILESTONE 1 SCOPE
 * -----------------
 * Schema v3 — which gives a project real mode/goal/siteType/archetype/styleSystem fields
 * and a commerce profile — is the next milestone. Until it lands, these answers live in
 * this component and are mapped onto what schema v2 can store: the archetype picks the
 * template, the style writes real design values. Anything that cannot be stored yet is
 * stated plainly on the review step instead of being silently dropped, and archetypes whose
 * sections do not exist yet cannot be created at all. See lib/wizard/catalog.ts.
 */

const STEPS = [
  {
    id: 'mode',
    label: 'מה בונים',
    title: 'מה אנחנו בונים?',
    why: 'קובע את סוג הפרויקט ואת ההתנהגות שלו.',
  },
  {
    id: 'goal',
    label: 'מטרה',
    title: 'מה המטרה העיקרית?',
    why: 'המטרה קובעת מה מקבל את המקום הבולט בעמוד.',
  },
  {
    id: 'siteType',
    label: 'תחום',
    title: 'איזה סוג עסק זה?',
    why: 'קובע את שפת התוכן ואת השדות שנבקש בהמשך.',
  },
  {
    id: 'archetype',
    label: 'מבנה',
    title: 'מבנה העמוד',
    why: 'סדר הסקשנים בעמוד. הכול ניתן לשינוי אחר כך בעורך.',
  },
  {
    id: 'style',
    label: 'עיצוב',
    title: 'שפה עיצובית',
    why: 'צבע, טיפוגרפיה, פינות ואופי הכפתורים.',
  },
  {
    id: 'details',
    label: 'פרטים',
    title: 'פרטי העסק',
    why: 'כל פרט שחסר מסומן באתר במקום להמציא ערך.',
  },
  { id: 'review', label: 'סיכום', title: 'לפני שיוצרים', why: 'בדיקה אחרונה — בדיוק מה ייווצר.' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const CURRENCIES = [
  { value: 'ILS', label: '₪ שקל' },
  { value: 'USD', label: '$ דולר' },
  { value: 'EUR', label: '€ אירו' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // The five composition axes.
  const [mode, setMode] = React.useState<ProjectMode>('live');
  const [goal, setGoal] = React.useState<BusinessGoal | null>(null);
  const [siteType, setSiteType] = React.useState<SiteType | null>(null);
  const [archetype, setArchetype] = React.useState<Archetype | null>(null);
  const [style, setStyle] = React.useState<StyleSystem | null>(null);

  // Identity.
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [industry, setIndustry] = React.useState('');

  // Service details.
  const [phone, setPhone] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [location, setLocation] = React.useState('');

  // Commerce details. Collected so the step is real and reviewable; see the review note.
  // The brand name is the project name field itself — a second "brand" input beside it
  // would be two names for one thing and would immediately disagree.
  const [currency, setCurrency] = React.useState('ILS');
  const [productName, setProductName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [compareAtPrice, setCompareAtPrice] = React.useState('');
  const [productOptions, setProductOptions] = React.useState('');
  const [shippingNote, setShippingNote] = React.useState('');
  const [returnsNote, setReturnsNote] = React.useState('');

  const current = STEPS[step];
  const goals = goalsForMode(mode);
  const siteTypes = goal ? siteTypesForGoal(goal) : [];
  const archetypeOptions = siteType && goal ? archetypesFor(siteType, goal) : ARCHETYPES;
  const recommended = siteType && goal ? recommendedArchetype(siteType, goal) : null;
  const chosenArchetype = archetype ? archetypeById(archetype) : null;
  const chosenStyle = style ? styleById(style) : null;
  const chosenSiteType = siteType ? siteTypeById(siteType) : null;
  const isCommerceFields = chosenSiteType?.fields === 'commerce';

  /**
   * A selection is only creatable when its archetype has sections that exist today.
   * Commerce archetypes become creatable in Milestone 3.
   */
  const buildable = chosenArchetype?.buildable ?? false;

  /** Changing an upstream answer invalidates the answers derived from it. */
  const chooseMode = (next: ProjectMode) => {
    setMode(next);
    if (goal && !goalsForMode(next).some((item) => item.id === goal)) {
      setGoal(null);
      setSiteType(null);
      setArchetype(null);
    }
  };

  const chooseGoal = (next: BusinessGoal) => {
    setGoal(next);
    if (siteType && !siteTypesForGoal(next).some((item) => item.id === siteType)) {
      setSiteType(null);
      setArchetype(null);
    }
  };

  const chooseSiteType = (next: SiteType) => {
    setSiteType(next);
    // Pre-select the recommendation rather than leaving step 4 empty: an opinionated
    // default is the point of asking the three questions before it.
    if (goal) setArchetype(recommendedArchetype(next, goal).id);
    if (!style) setStyle(defaultStyleFor(next));
    if (!industry) setIndustry(siteTypeById(next).suggestedIndustries[0]);
  };

  const updateName = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const canAdvance = ((): boolean => {
    switch (current.id as StepId) {
      case 'goal':
        return goal !== null;
      case 'siteType':
        return siteType !== null;
      case 'archetype':
        return archetype !== null;
      case 'style':
        return style !== null;
      case 'details':
        return name.trim().length > 1 && slug.trim().length > 0;
      default:
        return true;
    }
  })();

  const submit = async () => {
    if (!chosenArchetype || !chosenStyle || !buildable) return;
    setSubmitting(true);
    setError(null);

    try {
      const draft = createProjectFromTemplate({
        name: name.trim(),
        slug: slug.trim(),
        industry: industry.trim(),
        template: chosenArchetype.legacyTemplate,
        language: 'he',
        direction: 'rtl',
        theme: chosenStyle.theme,
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        location: location.trim(),
        address: location.trim(),
      });

      // The style is applied over the template's defaults, so the visual choice made in
      // step 5 is carried into the created project rather than being decoration.
      const project: Project = { ...draft, design: { ...draft.design, ...chosenStyle.design } };

      const created = await createProject(project);
      router.push(`/projects/${created.id}`);
    } catch (cause) {
      setError((cause as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-studio-line bg-studio-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3 desktop:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-ui-sm font-semibold text-studio-soft transition-colors hover:text-studio-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 -scale-x-100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              aria-hidden="true"
            >
              <path d="M19 12H5m6 6-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            חזרה לפרויקטים
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 py-6 desktop:px-8 desktop:py-10">
        <h1 className="text-ui-2xl font-extrabold tracking-tight text-studio-ink desktop:text-ui-3xl">
          פרויקט חדש
        </h1>

        {/* Progress. The rail fills in reading order, which in an RTL document is
            right-to-left without any transform. */}
        <ol className="mt-5 flex items-start gap-1.5" aria-label="שלבי יצירת הפרויקט">
          {STEPS.map((item, index) => {
            const state = index < step ? 'done' : index === step ? 'current' : 'todo';
            return (
              <li key={item.id} className="flex flex-1 flex-col gap-2">
                <span
                  className={cn(
                    'h-1 rounded-full transition-colors duration-[var(--t-move)]',
                    state === 'todo' ? 'bg-studio-line' : 'bg-studio-accent',
                  )}
                />
                <span className="flex items-center gap-1.5">
                  <span
                    dir="ltr"
                    className={cn(
                      'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-studio-mono text-[10px] font-bold transition-colors duration-[var(--t-move)]',
                      state === 'done'
                        ? 'bg-studio-accent text-studio-accent-ink'
                        : state === 'current'
                          ? 'bg-studio-accent-soft text-studio-accent ring-1 ring-studio-accent'
                          : 'bg-studio-sunken text-studio-faint',
                    )}
                  >
                    {state === 'done' ? '✓' : index + 1}
                  </span>
                  <span
                    className={cn(
                      'hidden truncate text-ui-xs font-semibold tablet:block',
                      state === 'current' ? 'text-studio-ink' : 'text-studio-faint',
                    )}
                  >
                    {item.label}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 grid gap-6 desktop:grid-cols-[1fr_19rem] desktop:gap-8">
          <div key={current.id} className="studio-enter min-h-[26rem]">
            <h2 className="text-ui-xl font-bold text-studio-ink">{current.title}</h2>
            <p className="mt-1 text-ui-sm leading-relaxed text-studio-muted">{current.why}</p>

            <div className="mt-5">
              {current.id === 'mode' && (
                <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
                  {MODES.map((item) => (
                    <OptionCard
                      key={item.id}
                      name="mode"
                      value={item.id}
                      checked={mode === item.id}
                      onSelect={(value) => chooseMode(value as ProjectMode)}
                      title={item.label}
                      description={item.description}
                      preview={<ModeMini mode={item.id} />}
                    />
                  ))}
                </div>
              )}

              {current.id === 'goal' && (
                <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
                  {goals.map((item) => (
                    <OptionCard
                      key={item.id}
                      name="goal"
                      value={item.id}
                      checked={goal === item.id}
                      onSelect={(value) => chooseGoal(value as BusinessGoal)}
                      title={item.label}
                      description={item.description}
                    />
                  ))}
                </div>
              )}

              {current.id === 'siteType' && (
                <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
                  {siteTypes.map((item) => (
                    <OptionCard
                      key={item.id}
                      name="siteType"
                      value={item.id}
                      checked={siteType === item.id}
                      onSelect={(value) => chooseSiteType(value as SiteType)}
                      title={item.label}
                      description={item.description}
                      badge={item.fields === 'commerce' ? 'מסחר' : undefined}
                    />
                  ))}
                </div>
              )}

              {current.id === 'archetype' && (
                <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
                  {archetypeOptions.map((item) => (
                    <OptionCard
                      key={item.id}
                      name="archetype"
                      value={item.id}
                      checked={archetype === item.id}
                      onSelect={(value) => setArchetype(value as Archetype)}
                      title={item.label}
                      description={item.description}
                      preview={<ArchetypeMini archetype={item} />}
                      badge={recommended?.id === item.id ? 'מומלץ' : undefined}
                      note={item.buildable ? undefined : 'הסקשנים המסחריים נוספים באבן הדרך הבאה'}
                    />
                  ))}
                </div>
              )}

              {current.id === 'style' && (
                <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-4">
                  {STYLES.map((item) => (
                    <OptionCard
                      key={item.id}
                      name="style"
                      value={item.id}
                      checked={style === item.id}
                      onSelect={(value) => setStyle(value as StyleSystem)}
                      title={item.label}
                      description={item.description}
                      preview={<StyleMini style={item} />}
                    />
                  ))}
                </div>
              )}

              {current.id === 'details' && (
                <div className="flex flex-col gap-5">
                  <div className="grid gap-5 tablet:grid-cols-2">
                    <Field
                      label={isCommerceFields ? 'שם המותג' : 'שם העסק'}
                      hint="השם שיופיע באתר ובכותרת העליונה."
                    >
                      <TextInput
                        value={name}
                        onChange={(event) => updateName(event.target.value)}
                        placeholder={
                          isCommerceFields ? 'לדוגמה: סטודיו אמרי' : 'לדוגמה: פיזיותלטיקס'
                        }
                        autoFocus
                      />
                    </Field>
                    <Field label="מזהה לכתובת" hint="אותיות לטיניות קטנות, ספרות ומקפים.">
                      <TextInput
                        value={slug}
                        dir="ltr"
                        className="text-start font-studio-mono text-ui-sm"
                        onChange={(event) => {
                          setSlugTouched(true);
                          setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                        }}
                        placeholder="studio-ameri"
                      />
                    </Field>
                  </div>

                  <Field label="ענף" hint="לזיהוי מהיר בלוח הפרויקטים.">
                    <TextInput
                      value={industry}
                      onChange={(event) => setIndustry(event.target.value)}
                      placeholder={chosenSiteType?.suggestedIndustries[0] ?? ''}
                    />
                  </Field>

                  {/* The fields below are the contextual half of the step: a clinic and a
                      jewellery studio are asked different questions, because they are
                      different businesses. */}
                  {isCommerceFields ? (
                    <>
                      <div className="grid gap-5 tablet:grid-cols-2">
                        <Field label="מטבע" hint="מוצג לצד כל מחיר באתר.">
                          <SelectInput
                            value={currency}
                            onChange={(event) => setCurrency(event.target.value)}
                          >
                            {CURRENCIES.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </SelectInput>
                        </Field>
                        <Field label="מוצר ראשי" hint="המוצר שהעמוד ייבנה סביבו.">
                          <TextInput
                            value={productName}
                            onChange={(event) => setProductName(event.target.value)}
                            placeholder="לדוגמה: שרשרת כסף מעוצבת"
                          />
                        </Field>
                      </div>

                      <div className="grid gap-5 tablet:grid-cols-2">
                        <Field label="מחיר" hint="מספרים בלבד.">
                          <TextInput
                            value={price}
                            dir="ltr"
                            className="text-start"
                            inputMode="numeric"
                            onChange={(event) =>
                              setPrice(event.target.value.replace(/[^\d.]/g, ''))
                            }
                            placeholder="349"
                          />
                        </Field>
                        <Field label="מחיר לפני הנחה" hint="אופציונלי. מוצג מחוק לצד המחיר.">
                          <TextInput
                            value={compareAtPrice}
                            dir="ltr"
                            className="text-start"
                            inputMode="numeric"
                            onChange={(event) =>
                              setCompareAtPrice(event.target.value.replace(/[^\d.]/g, ''))
                            }
                            placeholder="429"
                          />
                        </Field>
                      </div>

                      <Field label="מידות או צבעים" hint="מופרדים בפסיק. אפשר להשלים אחר כך בעורך.">
                        <TextInput
                          value={productOptions}
                          onChange={(event) => setProductOptions(event.target.value)}
                          placeholder="זהב, כסף, רוז גולד"
                        />
                      </Field>

                      <div className="grid gap-5 tablet:grid-cols-2">
                        <Field label="מדיניות משלוח" hint="שורה אחת שמופיעה בעמוד המוצר.">
                          <TextInput
                            value={shippingNote}
                            onChange={(event) => setShippingNote(event.target.value)}
                            placeholder="משלוח חינם מעל 250 ₪"
                          />
                        </Field>
                        <Field label="מדיניות החזרות" hint="שורה אחת שמופיעה בעמוד המוצר.">
                          <TextInput
                            value={returnsNote}
                            onChange={(event) => setReturnsNote(event.target.value)}
                            placeholder="החזרה תוך 14 יום"
                          />
                        </Field>
                      </div>

                      <Field label="וואטסאפ" hint="לשאלות על מידה או התאמה.">
                        <TextInput
                          value={whatsapp}
                          dir="ltr"
                          className="text-start"
                          onChange={(event) => setWhatsapp(event.target.value)}
                          placeholder="0501234567"
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-5 tablet:grid-cols-2">
                        <Field label="טלפון" hint="מופיע בכותרת ובסרגל הנייד.">
                          <TextInput
                            value={phone}
                            dir="ltr"
                            className="text-start"
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder="03-1234567"
                          />
                        </Field>
                        <Field label="וואטסאפ" hint="אופציונלי. יוצר כפתור פנייה ישיר.">
                          <TextInput
                            value={whatsapp}
                            dir="ltr"
                            className="text-start"
                            onChange={(event) => setWhatsapp(event.target.value)}
                            placeholder="0501234567"
                          />
                        </Field>
                      </div>
                      <div className="grid gap-5 tablet:grid-cols-2">
                        <Field label="אימייל" hint="יעד הפניות מהטופס.">
                          <TextInput
                            value={email}
                            dir="ltr"
                            className="text-start"
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="hello@example.co.il"
                          />
                        </Field>
                        <Field label="כתובת" hint="מופיעה באזור יצירת הקשר.">
                          <TextInput
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                            placeholder="רחוב ומספר, עיר"
                          />
                        </Field>
                      </div>
                    </>
                  )}
                </div>
              )}

              {current.id === 'review' && (
                <Review
                  name={name}
                  slug={slug}
                  mode={mode}
                  goal={goal}
                  siteType={siteType}
                  archetype={archetype}
                  style={style}
                  buildable={buildable}
                  isCommerceFields={isCommerceFields}
                  onGoToArchetype={() => setStep(3)}
                />
              )}
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-5 rounded-md bg-studio-danger/10 px-3 py-2.5 text-ui-sm font-medium text-studio-danger"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-studio-line pt-5">
              <StudioButton
                variant="subtle"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0 || submitting}
              >
                חזרה
              </StudioButton>

              {current.id === 'review' ? (
                <StudioButton
                  variant="primary"
                  onClick={submit}
                  disabled={submitting || !buildable}
                >
                  {submitting ? 'יוצר פרויקט…' : 'יצירת הפרויקט'}
                </StudioButton>
              ) : (
                <StudioButton
                  variant="primary"
                  onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
                  disabled={!canAdvance}
                >
                  המשך
                </StudioButton>
              )}
            </div>
          </div>

          <ProjectSummary
            selection={{ name, slug, mode, goal, siteType, archetype, style }}
            className="desktop:sticky desktop:top-24 desktop:self-start"
          />
        </div>
      </main>
    </div>
  );
}

/**
 * The review step.
 *
 * States exactly what will be created, and — just as important — what will not be. A
 * commerce selection cannot produce a project until its sections exist, and saying so here
 * is the difference between an honest tool and one that creates something misleading.
 */
function Review({
  name,
  slug,
  mode,
  goal,
  siteType,
  archetype,
  style,
  buildable,
  isCommerceFields,
  onGoToArchetype,
}: {
  name: string;
  slug: string;
  mode: ProjectMode;
  goal: BusinessGoal | null;
  siteType: SiteType | null;
  archetype: Archetype | null;
  style: StyleSystem | null;
  buildable: boolean;
  isCommerceFields: boolean;
  onGoToArchetype: () => void;
}) {
  const chosenArchetype = archetype ? archetypeById(archetype) : null;
  const chosenStyle = style ? styleById(style) : null;

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-studio-panel p-4 ring-1 ring-studio-line tablet:grid-cols-2">
        <Line term="שם הפרויקט" value={name.trim() || 'לא הוזן'} />
        <Line term="כתובת" value={slug.trim() || 'לא הוזן'} ltr />
        <Line term="סוג פרויקט" value={modeById(mode).label} />
        <Line term="מטרה" value={goal ? goalById(goal).label : '—'} />
        <Line term="תחום" value={siteType ? siteTypeById(siteType).label : '—'} />
        <Line term="מבנה" value={chosenArchetype?.label ?? '—'} />
        <Line term="שפה עיצובית" value={chosenStyle?.label ?? '—'} />
        <Line term="שפה וכיוון" value="עברית · ימין לשמאל" />
      </dl>

      {chosenArchetype ? (
        <div className="rounded-xl bg-studio-panel p-4 ring-1 ring-studio-line">
          <h3 className="text-ui-sm font-bold text-studio-ink">
            ייווצרו {chosenArchetype.stack.length} סקשנים, בסדר הזה
          </h3>
          <ol className="mt-2.5 flex flex-wrap gap-1.5">
            {/* The ordinal is its own element rather than part of the string. A leading
                Latin numeral inside an RTL text node is reordered by the bidi algorithm to
                the far end of the line, which puts "1." after the label it numbers. Two
                elements in an RTL flex row place it where a Hebrew reader expects it. */}
            {chosenArchetype.stack.map((label, index) => (
              <li
                key={`${label}-${index}`}
                className="flex items-center gap-1.5 rounded-full bg-studio-sunken px-2.5 py-1 text-ui-xs text-studio-soft"
              >
                <span dir="ltr" className="font-studio-mono text-[10px] text-studio-faint">
                  {index + 1}
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-ui-xs leading-relaxed text-studio-muted">
            כותרת עליונה וכותרת תחתונה נוספות אוטומטית. אפשר להוסיף, להסיר ולשנות סדר בעורך.
          </p>
        </div>
      ) : null}

      {buildable ? (
        <p className="rounded-lg bg-studio-ok/10 px-3 py-2.5 text-ui-xs leading-relaxed text-studio-ok">
          הפרויקט ייווצר עכשיו עם התוכן השלד בעברית, וייפתח מיד בעורך.
          {isCommerceFields
            ? ' פרטי המסחר שהוזנו יישמרו החל מאבן הדרך הבאה, כשמודל החנות ייכנס לסכמה.'
            : ''}
        </p>
      ) : (
        <div className="rounded-lg bg-studio-warn/10 px-3 py-3">
          <p className="text-ui-sm font-bold text-studio-warn">המבנה הזה עדיין לא ניתן ליצירה</p>
          <p className="mt-1 text-ui-xs leading-relaxed text-studio-soft">
            {chosenArchetype?.label} דורש סקשנים מסחריים — עמוד מוצר, גלריה, בחירת מידה — שנבנים
            באבן הדרך הבאה. אפשר לבחור מבנה אחר ולהמשיך עכשיו, או לחזור לכאן אחרי שהסקשנים ייכנסו.
          </p>
          <button
            type="button"
            onClick={onGoToArchetype}
            className="mt-2.5 rounded-md bg-studio-panel px-3 py-1.5 text-ui-xs font-semibold text-studio-ink ring-1 ring-studio-line transition-colors hover:ring-studio-line-strong"
          >
            בחירת מבנה אחר
          </button>
        </div>
      )}
    </div>
  );
}

function Line({ term, value, ltr }: { term: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-studio-line pb-2 last:border-b-0">
      <dt className="shrink-0 text-ui-label text-studio-faint">{term}</dt>
      <dd
        dir={ltr ? 'ltr' : undefined}
        className={cn(
          'min-w-0 truncate text-ui-sm font-semibold text-studio-ink',
          ltr && 'text-start font-studio-mono',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
