import type { ProjectDesign, TemplateId, ThemePreset } from '@segevision/renderer';

/**
 * The composition catalog — the five axes a project is created from.
 *
 * A project is not picked from a list of finished templates. It is composed: what are we
 * building, why, for whom, in what shape, in what visual language. Seven archetypes times
 * eight styles is fifty-six starting points from one set of definitions, and adding a
 * ninth style costs one entry here rather than a new template file.
 *
 * WHY THIS LIVES IN THE APP AND NOT IN THE SCHEMA (yet)
 * ----------------------------------------------------
 * Milestone 1 is the visible wizard. Schema v3 — which gives a project real `mode`,
 * `siteType`, `goal`, `archetype` and `styleSystem` fields — is Milestone 2. Until then a
 * stored project has no place to keep these answers, so they live in wizard state and are
 * mapped down onto what schema v2 can hold (`template`, `theme`, `design`) at creation
 * time. `ArchetypeDefinition.legacyTemplate` and `StyleDefinition.design` are that mapping,
 * and they are the two things Milestone 2 replaces with real stored fields.
 *
 * The consequence is stated honestly in the UI rather than hidden: archetypes that need
 * commerce sections cannot be created yet, and the review step says so.
 */

/* ------------------------------------------------------------------ mode */

export type ProjectMode = 'live' | 'concept' | 'landing' | 'catalog' | 'commerceDemo' | 'redesign';

export interface ModeDefinition {
  id: ProjectMode;
  label: string;
  description: string;
}

export const MODES: ModeDefinition[] = [
  {
    id: 'live',
    label: 'אתר חי',
    description: 'אתר שעולה לאוויר עבור לקוח. כל התוכן אמיתי ומאושר.',
  },
  {
    id: 'concept',
    label: 'קונספט ללקוח',
    description: 'הדמיה לפגישת מכירה, מסומנת בבירור כלא רשמית.',
  },
  {
    id: 'landing',
    label: 'עמוד נחיתה',
    description: 'עמוד יחיד וממוקד, לקמפיין או להשקה.',
  },
  {
    id: 'catalog',
    label: 'קטלוג',
    description: 'תצוגת מוצרים או שירותים, בלי תהליך רכישה.',
  },
  {
    id: 'commerceDemo',
    label: 'הדמיית חנות',
    description: 'עמוד מוצר מלא — מידות, צבעים, מחיר — בלי תשלום אמיתי.',
  },
  {
    id: 'redesign',
    label: 'עיצוב מחדש',
    description: 'אתר קיים שעובר שדרוג. מתחילים מהתוכן שכבר עובד.',
  },
];

/* ------------------------------------------------------------------ goal */

export type BusinessGoal =
  | 'leads'
  | 'appointments'
  | 'sellProduct'
  | 'aov'
  | 'productUnderstanding'
  | 'trust'
  | 'clientDemo';

export interface GoalDefinition {
  id: BusinessGoal;
  label: string;
  description: string;
  /** Modes this goal makes sense for. Keeps the second step honest instead of exhaustive. */
  modes: ProjectMode[];
}

export const GOALS: GoalDefinition[] = [
  {
    id: 'leads',
    label: 'יצירת פניות',
    description: 'שהמבקר ישאיר פרטים או יתקשר.',
    modes: ['live', 'concept', 'landing', 'redesign'],
  },
  {
    id: 'appointments',
    label: 'קביעת תורים',
    description: 'שהמבקר יקבע תור או יבקש זמן פנוי.',
    modes: ['live', 'concept', 'landing', 'redesign'],
  },
  {
    id: 'sellProduct',
    label: 'מכירת מוצר',
    description: 'שהמבקר יבין מה המוצר ויירצה אותו.',
    modes: ['commerceDemo', 'catalog', 'landing', 'concept'],
  },
  {
    id: 'aov',
    label: 'הגדלת סל הקנייה',
    description: 'שהמבקר יוסיף פריט משלים או יבחר מארז.',
    modes: ['commerceDemo', 'catalog', 'concept'],
  },
  {
    id: 'productUnderstanding',
    label: 'הבנת המוצר',
    description: 'שהמבקר יבין בדיוק מה הוא מקבל — מידות, חומרים, התאמה.',
    modes: ['commerceDemo', 'catalog', 'landing', 'concept'],
  },
  {
    id: 'trust',
    label: 'בניית אמון',
    description: 'שהמבקר יבין מי עומד מאחורי העסק.',
    modes: ['live', 'concept', 'redesign', 'catalog'],
  },
  {
    id: 'clientDemo',
    label: 'הצגת הדמיה ללקוח',
    description: 'חומר לפגישה. לא אתר שעולה לאוויר.',
    modes: ['concept', 'commerceDemo', 'catalog', 'redesign'],
  },
];

/* -------------------------------------------------------------- site type */

export type SiteType =
  'local' | 'health' | 'professional' | 'personalBrand' | 'fashionCommerce' | 'handmadeCommerce';

export interface SiteTypeDefinition {
  id: SiteType;
  label: string;
  description: string;
  /** Drives the contextual fields in step 6. */
  fields: 'service' | 'commerce';
  suggestedIndustries: string[];
  goals: BusinessGoal[];
}

export const SITE_TYPES: SiteTypeDefinition[] = [
  {
    id: 'local',
    label: 'עסק מקומי',
    description: 'מספרה, מוסך, מסעדה, סטודיו — עסק שמשרת שכונה או עיר.',
    fields: 'service',
    suggestedIndustries: ['מספרה', 'מוסך', 'מסעדה', 'סטודיו', 'חנות שכונתית'],
    goals: ['leads', 'appointments', 'trust', 'clientDemo'],
  },
  {
    id: 'health',
    label: 'בריאות ורפואה',
    description: 'קליניקות, מטפלים ורופאים. אמון ומומחיות לפני הכול.',
    fields: 'service',
    suggestedIndustries: ['פיזיותרפיה', 'רפואת שיניים', 'פסיכולוגיה', 'תזונה', 'וטרינריה'],
    goals: ['appointments', 'leads', 'trust', 'clientDemo'],
  },
  {
    id: 'professional',
    label: 'שירותים מקצועיים',
    description: 'עורכי דין, רואי חשבון, יועצים ומשרדי אדריכלות.',
    fields: 'service',
    suggestedIndustries: ['עריכת דין', 'ראיית חשבון', 'ייעוץ עסקי', 'אדריכלות', 'שמאות'],
    goals: ['leads', 'trust', 'clientDemo'],
  },
  {
    id: 'personalBrand',
    label: 'מותג אישי ויוצרים',
    description: 'מרצים, מאמנים, צלמים ויוצרי תוכן.',
    fields: 'service',
    suggestedIndustries: ['הרצאות', 'אימון אישי', 'צילום', 'עיצוב', 'יצירת תוכן'],
    goals: ['leads', 'trust', 'clientDemo'],
  },
  {
    id: 'fashionCommerce',
    label: 'אופנה ולייפסטייל',
    description: 'ביגוד, הנעלה ואקססוריז. מידות, צבעים והתאמה הם הלב.',
    fields: 'commerce',
    suggestedIndustries: ['אופנה', 'הנעלה', 'תיקים', 'אקססוריז', 'ספורט'],
    goals: ['sellProduct', 'productUnderstanding', 'aov', 'clientDemo'],
  },
  {
    id: 'handmadeCommerce',
    label: 'עבודת יד, מתנות וקורסים',
    description: 'תכשיטים, מוצרי יד, מארזי מתנה וסדנאות.',
    fields: 'commerce',
    suggestedIndustries: ['תכשיטים', 'קרמיקה', 'מארזי מתנה', 'סדנאות', 'עיצוב הבית'],
    goals: ['sellProduct', 'aov', 'productUnderstanding', 'clientDemo'],
  },
];

/* -------------------------------------------------------------- archetype */

export type Archetype =
  | 'serviceAuthority'
  | 'localLead'
  | 'productConversion'
  | 'collectionStorefront'
  | 'giftFinder'
  | 'personalBrand'
  | 'editorialPortfolio';

/**
 * Section types an archetype places. Commerce archetypes reference types that do not
 * exist in schema v2 yet — they are listed here as strings so the wizard can show the real
 * stack in the summary and the miniature, and `buildable` marks which ones can actually be
 * created today.
 */
export interface ArchetypeDefinition {
  id: Archetype;
  label: string;
  description: string;
  siteTypes: SiteType[];
  goals: BusinessGoal[];
  /** Section labels in placement order, header/footer omitted for legibility. */
  stack: string[];
  /**
   * Whether schema v2 can represent this archetype today. Commerce archetypes become
   * buildable in Milestone 3, when their sections exist.
   */
  buildable: boolean;
  /** The v2 template this maps onto. Only meaningful when `buildable`. */
  legacyTemplate: TemplateId;
}

export const ARCHETYPES: ArchetypeDefinition[] = [
  {
    id: 'serviceAuthority',
    label: 'סמכות מקצועית',
    description: 'מוביל במומחיות: תהליך עבודה מפורט, צוות בולט ושאלות נפוצות שמסירות חשש.',
    siteTypes: ['health', 'professional', 'personalBrand'],
    goals: ['appointments', 'leads', 'trust'],
    stack: [
      'אזור פתיחה',
      'רצועת אמון',
      'שירותים',
      'תהליך העבודה',
      'הצוות',
      'שאלות נפוצות',
      'טופס פנייה',
    ],
    buildable: true,
    legacyTemplate: 'medical',
  },
  {
    id: 'localLead',
    label: 'פניות מקומיות',
    description: 'מהיר ומעשי: מה נותנים, איפה נמצאים, ואיך מתקשרים עכשיו.',
    siteTypes: ['local', 'health', 'professional'],
    goals: ['leads', 'appointments', 'trust'],
    stack: ['אזור פתיחה', 'רצועת אמון', 'שירותים', 'יצירת קשר', 'סרגל נייד'],
    buildable: true,
    legacyTemplate: 'local',
  },
  {
    id: 'personalBrand',
    label: 'מותג אישי',
    description: 'האדם במרכז: סיפור, עבודות ודרך אחת ברורה ליצור קשר.',
    siteTypes: ['personalBrand', 'professional'],
    goals: ['leads', 'trust'],
    stack: ['אזור פתיחה', 'למה אנחנו', 'הצוות', 'שאלות נפוצות', 'יצירת קשר'],
    buildable: true,
    legacyTemplate: 'professional',
  },
  {
    id: 'productConversion',
    label: 'עמוד מוצר ממיר',
    description: 'עמוד מוצר יחיד: גלריה, מידות, צבעים, יתרונות ומשלוח — הכול בלי לרדת מהעמוד.',
    siteTypes: ['fashionCommerce', 'handmadeCommerce'],
    goals: ['sellProduct', 'productUnderstanding', 'aov'],
    stack: [
      'מוצר — פתיחה',
      'גלריית מוצר',
      'בחירת מידה וצבע',
      'יתרונות המוצר',
      'מדריך מידות',
      'משלוח והחזרות',
      'סרגל רכישה דביק',
    ],
    buildable: false,
    legacyTemplate: 'professional',
  },
  {
    id: 'collectionStorefront',
    label: 'חזית קולקציה',
    description: 'רשת מוצרים עם סינון קל, לחנות שמציגה מגוון ולא פריט אחד.',
    siteTypes: ['fashionCommerce', 'handmadeCommerce'],
    goals: ['sellProduct', 'aov'],
    stack: ['אזור פתיחה', 'רשת קולקציה', 'רצועת אמון מסחרית', 'משלוח והחזרות'],
    buildable: false,
    legacyTemplate: 'professional',
  },
  {
    id: 'giftFinder',
    label: 'מוצא המתנה',
    description: 'שאלון קצר שמוביל להמלצה. למי שקונה מתנה ולא יודע מה לבחור.',
    siteTypes: ['handmadeCommerce', 'fashionCommerce'],
    goals: ['aov', 'sellProduct', 'productUnderstanding'],
    stack: ['אזור פתיחה', 'מוצא המתנה', 'תוצאות מותאמות', 'שובר מתנה', 'משלוח והחזרות'],
    buildable: false,
    legacyTemplate: 'professional',
  },
  {
    id: 'editorialPortfolio',
    label: 'תיק עבודות עריכתי',
    description: 'טיפוגרפיה גדולה ותמונות נושמות. מתאים כשהעבודה מוכרת את עצמה.',
    siteTypes: ['personalBrand', 'fashionCommerce'],
    goals: ['trust', 'leads'],
    stack: ['אזור פתיחה', 'רשת קולקציה', 'למה אנחנו', 'יצירת קשר'],
    buildable: false,
    legacyTemplate: 'professional',
  },
];

/* ------------------------------------------------------------------ style */

export type StyleSystem =
  | 'minimalLuxury'
  | 'editorial'
  | 'highPerformance'
  | 'softOrganic'
  | 'boldDTC'
  | 'clinicalPremium'
  | 'localTrust'
  | 'techPrecision';

/**
 * A visual style, expressed as the design values schema v2 can already store.
 *
 * These are real: the created project carries them, so choosing Minimal Luxury instead of
 * Bold DTC produces a visibly different site today — different palette, different heading
 * face, different corner language, different button weight.
 *
 * `character` describes the axes schema v3 will add in Milestone 2 — spacing rhythm,
 * surface treatment, image treatment, motion, density. It is shown to the user as the
 * style's stated intent so the card is honest about where the system is going.
 */
export interface StyleDefinition {
  id: StyleSystem;
  label: string;
  description: string;
  theme: ThemePreset;
  design: Pick<
    ProjectDesign,
    'primaryColor' | 'secondaryColor' | 'headingFont' | 'bodyFont' | 'radius' | 'buttonStyle'
  >;
  /** Phase 2 axes, currently descriptive. Becomes stored design in Milestone 2. */
  character: { spacing: string; surface: string; motion: string; density: string };
}

export const STYLES: StyleDefinition[] = [
  {
    id: 'minimalLuxury',
    label: 'יוקרה מינימלית',
    description: 'הרבה אוויר, מעט צבע, טיפוגרפיה שקטה. נותן למוצר לדבר.',
    theme: 'luxury',
    design: {
      primaryColor: '#1F1F1F',
      secondaryColor: '#B8912F',
      headingFont: 'Frank Ruehl Libre',
      bodyFont: 'Assistant',
      radius: 'sharp',
      buttonStyle: 'outline',
    },
    character: { spacing: 'נדיב', surface: 'שטוח', motion: 'מאופק', density: 'מרווח' },
  },
  {
    id: 'editorial',
    label: 'עריכתי',
    description: 'כותרות גדולות, ניגודיות חדה, תחושה של מגזין מודפס.',
    theme: 'corporate',
    design: {
      primaryColor: '#141414',
      secondaryColor: '#9A6B3F',
      headingFont: 'Frank Ruehl Libre',
      bodyFont: 'Noto Sans Hebrew',
      radius: 'sharp',
      buttonStyle: 'ghost',
    },
    character: { spacing: 'נדיב', surface: 'שטוח', motion: 'מאופק', density: 'עריכתי' },
  },
  {
    id: 'highPerformance',
    label: 'ביצועים גבוהים',
    description: 'אנרגטי וישיר. צבע חם, קצב מהיר, קריאה לפעולה שלא מתחבאת.',
    theme: 'fitness',
    design: {
      primaryColor: '#E0521A',
      secondaryColor: '#1A1A1A',
      headingFont: 'Heebo',
      bodyFont: 'Heebo',
      radius: 'soft',
      buttonStyle: 'solid',
    },
    character: { spacing: 'הדוק', surface: 'מוגבה', motion: 'אקספרסיבי', density: 'קומפקטי' },
  },
  {
    id: 'softOrganic',
    label: 'רך ואורגני',
    description: 'פינות עגולות, גוונים טבעיים, תחושה מרגיעה ולא מסחרית.',
    theme: 'restaurant',
    design: {
      primaryColor: '#5F7A52',
      secondaryColor: '#C9A227',
      headingFont: 'Assistant',
      bodyFont: 'Assistant',
      radius: 'round',
      buttonStyle: 'solid',
    },
    character: { spacing: 'מאוזן', surface: 'רך', motion: 'עדין', density: 'נוח' },
  },
  {
    id: 'boldDTC',
    label: 'מותג נועז',
    description: 'צבע רווי וטיפוגרפיה עבה. בולט בפיד ובמסך קטן.',
    theme: 'technology',
    design: {
      primaryColor: '#3B2FD6',
      secondaryColor: '#F25C2A',
      headingFont: 'Secular One',
      bodyFont: 'Rubik',
      radius: 'round',
      buttonStyle: 'solid',
    },
    character: { spacing: 'הדוק', surface: 'מוגבה', motion: 'אקספרסיבי', density: 'קומפקטי' },
  },
  {
    id: 'clinicalPremium',
    label: 'קליני יוקרתי',
    description: 'נקי, מדויק ומקצועי. אמון רפואי בלי להיראות סטרילי.',
    theme: 'medical',
    design: {
      primaryColor: '#12545C',
      secondaryColor: '#8FA33F',
      headingFont: 'Heebo',
      bodyFont: 'Assistant',
      radius: 'soft',
      buttonStyle: 'solid',
    },
    character: { spacing: 'מאוזן', surface: 'מוגבה', motion: 'עדין', density: 'נוח' },
  },
  {
    id: 'localTrust',
    label: 'אמון מקומי',
    description: 'חם ונגיש. מרגיש כמו עסק שכונתי שאפשר להתקשר אליו.',
    theme: 'construction',
    design: {
      primaryColor: '#1E5A8A',
      secondaryColor: '#D18521',
      headingFont: 'Rubik',
      bodyFont: 'Assistant',
      radius: 'soft',
      buttonStyle: 'solid',
    },
    character: { spacing: 'מאוזן', surface: 'מוגבה', motion: 'עדין', density: 'נוח' },
  },
  {
    id: 'techPrecision',
    label: 'דיוק טכנולוגי',
    description: 'רשת הדוקה, פינות חדות, תחושה של מוצר תוכנה.',
    theme: 'legal',
    design: {
      primaryColor: '#2B2F5E',
      secondaryColor: '#4E8AE6',
      headingFont: 'Heebo',
      bodyFont: 'Noto Sans Hebrew',
      radius: 'sharp',
      buttonStyle: 'outline',
    },
    character: { spacing: 'הדוק', surface: 'גבולות', motion: 'מאופק', density: 'קומפקטי' },
  },
];

/* --------------------------------------------------------------- lookups */

export const modeById = (id: ProjectMode) => MODES.find((item) => item.id === id) ?? MODES[0];
export const goalById = (id: BusinessGoal) => GOALS.find((item) => item.id === id) ?? GOALS[0];
export const siteTypeById = (id: SiteType) =>
  SITE_TYPES.find((item) => item.id === id) ?? SITE_TYPES[0];
export const archetypeById = (id: Archetype) =>
  ARCHETYPES.find((item) => item.id === id) ?? ARCHETYPES[0];
export const styleById = (id: StyleSystem) => STYLES.find((item) => item.id === id) ?? STYLES[0];

/** Goals that make sense for a mode, in catalog order. Never returns an empty list. */
export function goalsForMode(mode: ProjectMode): GoalDefinition[] {
  const matches = GOALS.filter((goal) => goal.modes.includes(mode));
  return matches.length > 0 ? matches : GOALS;
}

export function siteTypesForGoal(goal: BusinessGoal): SiteTypeDefinition[] {
  const matches = SITE_TYPES.filter((type) => type.goals.includes(goal));
  return matches.length > 0 ? matches : SITE_TYPES;
}

/**
 * Archetypes worth offering, best first.
 *
 * Scored rather than filtered: a hard filter on both axes can empty the step, and an empty
 * step is a dead end. Matching both the site type and the goal ranks first, matching one
 * still appears, and the rest stay reachable below.
 */
export function archetypesFor(siteType: SiteType, goal: BusinessGoal): ArchetypeDefinition[] {
  return [...ARCHETYPES].sort((a, b) => score(b) - score(a));

  function score(item: ArchetypeDefinition): number {
    return (item.siteTypes.includes(siteType) ? 2 : 0) + (item.goals.includes(goal) ? 1 : 0);
  }
}

export function recommendedArchetype(siteType: SiteType, goal: BusinessGoal): ArchetypeDefinition {
  return archetypesFor(siteType, goal)[0];
}

/** The style a site type opens on, so step 5 starts somewhere defensible. */
export function defaultStyleFor(siteType: SiteType): StyleSystem {
  switch (siteType) {
    case 'health':
      return 'clinicalPremium';
    case 'local':
      return 'localTrust';
    case 'professional':
      return 'techPrecision';
    case 'personalBrand':
      return 'editorial';
    case 'fashionCommerce':
      return 'minimalLuxury';
    case 'handmadeCommerce':
      return 'softOrganic';
  }
}
