import type { PlaceholderEntry } from '@segevision/ui';

/**
 * Single source of truth for everything the site does not yet know.
 *
 * Rule for this file: if a detail is not confirmed in the approved research brief,
 * it appears here and renders with a visible marker on the page. Nothing is quietly
 * filled in with a plausible guess — a client cannot correct a detail they were
 * never told was invented.
 */

export interface PhoneCandidate {
  id: string;
  value: string;
  source: string;
}

/**
 * The research brief found the same two numbers labelled in opposite roles by two
 * sources, so neither can be published. Both are recorded; the site shows a
 * development value until the owner confirms which is the public line.
 */
export const phoneCandidates: PhoneCandidate[] = [
  {
    id: 'candidate-a',
    value: '04-6860086',
    source: 'האתר הקיים — מסומן כטלפון הקליניקה',
  },
  {
    id: 'candidate-b',
    value: '04-6369053',
    source: 'האתר הקיים — מסומן כפקס, אך בבריף הפרויקט מופיע כטלפון הציבורי',
  },
];

/** Deliberately non-routable. Never replace this with one of the candidates without owner confirmation. */
export const DEV_PHONE_DISPLAY = '04-000-0000';
export const DEV_PHONE_HREF = 'tel:+972400000000';
export const DEV_WHATSAPP_HREF = 'https://wa.me/972000000000';

export const placeholderEntries: PlaceholderEntry[] = [
  {
    id: 'phone-number',
    area: 'יצירת קשר · כותרת עליונה · סרגל נייד',
    item: 'מספר הטלפון הציבורי של הקליניקה',
    status: 'conflict',
    currentValue: `${DEV_PHONE_DISPLAY} (ערך פיתוח בלבד)`,
    candidates: phoneCandidates.map((candidate) => `${candidate.value} — ${candidate.source}`),
    note: 'שני המספרים מופיעים בתפקידים הפוכים בין האתר הקיים לבריף הפרויקט. יש לאמת מול בעלי הקליניקה לפני עלייה לאוויר.',
  },
  {
    id: 'whatsapp-number',
    area: 'כותרת עליונה · סרגל נייד · יצירת קשר',
    item: 'מספר וואטסאפ עסקי',
    status: 'missing',
    currentValue: 'קישור זמני שאינו מחובר למספר אמיתי',
    note: 'לא ידוע אם קיים קו וואטסאפ נפרד או שהוא זהה לטלפון הקליניקה.',
  },
  {
    id: 'street-address',
    area: 'יצירת קשר · כותרת תחתונה',
    item: 'כתובת מדויקת בתוך גבעת חיים איחוד',
    status: 'missing',
    currentValue: 'גבעת חיים איחוד, עמק חפר',
    note: 'היישוב מאומת. שם הרחוב, מספר המבנה והוראות ההגעה והחניה טרם התקבלו, ולכן מוצג מציין מקום למפה במקום מפה חיה.',
  },
  {
    id: 'opening-hours',
    area: 'יצירת קשר',
    item: 'שעות פעילות הקליניקה',
    status: 'missing',
    currentValue: 'טבלת שעות עם ערכי דוגמה מסומנים',
    note: 'השעות המוצגות הן מבנה לעיצוב בלבד ואינן שעות אמת.',
  },
  {
    id: 'email',
    area: 'יצירת קשר · כותרת תחתונה',
    item: 'כתובת דוא״ל לפניות',
    status: 'missing',
    note: 'לא הופיעה בחומרי המקור.',
  },
  {
    id: 'pricing-insurance',
    area: 'שאלות ותשובות',
    item: 'מחירון והסדרי החזר מול קופות חולים וביטוחים משלימים',
    status: 'missing',
    note: 'מסומן בבריף כפריט פתוח לאישור הלקוח. התשובה באתר מנוסחת כללית ומסומנת כממתינה לאישור.',
  },
  {
    id: 'session-count',
    area: 'שאלות ותשובות',
    item: 'מספר המפגשים האופייני בקליניקה',
    status: 'missing',
    note: 'לא קיים נתון מאומת. התשובה מנוסחת ללא מספרים ומסומנת כממתינה לאישור.',
  },
  {
    id: 'explain-pain-role',
    area: 'סעיף Explain Pain',
    item: 'אופי המעורבות המדויק במהדורה העברית של Explain Pain',
    status: 'assumed',
    currentValue: 'מנוסח כ״קשר להוצאה העברית״ בלבד',
    note: 'הבריף מאשר זיקה לספר, אך לא את התפקיד המדויק (תרגום, עריכה מקצועית, הפצה או הדרכה). הניסוח באתר נשמר מכוון-כללי עד לאישור.',
  },
  {
    id: 'team-bios',
    area: 'הצוות',
    item: 'ביוגרפיות מלאות והתמחויות נוספות של המטפלים',
    status: 'missing',
    currentValue: 'התארים MMuscSklSportPhysio ו-BPT בלבד — מאומתים בבריף',
    note: 'הבריף מציין במפורש שביוגרפיות מעבר למידע הפומבי טרם התקבלו. הטקסטים הנוכחיים מתארים גישת טיפול ולא ניסיון אישי לא מאומת.',
  },
  {
    id: 'photography',
    area: 'כל האתר',
    item: 'צילומי קליניקה, צוות ומטופלים',
    status: 'missing',
    currentValue: 'מציני מקום מעוצבים עם הנחיות צילום',
    note: 'נדרש יום צילום. עד אליו כל מסגרת תמונה מציגה את ההנחיה לצילום המיועד.',
  },
  {
    id: 'testimonials',
    area: 'עמוד הבית',
    item: 'המלצות מטופלים',
    status: 'missing',
    note: 'הבריף מציין שיש לברר אם ניתן לאסוף המלצות אמיתיות. עד אז לא נוסף סעיף המלצות כלל — עדיף היעדר סעיף על פני המלצות ממוצאות.',
  },
  {
    id: 'social-links',
    area: 'כותרת תחתונה',
    item: 'קישורים לפייסבוק ולאינסטגרם',
    status: 'missing',
    currentValue: 'קישורים מושבתים',
    note: 'לא ידוע אם לקליניקה יש נוכחות פעילה ברשתות החברתיות.',
  },
  {
    id: 'legal-pages',
    area: 'כותרת תחתונה',
    item: 'תקנון, מדיניות פרטיות והצהרת נגישות',
    status: 'missing',
    currentValue: 'קישורים ללא יעד',
    note: 'נדרשים לפני עלייה לאוויר, במיוחד הצהרת הנגישות ומדיניות הפרטיות בשל טופס יצירת הקשר.',
  },
  {
    id: 'form-backend',
    area: 'בקשת תור',
    item: 'יעד לשליחת טופס בקשת התור',
    status: 'missing',
    currentValue: 'הדגמה בלבד — הטופס אינו שולח פנייה',
    note: 'נדרשת החלטה: שליחה לדוא״ל, מערכת ניהול תורים או וואטסאפ עסקי.',
  },
];
