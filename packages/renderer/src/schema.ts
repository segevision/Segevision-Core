import { z } from 'zod';

/**
 * The single source of truth for what a Segevision client site *is*.
 *
 * Everything downstream reads this one shape: the platform editor writes it, the
 * renderer draws it, storage persists it. Zod gives us the TypeScript types and the
 * runtime validation from the same declaration, which matters because projects are
 * loaded from disk (and later from Supabase) where nothing guarantees the shape.
 *
 * SCHEMA v2 moved content out of a single project-level object and into individual
 * section instances. See migrate.ts for how v1 projects are carried forward.
 */

export const SCHEMA_VERSION = 2;

export const languageSchema = z.enum(['he', 'en']);
export const directionSchema = z.enum(['rtl', 'ltr']);
export const templateSchema = z.enum(['medical', 'professional', 'local']);
export const statusSchema = z.enum(['draft', 'review', 'published', 'archived']);

/** Brand theme presets available from @segevision/tokens. */
export const themePresetSchema = z.enum([
  'medical',
  'luxury',
  'corporate',
  'fitness',
  'restaurant',
  'hotel',
  'legal',
  'construction',
  'technology',
]);

export const sectionTypeSchema = z.enum([
  'header',
  'hero',
  'trust',
  'services',
  'process',
  'features',
  'team',
  'faq',
  'contact',
  'appointment',
  'footer',
  'mobileBar',
]);

export type SectionType = z.infer<typeof sectionTypeSchema>;

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, 'צבע חייב להיות בפורמט HEX בן שש ספרות, למשל 1F4E4A#');

/** Curated list — every family here has real Hebrew coverage and a usable weight range. */
export const fontSchema = z.enum([
  'Heebo',
  'Assistant',
  'Rubik',
  'Noto Sans Hebrew',
  'Frank Ruehl Libre',
  'Secular One',
  'Alef',
]);

export const radiusStyleSchema = z.enum(['sharp', 'soft', 'round']);
export const buttonStyleSchema = z.enum(['solid', 'outline', 'ghost']);
export const backgroundModeSchema = z.enum(['light', 'dark']);

/* ------------------------------------------------------------- content leaves */

export const navItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
});

export const openingHoursSchema = z.object({
  id: z.string().min(1),
  days: z.string(),
  hours: z.string(),
});

export const businessSchema = z.object({
  displayName: z.string().min(1, 'שם העסק הוא שדה חובה'),
  tagline: z.string().default(''),
  foundedYear: z.string().default(''),
  location: z.string().default(''),
  address: z.string().default(''),
  phone: z.string().default(''),
  whatsapp: z.string().default(''),
  email: z.string().default(''),
  hours: z.array(openingHoursSchema).default([]),
  hoursNote: z.string().default(''),
});

export const designSchema = z.object({
  primaryColor: hexColor.default('#12545C'),
  secondaryColor: hexColor.default('#8FA33F'),
  backgroundMode: backgroundModeSchema.default('light'),
  headingFont: fontSchema.default('Heebo'),
  bodyFont: fontSchema.default('Assistant'),
  radius: radiusStyleSchema.default('soft'),
  buttonStyle: buttonStyleSchema.default('solid'),
});

export const heroSchema = z.object({
  eyebrow: z.string().default(''),
  headline: z.string().default(''),
  /** Rendered as a second, de-emphasised line inside the same <h1>. */
  headlineSecondary: z.string().default(''),
  subheadline: z.string().default(''),
  primaryCtaLabel: z.string().default(''),
  primaryCtaHref: z.string().default('#appointment'),
  secondaryCtaLabel: z.string().default(''),
  secondaryCtaHref: z.string().default('#contact'),
  mediaLabel: z.string().default(''),
  mediaNote: z.string().default(''),
});

export const trustPointSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(''),
  description: z.string().default(''),
});

export const serviceSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(''),
  description: z.string().default(''),
  tags: z.array(z.string()).default([]),
});

export const processStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(''),
  description: z.string().default(''),
  outcome: z.string().default(''),
});

export const featureSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(''),
  description: z.string().default(''),
});

export const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().default(''),
  role: z.string().default(''),
  bio: z.string().default(''),
  credentials: z.array(z.string()).default([]),
  photoLabel: z.string().default(''),
});

export const faqSchema = z.object({
  id: z.string().min(1),
  question: z.string().default(''),
  answer: z.string().default(''),
  pending: z.boolean().default(false),
});

export const sectionHeadingSchema = z.object({
  eyebrow: z.string().default(''),
  title: z.string().default(''),
  lead: z.string().default(''),
});

export const footerSchema = z.object({
  description: z.string().default(''),
  copyright: z.string().default(''),
  creditPrefix: z.string().default('עיצוב ופיתוח:'),
  creditLabel: z.string().default('Segevision'),
  creditHref: z.string().default('https://segevision.com'),
});

export const appointmentFormSchema = z.object({
  eyebrow: z.string().default(''),
  title: z.string().default(''),
  lead: z.string().default(''),
  submitLabel: z.string().default('שליחת בקשה'),
  successTitle: z.string().default('הבקשה נקלטה'),
  successBody: z.string().default(''),
  disclaimer: z.string().default(''),
  assurances: z.array(z.string()).default([]),
  /** Where a real submission would go. Empty means the form is a demo and says so. */
  destination: z.string().default(''),
});

/* ---------------------------------------------------------- section instances */

/**
 * One content bag covering every section type. Only the keys a given type uses are
 * populated.
 *
 * A discriminated union per type would be stricter, but it makes duplication,
 * deep-cloning and preset round-tripping considerably more awkward for no practical
 * safety gain — the renderer already reads only the keys its section type needs.
 */
export const sectionContentSchema = z.object({
  hero: heroSchema.optional(),
  heading: sectionHeadingSchema.optional(),
  trustPoints: z.array(trustPointSchema).optional(),
  services: z.array(serviceSchema).optional(),
  process: z.array(processStepSchema).optional(),
  features: z.array(featureSchema).optional(),
  team: z.array(teamMemberSchema).optional(),
  faq: z.array(faqSchema).optional(),
  footer: footerSchema.optional(),
  appointment: appointmentFormSchema.optional(),
});

export type SectionContent = z.infer<typeof sectionContentSchema>;

/**
 * A placed section on a page.
 *
 * Each instance owns its content outright rather than pointing at a shared project
 * object. That is what allows a duplicated section to be edited independently — the
 * single most important property of the section model, and the reason it is defined
 * this way before any project starts depending on duplication.
 */
export const sectionInstanceSchema = z.object({
  id: z.string().min(1),
  type: sectionTypeSchema,
  variant: z.string().default('default'),
  enabled: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
  content: sectionContentSchema.default({}),
  /** Set when the instance was inserted from a preset — informational only. */
  presetId: z.string().optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type SectionInstance = z.infer<typeof sectionInstanceSchema>;

export const pageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  path: z.string().min(1),
  isHome: z.boolean().default(false),
  sections: z.array(sectionInstanceSchema),
});

/* ------------------------------------------------------------------ variants */

export interface VariantDefinition {
  id: string;
  label: string;
  description: string;
}

/**
 * Visual variants per section type. Every variant renders the *same* content schema —
 * switching one never loses data, which is what makes trying them out safe.
 */
export const SECTION_VARIANTS: Record<SectionType, VariantDefinition[]> = {
  hero: [
    { id: 'split', label: 'מפוצל', description: 'טקסט מימין, תמונה משמאל. ברירת המחדל.' },
    { id: 'editorial', label: 'עריכתי', description: 'טיפוגרפיה גדולה על רקע בהיר, תמונה רחבה מתחת.' },
    { id: 'cinematic', label: 'קולנועי', description: 'תמונה במסך מלא עם טקסט מעליה.' },
    { id: 'minimal', label: 'מינימלי', description: 'טקסט בלבד, בלי תמונה. הכי מהיר לטעינה.' },
  ],
  services: [
    { id: 'grid', label: 'רשת', description: 'כרטיסים בפריסת בנטו. ברירת המחדל.' },
    { id: 'list', label: 'רשימה עריכתית', description: 'שורות ממוספרות, בלי מסגרות.' },
    { id: 'alternating', label: 'שורות לסירוגין', description: 'שורות רחבות עם הדגשה מתחלפת.' },
  ],
  trust: [
    { id: 'strip', label: 'רצועה', description: 'שלוש נקודות אופקיות. ברירת המחדל.' },
    { id: 'stats', label: 'מספרים גדולים', description: 'הכותרת בקנה מידה גדול, ההסבר מתחת.' },
    { id: 'credentials', label: 'אישורים', description: 'רשימה אנכית מרוסנת בסגנון עריכתי.' },
  ],
  header: [{ id: 'default', label: 'רגיל', description: 'כותרת דביקה עם ניווט.' }],
  process: [{ id: 'default', label: 'רגיל', description: 'ציר זמן ממוספר.' }],
  features: [{ id: 'default', label: 'רגיל', description: 'עמודות עם קו מפריד.' }],
  team: [{ id: 'default', label: 'רגיל', description: 'כרטיסי צוות עם פורטרט.' }],
  faq: [{ id: 'default', label: 'רגיל', description: 'אקורדיון עם כותרת דביקה.' }],
  contact: [{ id: 'default', label: 'רגיל', description: 'פרטי קשר ומפה.' }],
  appointment: [{ id: 'default', label: 'רגיל', description: 'טופס פנייה.' }],
  footer: [{ id: 'default', label: 'רגיל', description: 'כותרת תחתונה מלאה.' }],
  mobileBar: [{ id: 'default', label: 'רגיל', description: 'סרגל פעולות בנייד.' }],
};

export function variantsFor(type: SectionType): VariantDefinition[] {
  return SECTION_VARIANTS[type] ?? [{ id: 'default', label: 'רגיל', description: '' }];
}

export function defaultVariantFor(type: SectionType): string {
  return variantsFor(type)[0]?.id ?? 'default';
}

/* --------------------------------------------------------------------- misc */

export const seoSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  keywords: z.array(z.string()).default([]),
  localArea: z.string().default(''),
});

/**
 * A media entry is addressed by its `slot`, which is derived from the content it
 * belongs to (see mediaSlots below) rather than typed by hand.
 */
export const mediaSlotSchema = z.object({
  id: z.string().min(1),
  slot: z.string().min(1),
  label: z.string().default(''),
  note: z.string().default(''),
  src: z.string().default(''),
  /** Falls back to `label` when empty — never left absent on a real image. */
  alt: z.string().default(''),
});

export const projectSchema = z.object({
  schemaVersion: z.number().int().default(SCHEMA_VERSION),
  id: z.string().min(1),
  name: z.string().min(1, 'שם הפרויקט הוא שדה חובה'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'המזהה יכול להכיל אותיות לטיניות קטנות, ספרות ומקפים בלבד'),
  industry: z.string().default(''),
  language: languageSchema.default('he'),
  direction: directionSchema.default('rtl'),
  template: templateSchema.default('medical'),
  theme: themePresetSchema.default('medical'),
  status: statusSchema.default('draft'),
  business: businessSchema,
  design: designSchema.default({}),
  navigation: z.array(navItemSchema).default([]),
  pages: z.array(pageSchema).default([]),
  seo: seoSchema.default({}),
  media: z.array(mediaSlotSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectDesign = z.infer<typeof designSchema>;
export type ProjectBusiness = z.infer<typeof businessSchema>;
export type ProjectPage = z.infer<typeof pageSchema>;
export type NavItemConfig = z.infer<typeof navItemSchema>;
export type ServiceConfig = z.infer<typeof serviceSchema>;
export type TeamMemberConfig = z.infer<typeof teamMemberSchema>;
export type FaqConfig = z.infer<typeof faqSchema>;
export type TrustPointConfig = z.infer<typeof trustPointSchema>;
export type ProcessStepConfig = z.infer<typeof processStepSchema>;
export type FeatureConfig = z.infer<typeof featureSchema>;
export type HeroConfig = z.infer<typeof heroSchema>;
export type SectionHeadingConfig = z.infer<typeof sectionHeadingSchema>;
export type AppointmentFormConfig = z.infer<typeof appointmentFormSchema>;
export type FooterConfig = z.infer<typeof footerSchema>;
export type TemplateId = z.infer<typeof templateSchema>;
export type ThemePreset = z.infer<typeof themePresetSchema>;
export type FontChoice = z.infer<typeof fontSchema>;

/** Summary shape used by the dashboard, so a list view never loads full projects. */
export const projectSummarySchema = projectSchema.pick({
  id: true,
  name: true,
  slug: true,
  industry: true,
  template: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
export type ProjectSummary = z.infer<typeof projectSummarySchema>;

export function parseProject(input: unknown): Project {
  return projectSchema.parse(input);
}

export function safeParseProject(input: unknown) {
  return projectSchema.safeParse(input);
}

/* ---------------------------------------------------------------- accessors */

export function homePage(project: Project): ProjectPage | undefined {
  return project.pages.find((page) => page.isHome) ?? project.pages[0];
}

export function homeSections(project: Project): SectionInstance[] {
  return homePage(project)?.sections ?? [];
}

/** First enabled instance of a type — used where a single section drives shared UI. */
export function firstSectionOfType(project: Project, type: SectionType): SectionInstance | undefined {
  return homeSections(project).find((section) => section.type === type);
}

/* ------------------------------------------------------------------- labels */

export const FONT_OPTIONS: { value: FontChoice; label: string; note: string }[] = [
  { value: 'Heebo', label: 'Heebo', note: 'גרוטסק עברי עם טווח משקלים רחב — ברירת מחדל לכותרות' },
  { value: 'Assistant', label: 'Assistant', note: 'קריא מאוד בגדלים קטנים — ברירת מחדל לטקסט' },
  { value: 'Rubik', label: 'Rubik', note: 'פינות מעוגלות, אופי ידידותי' },
  { value: 'Noto Sans Hebrew', label: 'Noto Sans Hebrew', note: 'ניטרלי, כיסוי תווים מלא' },
  { value: 'Frank Ruehl Libre', label: 'Frank Ruehl Libre', note: 'סריף עברי — לכיוון עריכתי' },
  { value: 'Secular One', label: 'Secular One', note: 'משקל אחד, כבד — לכותרות בלבד' },
  { value: 'Alef', label: 'Alef', note: 'נקי ומאופק' },
];

export const THEME_PRESET_LABELS: Record<ThemePreset, string> = {
  medical: 'רפואי',
  luxury: 'יוקרה',
  corporate: 'עסקי',
  fitness: 'כושר',
  restaurant: 'מסעדנות',
  hotel: 'אירוח',
  legal: 'משפטי',
  construction: 'בנייה',
  technology: 'טכנולוגיה',
};

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  medical: 'רפואה ובריאות',
  professional: 'שירותים מקצועיים',
  local: 'עסק מקומי',
};

export const STATUS_LABELS: Record<z.infer<typeof statusSchema>, string> = {
  draft: 'טיוטה',
  review: 'בבדיקת לקוח',
  published: 'פורסם',
  archived: 'בארכיון',
};

export type ProjectStatus = z.infer<typeof statusSchema>;

export const SECTION_LABELS: Record<SectionType, string> = {
  header: 'כותרת עליונה',
  hero: 'אזור פתיחה',
  trust: 'רצועת אמון',
  services: 'שירותים',
  process: 'תהליך העבודה',
  features: 'למה אנחנו',
  team: 'הצוות',
  faq: 'שאלות נפוצות',
  contact: 'יצירת קשר',
  appointment: 'טופס פנייה',
  footer: 'כותרת תחתונה',
  mobileBar: 'סרגל נייד',
};

/** Section types a user may add from the section manager. */
export const ADDABLE_SECTION_TYPES: SectionType[] = [
  'hero',
  'trust',
  'services',
  'process',
  'features',
  'team',
  'faq',
  'contact',
  'appointment',
];

/* ------------------------------------------------------------------- media */

export interface MediaSlotDefinition {
  slot: string;
  label: string;
  description: string;
  /** CSS aspect-ratio the frame renders at, so the upload panel previews truthfully. */
  ratio: string;
}

/**
 * The image frames a project actually has, derived from its own content.
 *
 * Slots are generated rather than stored, and are keyed by *section instance* so two
 * duplicated hero sections get two independent images.
 */
export function mediaSlots(project: Project): MediaSlotDefinition[] {
  const slots: MediaSlotDefinition[] = [];

  for (const section of homeSections(project)) {
    if (!section.enabled) continue;

    if (section.type === 'hero' && section.variant !== 'minimal') {
      slots.push({
        slot: `hero:${section.id}`,
        label: 'תמונת אזור הפתיחה',
        description:
          section.content.hero?.mediaNote || 'התמונה הראשונה שרואים. צילום אנכי עובד הכי טוב.',
        ratio: '4 / 5',
      });
    }

    if (section.type === 'team') {
      for (const member of section.content.team ?? []) {
        slots.push({
          slot: `team:${section.id}:${member.id}`,
          label: `פורטרט — ${member.name || 'איש צוות'}`,
          description: 'צילום אופקי, אור טבעי, ברקע מקום העבודה.',
          ratio: '4 / 3',
        });
      }
    }

    if (section.type === 'contact') {
      slots.push({
        slot: `map:${section.id}`,
        label: 'מפת הגעה',
        description: 'צילום מסך של המפה, או תמונת חוץ של המקום.',
        ratio: '16 / 10',
      });
    }
  }

  return slots;
}

/** Returns the media entry for a slot, but only once it actually carries an image. */
export function mediaFor(project: Project, slot: string) {
  const entry = project.media.find((item) => item.slot === slot);
  return entry && entry.src.trim().length > 0 ? entry : undefined;
}
