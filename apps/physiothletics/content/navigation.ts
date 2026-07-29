import type { FooterColumn, FooterLink, NavItem } from '@segevision/ui';

/** Section ids — the single place anchors are defined, so nav and page cannot drift. */
export const sectionIds = {
  hero: 'hero',
  pain: 'pain',
  services: 'services',
  process: 'process',
  approach: 'approach',
  team: 'team',
  faq: 'faq',
  contact: 'contact',
  appointment: 'appointment',
} as const;

/**
 * Ordered by visitor intent, not by org chart: someone in pain wants to know
 * "do you treat my problem" before "who are you".
 */
export const primaryNav: NavItem[] = [
  { label: 'איפה כואב?', href: `#${sectionIds.pain}` },
  { label: 'טיפולים', href: `#${sectionIds.services}` },
  { label: 'תהליך השיקום', href: `#${sectionIds.process}` },
  { label: 'הצוות', href: `#${sectionIds.team}` },
  { label: 'שאלות נפוצות', href: `#${sectionIds.faq}` },
  { label: 'הגעה ויצירת קשר', href: `#${sectionIds.contact}` },
];

export const footerColumns: FooterColumn[] = [
  {
    id: 'treatments',
    title: 'טיפולים',
    links: [
      { label: 'פיזיותרפיה אורתופדית', href: `#${sectionIds.services}` },
      { label: 'פיזיותרפיה ספורטיבית', href: `#${sectionIds.services}` },
      { label: 'פילאטיס קליני', href: `#${sectionIds.services}` },
      { label: 'שיקום לאחר ניתוח', href: `#${sectionIds.services}` },
    ],
  },
  {
    id: 'clinic',
    title: 'הקליניקה',
    links: [
      { label: 'הגישה שלנו', href: `#${sectionIds.approach}` },
      { label: 'תהליך השיקום', href: `#${sectionIds.process}` },
      { label: 'הצוות', href: `#${sectionIds.team}` },
      { label: 'שאלות נפוצות', href: `#${sectionIds.faq}` },
    ],
  },
];

export const legalLinks: FooterLink[] = [
  { label: 'תקנון', href: '#' },
  { label: 'מדיניות פרטיות', href: '#' },
  { label: 'הצהרת נגישות', href: '#' },
];
