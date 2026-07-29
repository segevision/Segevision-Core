import {
  SCHEMA_VERSION,
  createSection,
  defaultVariantFor,
  type Project,
  type ProjectDesign,
  type SectionContent,
  type SectionInstance,
  type SectionType,
  type TemplateId,
  type ThemePreset,
} from '@segevision/renderer';

/** The per-section content a template seeds, keyed by section type. */
export type TemplateContent = Partial<Record<SectionType, SectionContent>>;

/**
 * Templates are authored in one flat object because that is how a copywriter thinks
 * about a page. `distribute` is the single place that maps it onto section instances,
 * so the authoring shape stays readable without the schema having to accommodate it.
 */
interface FlatTemplateContent {
  hero: NonNullable<SectionContent['hero']>;
  trustPoints: NonNullable<SectionContent['trustPoints']>;
  servicesHeading: NonNullable<SectionContent['heading']>;
  services: NonNullable<SectionContent['services']>;
  processHeading: NonNullable<SectionContent['heading']>;
  process: NonNullable<SectionContent['process']>;
  featuresHeading: NonNullable<SectionContent['heading']>;
  features: NonNullable<SectionContent['features']>;
  teamHeading: NonNullable<SectionContent['heading']>;
  team: NonNullable<SectionContent['team']>;
  faqHeading: NonNullable<SectionContent['heading']>;
  faq: NonNullable<SectionContent['faq']>;
  contactHeading: NonNullable<SectionContent['heading']>;
  footer: NonNullable<SectionContent['footer']>;
}

function distribute(
  flat: FlatTemplateContent,
  appointment: NonNullable<SectionContent['appointment']>,
): TemplateContent {
  return {
    hero: { hero: flat.hero },
    trust: { trustPoints: flat.trustPoints },
    services: { heading: flat.servicesHeading, services: flat.services },
    process: { heading: flat.processHeading, process: flat.process },
    features: { heading: flat.featuresHeading, features: flat.features },
    team: { heading: flat.teamHeading, team: flat.team },
    faq: { heading: flat.faqHeading, faq: flat.faq },
    contact: { heading: flat.contactHeading },
    appointment: { appointment },
    footer: { footer: flat.footer },
  };
}

const defaultAppointment: NonNullable<SectionContent['appointment']> = {
  eyebrow: 'יצירת קשר',
  title: 'נשמח לשמוע מכם',
  lead: 'השאירו פרטים ונחזור אליכם בהקדם.',
  submitLabel: 'שליחת בקשה',
  successTitle: 'הבקשה נקלטה',
  successBody: 'נחזור אליכם בהקדם. שימו לב: זו בקשה ליצירת קשר ולא אישור סופי.',
  disclaimer: 'שליחת הטופס היא בקשה ליצירת קשר בלבד.',
  assurances: ['הפנייה נקראת על ידי בעלי העסק', 'נחזור אליכם בשעות הפעילות'],
  destination: '',
};

/**
 * Website Factory Architecture, Part 2 — Industry Template System.
 *
 * A template is *configuration*, never code: a section order, a starting theme and a
 * Hebrew content skeleton. All three categories are drawn by the same
 * @segevision/renderer, so adding a fourth category costs a file, not a codebase.
 */

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
  /** Shown in the wizard so the user picks by business type, not by aesthetics. */
  suggestedIndustries: string[];
  theme: ThemePreset;
  design: Pick<ProjectDesign, 'primaryColor' | 'secondaryColor' | 'radius' | 'headingFont' | 'bodyFont'>;
  sections: SectionType[];
  buildContent: (businessName: string) => FlatTemplateContent;
  buildNavigation: () => { id: string; label: string; href: string }[];
}

const key = (prefix: string, index: number) => `${prefix}-${index + 1}`;

/** Builds the section instances for a template, each carrying its own content slice. */
function sectionsFrom(types: SectionType[], content: TemplateContent): SectionInstance[] {
  return types.map((type, index) => ({
    ...createSection(type, content[type] ?? {}),
    id: `sec-${type}-${index + 1}`,
    variant: defaultVariantFor(type),
    order: index,
  }));
}

/* ------------------------------------------------------------------ רפואה */

const medical: TemplateDefinition = {
  id: 'medical',
  label: 'רפואה ובריאות',
  description:
    'קליניקות, מרפאות ומטפלים. מוביל באמון ובמומחיות: רצועת אמון גבוה בעמוד, תהליך טיפול מפורט וצוות בולט.',
  suggestedIndustries: ['פיזיותרפיה', 'רפואת שיניים', 'רפואה משלימה', 'פסיכולוגיה', 'תזונה', 'וטרינריה'],
  theme: 'medical',
  design: {
    primaryColor: '#12545C',
    secondaryColor: '#8FA33F',
    radius: 'soft',
    headingFont: 'Heebo',
    bodyFont: 'Assistant',
  },
  sections: [
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
    'mobileBar',
    'footer',
  ],
  buildNavigation: () => [
    { id: 'nav-1', label: 'שירותים', href: '#services' },
    { id: 'nav-2', label: 'התהליך', href: '#process' },
    { id: 'nav-3', label: 'הצוות', href: '#team' },
    { id: 'nav-4', label: 'שאלות נפוצות', href: '#faq' },
    { id: 'nav-5', label: 'יצירת קשר', href: '#contact' },
  ],
  buildContent: (name) => ({
    hero: {
      eyebrow: 'קליניקה פרטית',
      headline: 'טיפול שמחזיר אתכם לעצמכם.',
      headlineSecondary: 'לא רק מקל על התסמין.',
      subheadline: `ב${name} מתחילים באבחון מדויק, מסבירים בשפה ברורה מה קורה, ובונים תוכנית טיפול אישית שמתאימה לחיים שלכם.`,
      primaryCtaLabel: 'קביעת תור',
      primaryCtaHref: '#appointment',
      secondaryCtaLabel: 'שיחה בוואטסאפ',
      secondaryCtaHref: '#contact',
      mediaLabel: 'צילום של טיפול בקליניקה',
      mediaNote: 'צילום אנכי באור טבעי, רגע עבודה אמיתי ולא פוזה מבוימת.',
    },
    trustPoints: [
      { id: key('trust', 0), title: 'ותק מוכח', description: 'שנים של ניסיון בטיפול במטופלים מהאזור.' },
      { id: key('trust', 1), title: 'הכשרה מקצועית', description: 'הסמכות והתמחויות שמאחורי כל החלטה טיפולית.' },
      { id: key('trust', 2), title: 'גישה מבוססת ראיות', description: 'עבודה לפי הידע המקצועי העדכני, בלי קיצורי דרך.' },
    ],
    servicesHeading: { eyebrow: 'תחומי הטיפול', title: 'במה אנחנו מטפלים', lead: 'כל מסלול נבנה סביב אבחנה אישית.' },
    services: [
      { id: key('srv', 0), title: 'שירות ראשון', description: 'תיאור קצר של מה שכולל השירות ולמי הוא מתאים.', tags: [] },
      { id: key('srv', 1), title: 'שירות שני', description: 'תיאור קצר של מה שכולל השירות ולמי הוא מתאים.', tags: [] },
      { id: key('srv', 2), title: 'שירות שלישי', description: 'תיאור קצר של מה שכולל השירות ולמי הוא מתאים.', tags: [] },
      { id: key('srv', 3), title: 'שירות רביעי', description: 'תיאור קצר של מה שכולל השירות ולמי הוא מתאים.', tags: [] },
    ],
    processHeading: { eyebrow: 'איך זה עובד', title: 'הדרך מהפגישה הראשונה ועד התוצאה', lead: 'תהליך ברור, בלי הפתעות.' },
    process: [
      { id: key('step', 0), title: 'אבחון', description: 'פגישה ראשונה מלאה ובדיקה תפקודית.', outcome: 'תמונת מצב ברורה' },
      { id: key('step', 1), title: 'הסבר ואבחנה', description: 'מסבירים בשפה פשוטה מה מצאנו ומה המשמעות.', outcome: 'מבינים מה קורה' },
      { id: key('step', 2), title: 'תוכנית אישית', description: 'בונים יחד תוכנית שמתאימה ללוח הזמנים שלכם.', outcome: 'יעד מוגדר' },
      { id: key('step', 3), title: 'טיפול ומעקב', description: 'עבודה מדורגת עם מדידה של ההתקדמות.', outcome: 'התקדמות מבוקרת' },
    ],
    featuresHeading: { eyebrow: 'למה אנחנו', title: 'מה שמייחד אותנו', lead: '' },
    features: [
      { id: key('feat', 0), title: 'הכשרה מקצועית', description: 'לימודי המשך והתמחות בתחום.' },
      { id: key('feat', 1), title: 'ליווי אישי', description: 'אותו מטפל מלווה אתכם לאורך כל הדרך.' },
      { id: key('feat', 2), title: 'גישה מבוססת ראיות', description: 'החלטות שנשענות על ידע עדכני.' },
      { id: key('feat', 3), title: 'זמינות מקומית', description: 'קרוב לבית, בלי נסיעות ארוכות.' },
    ],
    teamHeading: { eyebrow: 'הצוות', title: 'מי יטפל בכם', lead: 'האנשים שילוו אתכם לאורך התהליך.' },
    team: [
      {
        id: key('team', 0),
        name: 'שם המטפל',
        role: 'תפקיד והתמחות',
        bio: 'משפט או שניים על גישת הטיפול והתחומים שבהם מתמחה.',
        credentials: ['תואר או הסמכה', 'התמחות נוספת'],
        photoLabel: 'פורטרט בקליניקה',
      },
    ],
    faqHeading: { eyebrow: 'לפני שמתקשרים', title: 'שאלות נפוצות', lead: 'לא מצאתם תשובה? שאלו אותנו ישירות.' },
    faq: [
      { id: key('faq', 0), question: 'האם צריך הפניה מרופא?', answer: 'התשובה תתעדכן לאחר אישור הקליניקה.', pending: true },
      { id: key('faq', 1), question: 'כמה פגישות בדרך כלל נדרשות?', answer: 'התשובה תתעדכן לאחר אישור הקליניקה.', pending: true },
      {
        id: key('faq', 2),
        question: 'מה כדאי להביא לפגישה הראשונה?',
        answer: 'בגדים נוחים ומסמכים רפואיים רלוונטיים, אם יש כאלה.',
        pending: false,
      },
    ],
    contactHeading: { eyebrow: 'הגעה ויצירת קשר', title: 'איפה אנחנו נמצאים', lead: '' },
    footer: {
      description: `${name} — קליניקה פרטית.`,
      copyright: '',
      creditPrefix: 'עיצוב ופיתוח:',
      creditLabel: 'Segevision',
      creditHref: 'https://segevision.com',
    },
  }),
};

/* --------------------------------------------------- שירותים מקצועיים */

const professional: TemplateDefinition = {
  id: 'professional',
  label: 'שירותים מקצועיים',
  description:
    'עורכי דין, רואי חשבון, יועצים ואדריכלים. מוביל בסמכות: הבידול והצוות עולים גבוה בעמוד, והתהליך מוצג כשיטת עבודה.',
  suggestedIndustries: ['עריכת דין', 'ראיית חשבון', 'ייעוץ עסקי', 'אדריכלות', 'ביטוח', 'נדל״ן'],
  theme: 'corporate',
  design: {
    primaryColor: '#1E3A5F',
    secondaryColor: '#B08D57',
    radius: 'sharp',
    headingFont: 'Heebo',
    bodyFont: 'Assistant',
  },
  sections: [
    'header',
    'hero',
    'trust',
    'features',
    'services',
    'team',
    'process',
    'faq',
    'appointment',
    'contact',
    'mobileBar',
    'footer',
  ],
  buildNavigation: () => [
    { id: 'nav-1', label: 'תחומי התמחות', href: '#services' },
    { id: 'nav-2', label: 'הצוות', href: '#team' },
    { id: 'nav-3', label: 'שיטת העבודה', href: '#process' },
    { id: 'nav-4', label: 'שאלות נפוצות', href: '#faq' },
    { id: 'nav-5', label: 'יצירת קשר', href: '#contact' },
  ],
  buildContent: (name) => ({
    hero: {
      eyebrow: 'משרד מקצועי',
      headline: 'ליווי מקצועי',
      headlineSecondary: 'שאפשר לסמוך עליו.',
      subheadline: `ב${name} מלווים לקוחות פרטיים ועסקיים באחריות אישית, בשקיפות מלאה ובלי הפתעות בדרך.`,
      primaryCtaLabel: 'קביעת פגישה',
      primaryCtaHref: '#appointment',
      secondaryCtaLabel: 'שיחה בוואטסאפ',
      secondaryCtaHref: '#contact',
      mediaLabel: 'צילום המשרד או פורטרט מקצועי',
      mediaNote: 'צילום אנכי, אור טבעי, אווירה מקצועית ולא מבוימת.',
    },
    trustPoints: [
      { id: key('trust', 0), title: 'ניסיון מוכח', description: 'שנים של ליווי לקוחות בתחום.' },
      { id: key('trust', 1), title: 'ליווי אישי', description: 'בעלי המשרד מלווים כל תיק באופן אישי.' },
      { id: key('trust', 2), title: 'שקיפות מלאה', description: 'הסבר ברור על כל שלב ועל כל עלות מראש.' },
    ],
    servicesHeading: { eyebrow: 'תחומי התמחות', title: 'במה אנחנו עוסקים', lead: '' },
    services: [
      { id: key('srv', 0), title: 'תחום ראשון', description: 'תיאור קצר של התחום ולמי הוא מתאים.', tags: [] },
      { id: key('srv', 1), title: 'תחום שני', description: 'תיאור קצר של התחום ולמי הוא מתאים.', tags: [] },
      { id: key('srv', 2), title: 'תחום שלישי', description: 'תיאור קצר של התחום ולמי הוא מתאים.', tags: [] },
    ],
    processHeading: { eyebrow: 'שיטת העבודה', title: 'איך אנחנו עובדים', lead: 'תהליך מסודר, בלי הפתעות בדרך.' },
    process: [
      { id: key('step', 0), title: 'פגישת היכרות', description: 'מבררים מה הצורך ומה המצב הנוכחי.', outcome: 'תמונה ברורה' },
      { id: key('step', 1), title: 'בניית תוכנית', description: 'מציגים דרך פעולה, לוח זמנים ועלות.', outcome: 'תוכנית מוסכמת' },
      { id: key('step', 2), title: 'ביצוע', description: 'טיפול שוטף עם עדכון בכל שלב.', outcome: 'התקדמות שקופה' },
    ],
    featuresHeading: { eyebrow: 'הבידול שלנו', title: 'למה לקוחות בוחרים בנו', lead: '' },
    features: [
      { id: key('feat', 0), title: 'מומחיות ממוקדת', description: 'התמחות בתחום מוגדר ולא בהכול.' },
      { id: key('feat', 1), title: 'זמינות אמיתית', description: 'חוזרים אליכם, גם כשאין חדשות.' },
      { id: key('feat', 2), title: 'תמחור ברור', description: 'יודעים מראש כמה זה עולה.' },
      { id: key('feat', 3), title: 'ניסיון מצטבר', description: 'מקרים דומים שכבר טופלו בהצלחה.' },
    ],
    teamHeading: { eyebrow: 'הצוות', title: 'מי מלווה אתכם', lead: '' },
    team: [
      {
        id: key('team', 0),
        name: 'שם בעל המקצוע',
        role: 'תפקיד והתמחות',
        bio: 'משפט או שניים על הרקע והגישה המקצועית.',
        credentials: ['השכלה', 'חברות בלשכה'],
        photoLabel: 'פורטרט מקצועי',
      },
    ],
    faqHeading: { eyebrow: 'לפני שפונים', title: 'שאלות נפוצות', lead: '' },
    faq: [
      { id: key('faq', 0), question: 'כמה עולה פגישת ייעוץ?', answer: 'התשובה תתעדכן לאחר אישור המשרד.', pending: true },
      { id: key('faq', 1), question: 'כמה זמן לוקח תהליך טיפוסי?', answer: 'התשובה תתעדכן לאחר אישור המשרד.', pending: true },
    ],
    contactHeading: { eyebrow: 'יצירת קשר', title: 'איפה נמצא המשרד', lead: '' },
    footer: {
      description: `${name} — שירותים מקצועיים.`,
      copyright: '',
      creditPrefix: 'עיצוב ופיתוח:',
      creditLabel: 'Segevision',
      creditHref: 'https://segevision.com',
    },
  }),
};

/* ------------------------------------------------------------ עסק מקומי */

const local: TemplateDefinition = {
  id: 'local',
  label: 'עסק מקומי',
  description:
    'מסעדות, חנויות, מספרות ובעלי מקצוע. עמוד קצר ומהיר שמוביל לפעולה: פחות הסברים, יותר דרכי יצירת קשר.',
  suggestedIndustries: ['מסעדנות', 'קמעונאות', 'עיצוב שיער', 'שיפוצים', 'גינון', 'הסעדה'],
  theme: 'restaurant',
  design: {
    primaryColor: '#8A3B24',
    secondaryColor: '#4F6B3A',
    radius: 'round',
    headingFont: 'Rubik',
    bodyFont: 'Assistant',
  },
  // בכוונה עמוד קצר: בעסק מקומי כל סקשן נוסף הוא עוד מכשול בדרך לטלפון.
  sections: ['header', 'hero', 'trust', 'services', 'faq', 'contact', 'appointment', 'mobileBar', 'footer'],
  buildNavigation: () => [
    { id: 'nav-1', label: 'מה אנחנו מציעים', href: '#services' },
    { id: 'nav-2', label: 'שאלות נפוצות', href: '#faq' },
    { id: 'nav-3', label: 'איך מגיעים', href: '#contact' },
  ],
  buildContent: (name) => ({
    hero: {
      eyebrow: 'עסק מקומי',
      headline: name,
      headlineSecondary: 'קרוב אליכם.',
      subheadline: 'משפט אחד שמסביר מה העסק עושה, למי הוא מיועד ולמה כדאי דווקא כאן.',
      primaryCtaLabel: 'צרו קשר',
      primaryCtaHref: '#appointment',
      secondaryCtaLabel: 'שיחה בוואטסאפ',
      secondaryCtaHref: '#contact',
      mediaLabel: 'צילום המקום או המוצר',
      mediaNote: 'צילום אנכי, אור טבעי, אווירה אמיתית של המקום.',
    },
    trustPoints: [
      { id: key('trust', 0), title: 'ותק במקום', description: 'שנים של פעילות ולקוחות חוזרים.' },
      { id: key('trust', 1), title: 'שירות אישי', description: 'מכירים את הלקוחות בשם.' },
      { id: key('trust', 2), title: 'זמינות', description: 'עונים לטלפון ומגיעים בזמן.' },
    ],
    servicesHeading: { eyebrow: 'מה אנחנו מציעים', title: 'השירותים שלנו', lead: '' },
    services: [
      { id: key('srv', 0), title: 'שירות ראשון', description: 'תיאור קצר בשתי שורות.', tags: [] },
      { id: key('srv', 1), title: 'שירות שני', description: 'תיאור קצר בשתי שורות.', tags: [] },
      { id: key('srv', 2), title: 'שירות שלישי', description: 'תיאור קצר בשתי שורות.', tags: [] },
    ],
    processHeading: { eyebrow: '', title: '', lead: '' },
    process: [],
    featuresHeading: { eyebrow: '', title: '', lead: '' },
    features: [],
    teamHeading: { eyebrow: '', title: '', lead: '' },
    team: [],
    faqHeading: { eyebrow: 'שאלות', title: 'מה שחשוב לדעת', lead: '' },
    faq: [
      { id: key('faq', 0), question: 'מה שעות הפעילות?', answer: 'התשובה תתעדכן לאחר אישור בעל העסק.', pending: true },
      { id: key('faq', 1), question: 'האם צריך לתאם מראש?', answer: 'התשובה תתעדכן לאחר אישור בעל העסק.', pending: true },
    ],
    contactHeading: { eyebrow: 'איך מגיעים', title: 'המקום שלנו', lead: '' },
    footer: {
      description: `${name} — עסק מקומי.`,
      copyright: '',
      creditPrefix: 'עיצוב ופיתוח:',
      creditLabel: 'Segevision',
      creditHref: 'https://segevision.com',
    },
  }),
};

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = { medical, professional, local };
export const TEMPLATE_LIST: TemplateDefinition[] = [medical, professional, local];

export function getTemplate(templateId: TemplateId): TemplateDefinition {
  return TEMPLATES[templateId] ?? TEMPLATES.medical;
}

export interface CreateProjectInput {
  name: string;
  slug: string;
  industry: string;
  template: TemplateId;
  language?: Project['language'];
  direction?: Project['direction'];
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  location?: string;
  theme?: ThemePreset;
}

/** Builds a complete, schema-valid project from the wizard's answers. */
export function createProjectFromTemplate(input: CreateProjectInput, now = new Date().toISOString()): Project {
  const template = getTemplate(input.template);

  const content = distribute(template.buildContent(input.name), defaultAppointment);

  return {
    schemaVersion: SCHEMA_VERSION,
    id: `prj_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    slug: input.slug,
    industry: input.industry || template.suggestedIndustries[0],
    language: input.language ?? 'he',
    direction: input.direction ?? 'rtl',
    template: template.id,
    theme: input.theme ?? template.theme,
    status: 'draft',
    business: {
      displayName: input.name,
      tagline: '',
      foundedYear: '',
      location: input.location ?? '',
      address: input.address ?? '',
      phone: input.phone ?? '',
      whatsapp: input.whatsapp ?? '',
      email: input.email ?? '',
      hours: [],
      hoursNote: '',
    },
    design: {
      primaryColor: template.design.primaryColor,
      secondaryColor: template.design.secondaryColor,
      backgroundMode: 'light',
      headingFont: template.design.headingFont,
      bodyFont: template.design.bodyFont,
      radius: template.design.radius,
      buttonStyle: 'solid',
    },
    navigation: template.buildNavigation(),
    pages: [
      {
        id: 'home',
        title: 'עמוד הבית',
        path: '/',
        isHome: true,
        sections: sectionsFrom(template.sections, content),
      },
    ],
    seo: { title: input.name, description: '', keywords: [], localArea: input.location ?? '' },
    media: [],
    createdAt: now,
    updatedAt: now,
  };
}
