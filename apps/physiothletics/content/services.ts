import {
  ActivityIcon,
  AwardIcon,
  DumbbellIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  TargetIcon,
} from '@segevision/icons';
import type { FeatureItem, ProcessStep, ServiceItem } from '@segevision/ui';
import { sectionIds } from './navigation';

/**
 * The four service areas confirmed in the research brief: general (orthopaedic)
 * physiotherapy, sports physiotherapy, clinical Pilates and post-surgical
 * rehabilitation. Copy describes method and fit — never outcomes or success rates,
 * which nobody has verified.
 */
export const services: ServiceItem[] = [
  {
    id: 'orthopedic',
    title: 'פיזיותרפיה אורתופדית',
    description:
      'טיפול בכאבים ובפציעות של השרירים, המפרקים והגידים — מכאב גב שמלווה אתכם שנים ועד פציעה שקרתה אתמול. מתחילים באבחון תפקודי מלא, ולא בהנחה שהכאב יעבור מעצמו.',
    icon: StethoscopeIcon,
    tags: ['כאבי גב וצוואר', 'כתף וברך', 'כאב מתמשך'],
    action: { label: 'לבדוק אם זה מתאים לי', href: `#${sectionIds.pain}` },
  },
  {
    id: 'sports',
    title: 'פיזיותרפיה ספורטיבית',
    description:
      'ליווי ספורטאים חובבים ותחרותיים מרגע הפציעה ועד החזרה המלאה לאימונים. מתייחסים לעומסי האימון האמיתיים שלכם, לענף שאתם עוסקים בו ולתאריך שאתם רוצים לחזור אליו.',
    icon: ActivityIcon,
    tags: ['ריצה', 'כדורגל וכדורסל', 'קרוספיט ואימוני כוח', 'רכיבה'],
    action: { label: 'לקביעת תור', href: `#${sectionIds.appointment}` },
  },
  {
    id: 'pilates',
    title: 'פילאטיס קליני',
    description:
      'פילאטיס בהנחיית פיזיותרפיסט, שנבנה סביב האבחנה שלכם ולא סביב שיעור אחיד. עובדים על שליטה, כוח ויציבות בטווחים שהגוף שלכם צריך — כהמשך טבעי לטיפול או כדרך למנוע חזרה של הכאב.',
    icon: TargetIcon,
    tags: ['המשך לטיפול', 'מניעת פציעות חוזרות', 'עבודה על שליטה וכוח'],
    action: { label: 'לשאול אם זה מתאים לי', href: `#${sectionIds.appointment}` },
  },
  {
    id: 'post-op',
    title: 'שיקום לאחר ניתוח',
    description:
      'תוכנית שיקום מובנית לאחר ניתוחים אורתופדיים — ברך, כתף, ירך ועמוד שדרה — ולאחר תאונות דרכים ותאונות עבודה. מתקדמים לפי שלבים ולפי יעדים מדידים, בקצב שהרקמה באמת מוכנה אליו.',
    icon: ShieldCheckIcon,
    tags: ['אחרי ניתוח', 'שיקום לאחר תאונה', 'חזרה מדורגת לעומס'],
    action: { label: 'לתאם שיחה', href: `#${sectionIds.appointment}` },
  },
];

export const processSteps: ProcessStep[] = [
  {
    id: 'assessment',
    title: 'אבחון',
    description:
      'פגישה ראשונה מלאה: מה קרה, מה מגביל אתכם ביום-יום, ובדיקה תפקודית של התנועה, הכוח והטווחים.',
    outcome: 'יוצאים עם תמונה ברורה של המצב',
  },
  {
    id: 'diagnosis',
    title: 'הסבר ואבחנה',
    description:
      'מסבירים בשפה פשוטה מה מצאנו, מה כנראה מקור הכאב ומה לא. בלי מונחים מפחידים ובלי לגלגל אתכם לבדיקות מיותרות.',
    outcome: 'מבינים למה כואב ומה הצעד הבא',
  },
  {
    id: 'plan',
    title: 'תוכנית טיפול אישית',
    description:
      'בונים יחד תוכנית שמתאימה ללוח הזמנים, לענף הספורט וליעד שהצבתם — כולל מה עושים בקליניקה ומה עושים בבית.',
    outcome: 'יעד חזרה מוגדר, לא הבטחה כללית',
  },
  {
    id: 'rehab',
    title: 'שיקום אקטיבי',
    description:
      'עובדים בתנועה: טיפול ידני היכן שצריך, אבל בעיקר תרגול מדורג שמחזיר כוח, שליטה וביטחון בגוף.',
    outcome: 'מתקדמים בעומס בקצב מבוקר',
  },
  {
    id: 'return',
    title: 'חזרה לפעילות ולספורט',
    description:
      'סוגרים את המעגל עם קריטריונים לחזרה בטוחה, ועם הכלים לשמור על מה שהשגתם גם אחרי שהטיפול הסתיים.',
    outcome: 'חוזרים למגרש, לא רק מפסיקים לכאוב',
  },
];

/**
 * Differentiators taken directly from the competitive analysis: international
 * training, senior-led care (no rotating juniors), pain-science approach, and the
 * local anchor no Hadera/Netanya competitor can match.
 */
export const whyPoints: FeatureItem[] = [
  {
    id: 'training',
    title: 'הכשרה בינלאומית',
    description:
      'שני המטפלים בקליניקה הוכשרו באוסטרליה בפיזיותרפיה של מערכת השרירים והשלד ובשיקום פציעות ספורט, ומחזיקים בתואר MMuscSklSportPhysio.',
    icon: AwardIcon,
  },
  {
    id: 'senior',
    title: 'טיפול בידיים של הבכירים',
    description:
      'הקליניקה מנוהלת ומאוישת על ידי מייסדיה. מי שבודק אתכם בפגישה הראשונה הוא גם מי שמלווה אתכם עד הסוף — בלי העברות בין מטפלים מתחלפים.',
    icon: DumbbellIcon,
  },
  {
    id: 'evidence',
    title: 'גישה מבוססת ראיות',
    description:
      'עובדים לפי הידע העדכני על כאב ועל עומסים, עם דגש על הסבר והבנה. פחות טיפולים פסיביים שמרגישים טוב לרגע, יותר שינוי אמיתי בתפקוד.',
    icon: ActivityIcon,
  },
  {
    id: 'local',
    title: 'קליניקה מקומית בעמק חפר',
    description:
      'מומחיות בשיקום ספורט במרחק נסיעה קצר מהבית, בגבעת חיים איחוד — במקום נסיעה לחדרה, לנתניה או למרכז אחרי כל טיפול.',
    icon: TargetIcon,
  },
];
