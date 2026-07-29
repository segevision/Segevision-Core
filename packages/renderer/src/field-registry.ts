import type { SectionType } from './schema';

/**
 * The editable-field registry.
 *
 * One declaration per addressable field, consumed by four features at once:
 * click-to-edit in the preview, command-palette search, editor scroll-and-highlight,
 * and (later) AI editing actions. Because all four read the same table, a field can
 * never be reachable by one route and invisible to another.
 *
 * Paths are *relative to a section instance* and resolved against it at runtime, e.g.
 * `content.hero.headline` inside section `sec-hero-1`. The renderer stamps the full
 * address onto the DOM as `data-edit-path="<sectionId>::content.hero.headline"`, so
 * identification never depends on element position — a variant may reorder or replace
 * every node it likes and the contract still holds.
 */

export type EditorTab = 'overview' | 'content' | 'sections' | 'design' | 'media' | 'seo' | 'forms';

export interface EditableFieldDefinition {
  /** Section-relative path, e.g. `content.hero.headline`. */
  path: string;
  /** Which section type exposes this field. */
  sectionType: SectionType;
  tab: EditorTab;
  /** Hebrew label shown in the palette and on the highlight badge. */
  label: string;
  /** Extra Hebrew terms someone might search for. */
  keywords: string[];
  /** Group heading inside the editor panel, for orientation after a jump. */
  group: string;
}

export const EDITABLE_FIELDS: EditableFieldDefinition[] = [
  {
    path: 'content.hero.headline',
    sectionType: 'hero',
    tab: 'content',
    label: 'כותרת ראשית',
    keywords: ['כותרת', 'הירו', 'פתיחה', 'headline'],
    group: 'אזור הפתיחה',
  },
  {
    path: 'content.hero.headlineSecondary',
    sectionType: 'hero',
    tab: 'content',
    label: 'שורה שנייה בכותרת',
    keywords: ['כותרת משנה', 'שורה שנייה'],
    group: 'אזור הפתיחה',
  },
  {
    path: 'content.hero.subheadline',
    sectionType: 'hero',
    tab: 'content',
    label: 'פסקת פתיחה',
    keywords: ['תיאור', 'פסקה', 'תת כותרת'],
    group: 'אזור הפתיחה',
  },
  {
    path: 'content.hero.eyebrow',
    sectionType: 'hero',
    tab: 'content',
    label: 'כותרת עליונה קטנה',
    keywords: ['אייברו', 'תווית'],
    group: 'אזור הפתיחה',
  },
  {
    path: 'content.hero.primaryCtaLabel',
    sectionType: 'hero',
    tab: 'content',
    label: 'כפתור ראשי',
    keywords: ['קריאה לפעולה', 'CTA', 'כפתור'],
    group: 'אזור הפתיחה',
  },
  {
    path: 'content.hero.secondaryCtaLabel',
    sectionType: 'hero',
    tab: 'content',
    label: 'כפתור משני',
    keywords: ['קריאה לפעולה משנית', 'כפתור'],
    group: 'אזור הפתיחה',
  },
  {
    path: 'content.heading.title',
    sectionType: 'services',
    tab: 'content',
    label: 'כותרת סעיף השירותים',
    keywords: ['כותרת', 'שירותים'],
    group: 'שירותים',
  },
  {
    path: 'content.services.0.title',
    sectionType: 'services',
    tab: 'content',
    label: 'שם השירות הראשון',
    keywords: ['שירות', 'טיפול', 'מוצר'],
    group: 'שירותים',
  },
  {
    path: 'content.services.0.description',
    sectionType: 'services',
    tab: 'content',
    label: 'תיאור השירות הראשון',
    keywords: ['שירות', 'תיאור'],
    group: 'שירותים',
  },
  {
    path: 'content.trustPoints.0.title',
    sectionType: 'trust',
    tab: 'content',
    label: 'נקודת אמון ראשונה',
    keywords: ['אמון', 'ותק', 'הסמכה'],
    group: 'רצועת אמון',
  },
  {
    path: 'content.faq.0.question',
    sectionType: 'faq',
    tab: 'content',
    label: 'שאלה ראשונה',
    keywords: ['שאלות', 'שאלה', 'FAQ'],
    group: 'שאלות נפוצות',
  },
  {
    path: 'content.faq.0.answer',
    sectionType: 'faq',
    tab: 'content',
    label: 'תשובה ראשונה',
    keywords: ['שאלות', 'תשובה'],
    group: 'שאלות נפוצות',
  },
  {
    path: 'business.phone',
    sectionType: 'contact',
    tab: 'overview',
    label: 'טלפון',
    keywords: ['טלפון', 'מספר', 'חיוג', 'קשר'],
    group: 'פרטי העסק',
  },
  {
    path: 'business.address',
    sectionType: 'contact',
    tab: 'overview',
    label: 'כתובת',
    keywords: ['כתובת', 'מיקום', 'הגעה'],
    group: 'פרטי העסק',
  },
  {
    path: 'business.email',
    sectionType: 'contact',
    tab: 'overview',
    label: 'דוא״ל',
    keywords: ['מייל', 'אימייל', 'דואר'],
    group: 'פרטי העסק',
  },
];

/** Fields whose value lives on the project, not inside a section instance. */
export const PROJECT_LEVEL_PREFIXES = ['business.', 'design.', 'seo.'];

export function isProjectLevelPath(path: string): boolean {
  return PROJECT_LEVEL_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/** Composes the DOM attribute value the renderer stamps on an editable element. */
export function editPath(sectionId: string, path: string): string {
  return isProjectLevelPath(path) ? path : `${sectionId}::${path}`;
}

export interface ResolvedEditPath {
  sectionId?: string;
  path: string;
}

export function parseEditPath(value: string): ResolvedEditPath {
  const index = value.indexOf('::');
  if (index === -1) return { path: value };
  return { sectionId: value.slice(0, index), path: value.slice(index + 2) };
}

export function findField(path: string): EditableFieldDefinition | undefined {
  return EDITABLE_FIELDS.find((field) => field.path === path);
}

/** The DOM id the editor gives a field control, so a jump can focus it. */
export function fieldDomId(sectionId: string | undefined, path: string): string {
  return `field--${(sectionId ? `${sectionId}--` : '') + path}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}
