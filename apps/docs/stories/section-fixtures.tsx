import * as React from 'react';
import {
  ActivityIcon,
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  DumbbellIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  TargetIcon,
  WhatsAppIcon,
} from '@segevision/icons';
import type {
  AppointmentFormCopy,
  ContactChannel,
  FAQItem,
  FeatureItem,
  NavItem,
  PlaceholderEntry,
  ProblemOption,
  ProcessStep,
  ServiceItem,
  TeamMember,
  TrustItem,
} from '@segevision/ui';

/**
 * Neutral sample data shared by the section stories. Deliberately generic clinic
 * content rather than a real client's copy — a story that only looks right with one
 * client's text is not documenting a reusable component.
 */

export const navItems: NavItem[] = [
  { label: 'שירותים', href: '#services' },
  { label: 'התהליך', href: '#process' },
  { label: 'הצוות', href: '#team' },
  { label: 'שאלות נפוצות', href: '#faq' },
];

export const trustItems: TrustItem[] = [
  { icon: CalendarIcon, title: 'פעילים מאז 2011', description: 'למעלה מעשור של עבודה עם מטופלים מהאזור.' },
  { icon: AwardIcon, title: 'הכשרה בינלאומית', description: 'תואר שני בפיזיותרפיה של מערכת השרירים והשלד.' },
  { icon: BookOpenIcon, title: 'גישה מבוססת ראיות', description: 'עבודה לפי הידע העדכני על כאב ועל עומסים.' },
];

export const services: ServiceItem[] = [
  {
    id: 'ortho',
    title: 'פיזיותרפיה אורתופדית',
    description: 'טיפול בכאבים ובפציעות של השרירים, המפרקים והגידים, מתוך אבחון תפקודי מלא.',
    icon: StethoscopeIcon,
    tags: ['גב וצוואר', 'כתף וברך'],
    action: { label: 'קראו עוד', href: '#' },
  },
  {
    id: 'sports',
    title: 'פיזיותרפיה ספורטיבית',
    description: 'ליווי ספורטאים מרגע הפציעה ועד החזרה המלאה לאימונים ולתחרויות.',
    icon: ActivityIcon,
    tags: ['ריצה', 'אימוני כוח'],
    action: { label: 'קראו עוד', href: '#' },
  },
  {
    id: 'pilates',
    title: 'פילאטיס קליני',
    description: 'אימון בהנחיית פיזיותרפיסט שנבנה סביב האבחנה האישית ולא סביב שיעור אחיד.',
    icon: TargetIcon,
    action: { label: 'קראו עוד', href: '#' },
  },
  {
    id: 'postop',
    title: 'שיקום לאחר ניתוח',
    description: 'תוכנית מובנית לאחר ניתוחים אורתופדיים, לפי שלבים ולפי יעדים מדידים.',
    icon: ShieldCheckIcon,
    action: { label: 'קראו עוד', href: '#' },
  },
];

export const featureItems: FeatureItem[] = [
  { id: 'a', title: 'הכשרה בינלאומית', description: 'לימודי המשך בחו״ל בתחום השיקום הספורטיבי.', icon: AwardIcon },
  { id: 'b', title: 'מטפלים בכירים', description: 'אותו מטפל מלווה אתכם מהאבחון ועד החזרה לפעילות.', icon: DumbbellIcon },
  { id: 'c', title: 'גישה מבוססת ראיות', description: 'פחות טיפולים פסיביים, יותר שינוי אמיתי בתפקוד.', icon: ActivityIcon },
  { id: 'd', title: 'קליניקה מקומית', description: 'מומחיות בשיקום ספורט במרחק נסיעה קצר מהבית.', icon: TargetIcon },
];

export const processSteps: ProcessStep[] = [
  { id: '1', title: 'אבחון', description: 'בדיקה תפקודית מלאה של התנועה, הכוח והטווחים.', outcome: 'תמונת מצב ברורה' },
  { id: '2', title: 'הסבר ואבחנה', description: 'הסבר בשפה פשוטה מה מצאנו ומה מקור הכאב.', outcome: 'מבינים מה קורה' },
  { id: '3', title: 'תוכנית אישית', description: 'תוכנית שמתאימה ללוח הזמנים וליעד שהצבתם.', outcome: 'יעד מוגדר' },
  { id: '4', title: 'שיקום אקטיבי', description: 'תרגול מדורג שמחזיר כוח, שליטה וביטחון.', outcome: 'התקדמות מבוקרת' },
  { id: '5', title: 'חזרה לפעילות', description: 'קריטריונים לחזרה בטוחה וכלים לשימור התוצאה.', outcome: 'חוזרים למגרש' },
];

export const painOptions: ProblemOption[] = [
  {
    id: 'back',
    label: 'גב',
    headline: 'כאבי גב תחתון ועליון',
    description: 'מתחילים בבדיקה תפקודית ומחזירים תנועה בהדרגה, בלי להימנע מפעילות.',
    points: ['בדיקה של עמוד השדרה והאגן', 'הסבר ברור מה קורה', 'תרגול מדורג'],
    action: { label: 'לקביעת תור', href: '#' },
  },
  {
    id: 'knee',
    label: 'ברך',
    headline: 'כאבי ברך ופציעות רצים',
    description: 'הברך זקוקה לעומס נכון, לא למנוחה מוחלטת. מודדים, מגדירים יעד ומתקדמים.',
    points: ['הערכת כוח ויציבות', 'תוכנית עומסים מדורגת', 'יעדים מדידים לחזרה לריצה'],
    action: { label: 'לקביעת תור', href: '#' },
  },
  {
    id: 'shoulder',
    label: 'כתף',
    headline: 'כאבי כתף והגבלות תנועה',
    description: 'מאתרים מה מגביל — כוח, טווח או שליטה — ובונים תוכנית בהתאם.',
    points: ['אבחנה מדויקת', 'חיזוק מדורג', 'חזרה לספורט מעל גובה הראש'],
    action: { label: 'לקביעת תור', href: '#' },
  },
];

export const painDisclaimer =
  'המידע כאן כללי בלבד ואינו מהווה אבחנה או ייעוץ רפואי אישי. אבחנה נקבעת רק בבדיקה פרונטלית.';

export const teamMembers: TeamMember[] = [
  {
    id: 'a',
    name: 'ישראל ישראלי',
    role: 'פיזיותרפיסט · מייסד הקליניקה',
    credentials: ['תואר שני בפיזיותרפיה של מערכת השרירים והשלד', 'תואר ראשון בפיזיותרפיה'],
    bio: 'מלווה ספורטאים חובבים ותחרותיים בדרך חזרה לפעילות מלאה.',
    photo: { label: 'פורטרט של המטפל בקליניקה', note: 'צילום אנכי, אור טבעי.' },
  },
  {
    id: 'b',
    name: 'ישראלה ישראלי',
    role: 'פיזיותרפיסטית',
    credentials: ['תואר שני בפיזיותרפיה של מערכת השרירים והשלד', 'הכשרה בפילאטיס קליני'],
    bio: 'מטפלת בכאב אורתופדי ומתמשך ובשיקום לאחר ניתוחים.',
    photo: { label: 'פורטרט של המטפלת בקליניקה' },
  },
];

export const faqItems: FAQItem[] = [
  {
    id: 'referral',
    question: 'האם צריך הפניה מרופא כדי להגיע?',
    answer: ['לא. לטיפול פרטי אפשר לקבוע תור ישירות, בלי הפניה ובלי המתנה בתור.'],
  },
  {
    id: 'sessions',
    question: 'כמה מפגשים בדרך כלל נדרשים?',
    answer: ['זה תלוי בסוג הפציעה, בוותק שלה וביעד שהצבתם.'],
    pending: true,
  },
  {
    id: 'bring',
    question: 'מה כדאי להביא לפגישה הראשונה?',
    answer: ['בגדים נוחים שמאפשרים תנועה, ונעלי הספורט שבהן אתם מתאמנים בפועל.'],
  },
];

export const contactChannels: ContactChannel[] = [
  {
    id: 'address',
    icon: MapPinIcon,
    label: 'כתובת',
    value: 'רחוב הדוגמה 1, עיר',
    note: 'חניה חופשית בסמוך לקליניקה.',
  },
  { id: 'phone', icon: PhoneIcon, label: 'טלפון', value: '04-000-0000', href: 'tel:+972400000000' },
  {
    id: 'whatsapp',
    icon: WhatsAppIcon,
    label: 'וואטסאפ',
    value: 'שליחת הודעה',
    href: '#',
    pending: true,
  },
];

export const appointmentCopy: AppointmentFormCopy = {
  fullName: { label: 'שם מלא', placeholder: 'איך לפנות אליכם?', error: 'נשמח לדעת איך קוראים לכם' },
  phone: {
    label: 'טלפון',
    placeholder: '050-0000000',
    hint: 'לשם החזרה אליכם בלבד',
    error: 'נראה שנפלה טעות במספר. אפשר לבדוק שוב?',
  },
  topic: {
    label: 'מה מטריד אתכם?',
    placeholder: 'בחרו אזור או נושא',
    error: 'בחרו נושא כדי שנדע למי להעביר את הפנייה',
    options: [
      { value: 'back', label: 'גב' },
      { value: 'knee', label: 'ברך' },
      { value: 'other', label: 'משהו אחר' },
    ],
  },
  preferredTime: {
    label: 'מתי נוח שנחזור אליכם?',
    placeholder: 'לא משנה, מתי שנוח לכם',
    options: [
      { value: 'morning', label: 'בבוקר' },
      { value: 'evening', label: 'בערב' },
    ],
  },
  message: { label: 'רוצים להוסיף משהו?', placeholder: 'מתי זה התחיל ומה מחמיר', hint: 'לא חובה' },
  submit: 'שליחת בקשה',
  submitting: 'שולחים…',
  success: {
    title: 'הבקשה נקלטה',
    body: 'נחזור אליכם טלפונית לתיאום מועד. זו בקשה לתור ולא אישור.',
    again: 'שליחת בקשה נוספת',
  },
  disclaimer: 'שליחת הטופס היא בקשה לתיאום תור בלבד ואינה מהווה אישור.',
};

export const placeholderEntries: PlaceholderEntry[] = [
  {
    id: 'phone',
    area: 'יצירת קשר',
    item: 'מספר הטלפון הציבורי',
    status: 'conflict',
    currentValue: '04-000-0000 (ערך פיתוח)',
    candidates: ['04-1111111 — מהאתר הקיים', '04-2222222 — מבריף הפרויקט'],
    note: 'יש לאמת מול הלקוח לפני עלייה לאוויר.',
  },
  { id: 'hours', area: 'יצירת קשר', item: 'שעות פעילות', status: 'missing' },
  { id: 'photos', area: 'כל האתר', item: 'צילומי קליניקה וצוות', status: 'missing' },
];

/** Sections are full-bleed; the docs preview adds padding, so stories undo it. */
export const FullBleed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ margin: '-1.5rem' }}>{children}</div>
);
