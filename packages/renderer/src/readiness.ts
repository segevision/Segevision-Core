import { homeSections, mediaSlots, type Project } from './schema';

/**
 * Launch readiness.
 *
 * Deliberately not a gamification score: every point maps to one concrete thing that
 * must be true before a real client site can go live, and every failure names the
 * exact missing item. A number without an explanation would train the user to ignore
 * it, so the ring and the checklist are the same data — one summarised, one itemised.
 */

export type ReadinessGroup = 'content' | 'business' | 'media' | 'seo' | 'forms' | 'publish';

export const READINESS_GROUP_LABELS: Record<ReadinessGroup, string> = {
  content: 'תוכן',
  business: 'פרטי העסק',
  media: 'תמונות',
  seo: 'קידום',
  forms: 'טפסים',
  publish: 'לפני פרסום',
};

export interface ReadinessCheck {
  id: string;
  group: ReadinessGroup;
  /** What passes, stated positively. */
  label: string;
  ok: boolean;
  /** What exactly is missing. Shown only when the check fails. */
  missing: string;
  /** Where to go to fix it — consumed by the editor to jump straight there. */
  fix?: { tab: string; sectionId?: string };
}

export interface ReadinessReport {
  checks: ReadinessCheck[];
  passed: number;
  total: number;
  /** 0–100, rounded. */
  percent: number;
  /** The failures, most useful first. */
  missing: ReadinessCheck[];
}

export function evaluateReadiness(project: Project): ReadinessReport {
  const sections = homeSections(project);
  const enabled = sections.filter((section) => section.enabled);

  const heroSection = enabled.find((section) => section.type === 'hero');
  const hero = heroSection?.content.hero;
  const services = enabled.flatMap((section) => section.content.services ?? []);
  const faq = enabled.flatMap((section) => section.content.faq ?? []);
  const appointmentSection = enabled.find((section) => section.type === 'appointment');
  const appointment = appointmentSection?.content.appointment;

  const slots = mediaSlots(project);
  const filledSlots = slots.filter((slot) => {
    const entry = project.media.find((item) => item.slot === slot.slot);
    return Boolean(entry && entry.src.trim());
  });
  const emptySlots = slots.filter((slot) => !filledSlots.includes(slot));

  const checks: ReadinessCheck[] = [
    {
      id: 'hero-headline',
      group: 'content',
      label: 'כותרת ראשית כתובה',
      ok: Boolean(hero?.headline.trim()),
      missing: 'אזור הפתיחה מציג את שם העסק במקום כותרת',
      fix: { tab: 'content', sectionId: heroSection?.id },
    },
    {
      id: 'hero-cta',
      group: 'content',
      label: 'כפתור ראשי מוגדר',
      ok: Boolean(hero?.primaryCtaLabel.trim()),
      missing: 'אין קריאה לפעולה ראשית בעמוד',
      fix: { tab: 'content', sectionId: heroSection?.id },
    },
    {
      id: 'services',
      group: 'content',
      label: 'יש לפחות שירות אחד',
      ok: services.length > 0,
      missing: 'סעיף השירותים ריק ולכן לא מוצג',
      fix: { tab: 'content' },
    },
    {
      id: 'faq-pending',
      group: 'content',
      label: 'כל התשובות אושרו',
      ok: faq.every((item) => !item.pending),
      missing: `${faq.filter((item) => item.pending).length} תשובות עדיין מסומנות כממתינות לאישור הלקוח`,
      fix: { tab: 'content' },
    },
    {
      id: 'phone',
      group: 'business',
      label: 'טלפון הוזן',
      ok: project.business.phone.trim().length > 0,
      missing: 'מספר הטלפון מוצג באתר כ״ממתין לפרטים״',
      fix: { tab: 'settings-business' },
    },
    {
      id: 'whatsapp',
      group: 'business',
      label: 'וואטסאפ הוזן',
      ok: project.business.whatsapp.trim().length > 0,
      missing: 'כפתור הוואטסאפ לא יופיע באתר',
      fix: { tab: 'settings-business' },
    },
    {
      id: 'address',
      group: 'business',
      label: 'כתובת הוזנה',
      ok: project.business.address.trim().length > 0,
      missing: 'סעיף ההגעה חלקי וללא כתובת מדויקת',
      fix: { tab: 'settings-business' },
    },
    {
      id: 'media',
      group: 'media',
      label: 'כל מסגרות התמונה מולאו',
      ok: slots.length > 0 && emptySlots.length === 0,
      missing:
        slots.length === 0
          ? 'אין מסגרות תמונה פעילות בעמוד'
          : `${emptySlots.length} מסגרות עדיין מציגות מציין מקום: ${emptySlots
              .slice(0, 2)
              .map((slot) => slot.label)
              .join(', ')}${emptySlots.length > 2 ? '…' : ''}`,
      fix: { tab: 'settings-media' },
    },
    {
      id: 'media-alt',
      group: 'media',
      label: 'לכל תמונה יש תיאור נגישות',
      ok: filledSlots.every((slot) => {
        const entry = project.media.find((item) => item.slot === slot.slot);
        return Boolean(entry?.alt.trim());
      }),
      missing: 'יש תמונות בלי תיאור לקוראי מסך',
      fix: { tab: 'settings-media' },
    },
    {
      id: 'seo-title',
      group: 'seo',
      label: 'כותרת וטקסט לגוגל',
      ok: project.seo.title.trim().length > 0 && project.seo.description.trim().length > 0,
      missing: 'חסרים כותרת או תיאור לתוצאות החיפוש',
      fix: { tab: 'settings-seo' },
    },
    {
      id: 'seo-local',
      group: 'seo',
      label: 'אזור גיאוגרפי הוגדר',
      ok: project.seo.localArea.trim().length > 0,
      missing: 'בלי אזור, האתר לא יופיע בחיפושים מקומיים',
      fix: { tab: 'settings-seo' },
    },
    {
      id: 'form-destination',
      group: 'forms',
      label: 'טופס הפנייה מחובר',
      ok: Boolean(appointment?.destination.trim()),
      missing: 'הטופס במצב הדגמה — פניות לא נשלחות לאף אחד',
      fix: { tab: 'content', sectionId: appointmentSection?.id },
    },
    {
      id: 'mobile',
      group: 'publish',
      label: 'סרגל פעולות בנייד פעיל',
      ok: sections.some((section) => section.type === 'mobileBar' && section.enabled),
      missing: 'בנייד אין דרך מהירה להתקשר או לפנות',
      fix: { tab: 'structure' },
    },
    {
      id: 'sections',
      group: 'publish',
      label: 'העמוד מכיל מספיק תוכן',
      ok: enabled.filter((section) => !['header', 'footer', 'mobileBar'].includes(section.type)).length >= 4,
      missing: 'פחות מארבעה סקשני תוכן פעילים בעמוד',
      fix: { tab: 'structure' },
    },
  ];

  const passed = checks.filter((check) => check.ok).length;

  return {
    checks,
    passed,
    total: checks.length,
    percent: Math.round((passed / checks.length) * 100),
    missing: checks.filter((check) => !check.ok),
  };
}
