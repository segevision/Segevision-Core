/**
 * Physiothletics as a platform project.
 *
 * This is a *sample project*, not a special case: it is written to storage on first
 * run and from that moment behaves exactly like any project created in the wizard.
 * The platform contains no Physiothletics-specific code paths.
 *
 * Every fact below comes from the approved research brief. The phone number is
 * Authored in the v1 shape on purpose: it is passed through migrateProject() on
 * seed, so a fresh install exercises exactly the same code path an old stored file
 * takes. A migration that only runs on legacy data is a migration nobody tests.
 *
 * The phone number is deliberately a development value — the brief found two numbers
 * (04-6860086 listed as phone, 04-6369053 listed as fax but named as the public line
 * in the project brief) and neither may be published until the owner confirms.
 */
export const physiothleticsProjectV1 = {
  id: 'prj_physiothletics',
  name: 'פיזיותלטיקס',
  slug: 'physiothletics',
  industry: 'פיזיותרפיה ושיקום ספורט',
  language: 'he',
  direction: 'rtl',
  template: 'medical',
  theme: 'medical',
  status: 'review',
  business: {
    displayName: 'פיזיותלטיקס',
    tagline: 'פיזיותרפיה ושיקום ספורט',
    foundedYear: '2011',
    location: 'גבעת חיים איחוד, עמק חפר',
    address: 'גבעת חיים איחוד, עמק חפר',
    phone: '04-000-0000',
    whatsapp: '',
    email: '',
    hours: [
      { id: 'h1', days: 'ראשון – חמישי', hours: '08:00 – 19:00' },
      { id: 'h2', days: 'שישי', hours: '08:00 – 12:00' },
      { id: 'h3', days: 'שבת', hours: 'סגור' },
    ],
    hoursNote: 'השעות המוצגות הן מבנה לעיצוב בלבד ואינן שעות הפעילות בפועל.',
  },
  design: {
    primaryColor: '#12545C',
    secondaryColor: '#8FA33F',
    backgroundMode: 'light',
    headingFont: 'Heebo',
    bodyFont: 'Assistant',
    radius: 'soft',
    buttonStyle: 'solid',
  },
  navigation: [
    { id: 'nav-1', label: 'טיפולים', href: '#services' },
    { id: 'nav-2', label: 'תהליך השיקום', href: '#process' },
    { id: 'nav-3', label: 'הצוות', href: '#team' },
    { id: 'nav-4', label: 'שאלות נפוצות', href: '#faq' },
    { id: 'nav-5', label: 'הגעה ויצירת קשר', href: '#contact' },
  ],
  pages: [
    {
      id: 'home',
      title: 'עמוד הבית',
      path: '/',
      isHome: true,
      sections: [
        { id: 'header', type: 'header', enabled: true },
        { id: 'hero', type: 'hero', enabled: true },
        { id: 'trust', type: 'trust', enabled: true },
        { id: 'services', type: 'services', enabled: true },
        { id: 'process', type: 'process', enabled: true },
        { id: 'features', type: 'features', enabled: true },
        { id: 'team', type: 'team', enabled: true },
        { id: 'faq', type: 'faq', enabled: true },
        { id: 'contact', type: 'contact', enabled: true },
        { id: 'appointment', type: 'appointment', enabled: true },
        { id: 'mobileBar', type: 'mobileBar', enabled: true },
        { id: 'footer', type: 'footer', enabled: true },
      ],
    },
  ],
  content: {
    hero: {
      eyebrow: 'פיזיותרפיה ושיקום ספורט · עמק חפר',
      headline: 'לחזור לספורט.',
      headlineSecondary: 'לא רק להפסיק לכאוב.',
      subheadline:
        'קליניקת בוטיק בגבעת חיים איחוד, בהובלת שני פיזיותרפיסטים שהוכשרו באוסטרליה. אנחנו לא עוצרים ברגע שהכאב שוכך — בונים איתכם דרך חזרה לרוץ, להרים ולשחק בביטחון מלא.',
      primaryCtaLabel: 'לקביעת תור',
      primaryCtaHref: '#appointment',
      secondaryCtaLabel: 'שיחה בוואטסאפ',
      secondaryCtaHref: '#contact',
      mediaLabel: 'ספורטאי בשלב שיקום אקטיבי בקליניקה',
      mediaNote: 'צילום אנכי, אור טבעי, רגע של עבודה אמיתית — לא פוזה מבוימת.',
    },
    trustPoints: [
      {
        id: 'trust-1',
        title: 'קליניקה עצמאית מאז 2011',
        description: 'למעלה מעשור של עבודה עם מטופלים מגבעת חיים ומיישובי עמק חפר, השרון וחדרה.',
      },
      {
        id: 'trust-2',
        title: 'הכשרה מקצועית באוסטרליה',
        description:
          'שני המטפלים בעלי תואר שני בפיזיותרפיה של מערכת השרירים והשלד ובפציעות ספורט (MMuscSklSportPhysio).',
      },
      {
        id: 'trust-3',
        title: 'קשר להוצאה העברית של Explain Pain',
        description: 'הגישה המבוססת-ראיות להסבר כאב היא חלק מהעבודה היום-יומית בקליניקה.',
      },
    ],
    servicesHeading: {
      eyebrow: 'תחומי הטיפול',
      title: 'ארבעה מסלולים, אותה רמת ליווי',
      lead: 'כל מסלול נבנה סביב אבחנה אישית. מה שמשותף לכולם: אתם מבינים מה קורה לכם, ויודעים מה השלב הבא.',
    },
    services: [
      {
        id: 'srv-ortho',
        title: 'פיזיותרפיה אורתופדית',
        description:
          'טיפול בכאבים ובפציעות של השרירים, המפרקים והגידים — מכאב גב שמלווה אתכם שנים ועד פציעה שקרתה אתמול.',
        tags: ['כאבי גב וצוואר', 'כתף וברך', 'כאב מתמשך'],
      },
      {
        id: 'srv-sports',
        title: 'פיזיותרפיה ספורטיבית',
        description:
          'ליווי ספורטאים חובבים ותחרותיים מרגע הפציעה ועד החזרה המלאה לאימונים, מול עומסי האימון האמיתיים שלכם.',
        tags: ['ריצה', 'כדורגל וכדורסל', 'קרוספיט', 'רכיבה'],
      },
      {
        id: 'srv-pilates',
        title: 'פילאטיס קליני',
        description:
          'פילאטיס בהנחיית פיזיותרפיסט, שנבנה סביב האבחנה שלכם ולא סביב שיעור אחיד — כהמשך לטיפול או כמניעה.',
        tags: ['המשך לטיפול', 'מניעת פציעות חוזרות'],
      },
      {
        id: 'srv-postop',
        title: 'שיקום לאחר ניתוח',
        description:
          'תוכנית שיקום מובנית לאחר ניתוחים אורתופדיים ולאחר תאונות, לפי שלבים ולפי יעדים מדידים.',
        tags: ['אחרי ניתוח', 'שיקום לאחר תאונה'],
      },
    ],
    processHeading: {
      eyebrow: 'איך זה עובד',
      title: 'הדרך מהפגישה הראשונה ועד החזרה למגרש',
      lead: 'תהליך ברור בחמישה שלבים. אתם יודעים בכל רגע איפה אתם עומדים ומה נשאר.',
    },
    process: [
      {
        id: 'step-1',
        title: 'אבחון',
        description: 'פגישה ראשונה מלאה: מה קרה, מה מגביל אתכם ביום-יום, ובדיקה תפקודית של התנועה והכוח.',
        outcome: 'יוצאים עם תמונה ברורה של המצב',
      },
      {
        id: 'step-2',
        title: 'הסבר ואבחנה',
        description: 'מסבירים בשפה פשוטה מה מצאנו ומה כנראה מקור הכאב. בלי מונחים מפחידים.',
        outcome: 'מבינים למה כואב ומה הצעד הבא',
      },
      {
        id: 'step-3',
        title: 'תוכנית טיפול אישית',
        description: 'בונים יחד תוכנית שמתאימה ללוח הזמנים, לענף הספורט וליעד שהצבתם.',
        outcome: 'יעד חזרה מוגדר, לא הבטחה כללית',
      },
      {
        id: 'step-4',
        title: 'שיקום אקטיבי',
        description: 'עובדים בתנועה: טיפול ידני היכן שצריך, ובעיקר תרגול מדורג שמחזיר כוח וביטחון.',
        outcome: 'מתקדמים בעומס בקצב מבוקר',
      },
      {
        id: 'step-5',
        title: 'חזרה לפעילות ולספורט',
        description: 'סוגרים את המעגל עם קריטריונים לחזרה בטוחה ועם כלים לשמור על מה שהשגתם.',
        outcome: 'חוזרים למגרש, לא רק מפסיקים לכאוב',
      },
    ],
    featuresHeading: {
      eyebrow: 'למה פיזיותלטיקס',
      title: 'קליניקה קטנה, בכוונה',
      lead: 'לא מרכז רפואי גדול עם מטפלים מתחלפים. שני מטפלים בכירים ואחריות אישית על התוצאה.',
    },
    features: [
      {
        id: 'feat-1',
        title: 'הכשרה בינלאומית',
        description:
          'שני המטפלים הוכשרו באוסטרליה בפיזיותרפיה של מערכת השרירים והשלד ובשיקום פציעות ספורט.',
      },
      {
        id: 'feat-2',
        title: 'טיפול בידיים של הבכירים',
        description: 'מי שבודק אתכם בפגישה הראשונה הוא גם מי שמלווה אתכם עד הסוף.',
      },
      {
        id: 'feat-3',
        title: 'גישה מבוססת ראיות',
        description: 'פחות טיפולים פסיביים שמרגישים טוב לרגע, יותר שינוי אמיתי בתפקוד.',
      },
      {
        id: 'feat-4',
        title: 'קליניקה מקומית בעמק חפר',
        description: 'מומחיות בשיקום ספורט במרחק נסיעה קצר מהבית, בגבעת חיים איחוד.',
      },
    ],
    teamHeading: {
      eyebrow: 'הצוות',
      title: 'מי יטפל בכם',
      lead: 'את הקליניקה הקימו ומנהלים שני פיזיותרפיסטים שהוכשרו באוסטרליה.',
    },
    team: [
      {
        id: 'team-doron',
        name: 'דורון כהן',
        role: 'פיזיותרפיסט · ממייסדי הקליניקה',
        bio: 'מלווה ספורטאים חובבים ותחרותיים בדרך חזרה לפעילות מלאה, עם דגש על אבחון תפקודי מדויק.',
        credentials: [
          'תואר שני בפיזיותרפיה של מערכת השרירים והשלד ופציעות ספורט (MMuscSklSportPhysio)',
          'תואר ראשון בפיזיותרפיה (BPT)',
          'הכשרה מתקדמת בשיקום פציעות ספורט באוסטרליה',
        ],
        photoLabel: 'פורטרט של דורון כהן בקליניקה',
      },
      {
        id: 'team-tamar',
        name: 'תמר שגיא',
        role: 'פיזיותרפיסטית · ממייסדות הקליניקה',
        bio: 'מטפלת בכאב אורתופדי ומתמשך ובשיקום לאחר ניתוחים, ומשלבת פילאטיס קליני כשלב מבסס.',
        credentials: [
          'תואר שני בפיזיותרפיה של מערכת השרירים והשלד ופציעות ספורט (MMuscSklSportPhysio)',
          'תואר ראשון בפיזיותרפיה (BPT)',
          'הכשרה מתקדמת בפיזיותרפיה של מערכת השרירים והשלד באוסטרליה',
        ],
        photoLabel: 'פורטרט של תמר שגיא בקליניקה',
      },
    ],
    faqHeading: {
      eyebrow: 'לפני שמתקשרים',
      title: 'שאלות שאנחנו שומעים הכי הרבה',
      lead: 'לא מצאתם תשובה? שאלו אותנו ישירות — נענה בכנות.',
    },
    faq: [
      {
        id: 'faq-referral',
        question: 'האם צריך הפניה מרופא כדי להגיע?',
        answer:
          'לא. לטיפול פרטי בקליניקה אפשר לקבוע תור ישירות, בלי הפניה ובלי המתנה בתור.\nאם בכוונתכם לבקש החזר מקופת החולים או מביטוח משלים, כדאי לברר מולם מראש אילו מסמכים נדרשים.',
        pending: false,
      },
      {
        id: 'faq-sessions',
        question: 'כמה מפגשים בדרך כלל נדרשים?',
        answer:
          'זה תלוי בסוג הפציעה, בוותק שלה וביעד שהצבתם.\nמה שכן אפשר להבטיח: כבר בסיום הפגישה הראשונה תקבלו הערכה כנה של מסגרת הטיפול הצפויה.',
        pending: true,
      },
      {
        id: 'faq-first',
        question: 'מה כדאי להביא לפגישה הראשונה?',
        answer:
          'בגדים נוחים שמאפשרים תנועה, ונעלי הספורט שבהן אתם מתאמנים בפועל.\nאם יש בידיכם צילומים או סיכומי ניתוח — כדאי להביא. אם אין, זה בסדר גמור.',
        pending: false,
      },
      {
        id: 'faq-insurance',
        question: 'האם אפשר לקבל החזר מקופת החולים או מביטוח משלים?',
        answer:
          'חלק גדול מהביטוחים המשלימים מכירים בטיפולי פיזיותרפיה פרטיים, אך התנאים משתנים בין הקופות.\nהפרטים המדויקים יתעדכנו כאן לאחר אישור הנהלת הקליניקה.',
        pending: true,
      },
      {
        id: 'faq-pilates',
        question: 'מה ההבדל בין פיזיותרפיה לפילאטיס קליני?',
        answer:
          'פיזיותרפיה מתחילה מאבחון: מזהים את מקור הבעיה ומטפלים בה ישירות.\nפילאטיס קליני הוא שלב ההמשך — אימון בהנחיית פיזיותרפיסט שנבנה סביב אותה אבחנה.',
        pending: false,
      },
    ],
    contactHeading: {
      eyebrow: 'הגעה ויצירת קשר',
      title: 'הקליניקה נמצאת בגבעת חיים איחוד',
      lead: 'במרחק נסיעה קצר מרוב יישובי עמק חפר, מחדרה ומאזור השרון.',
    },
    footer: {
      description:
        'קליניקת בוטיק לפיזיותרפיה ולשיקום פציעות ספורט בגבעת חיים איחוד, בהובלת שני פיזיותרפיסטים בעלי הכשרה אוסטרלית.',
      copyright: 'כל הזכויות שמורות לפיזיותלטיקס, 2026',
      creditPrefix: 'עיצוב ופיתוח:',
      creditLabel: 'Segevision',
      creditHref: 'https://segevision.com',
    },
  },
  forms: {
    appointment: {
      eyebrow: 'קביעת תור',
      title: 'נשמח לשמוע מה קרה',
      lead: 'השאירו פרטים ונחזור אליכם טלפונית לתיאום מועד. אם המצב דחוף, עדיף פשוט להתקשר.',
      submitLabel: 'שליחת בקשה',
      successTitle: 'הבקשה נקלטה',
      successBody:
        'נחזור אליכם טלפונית לתיאום מועד. שימו לב: זו בקשה לתור ולא אישור — התור נקבע סופית רק בשיחה איתנו.',
      disclaimer:
        'שליחת הטופס היא בקשה לתיאום תור בלבד ואינה מהווה אישור. במצב רפואי דחוף פנו לקבלת טיפול רפואי מיידי.',
      assurances: [
        'הפנייה נקראת על ידי אחד המטפלים, לא על ידי מוקד חיצוני',
        'נחזור אליכם בשעות הפעילות של הקליניקה',
        'אם נראה שאנחנו לא הכתובת הנכונה — נגיד את זה',
      ],
      destination: '',
    },
  },
  seo: {
    title: 'פיזיותלטיקס | פיזיותרפיה ושיקום ספורט בעמק חפר',
    description:
      'קליניקת בוטיק לפיזיותרפיה ולשיקום פציעות ספורט בגבעת חיים איחוד. מטפלים בכירים בהכשרה אוסטרלית, טיפול אורתופדי, פילאטיס קליני ושיקום לאחר ניתוח.',
    keywords: ['פיזיותרפיה עמק חפר', 'שיקום ספורט', 'פיזיותרפיה גבעת חיים', 'פילאטיס קליני', 'פזיותרפיה'],
    localArea: 'עמק חפר, חדרה, השרון',
  },
  // Slot ids match what mediaSlots() derives, so an upload lands in the right frame.
  media: [
    {
      id: 'media-hero',
      slot: 'hero',
      label: 'ספורטאי בשלב שיקום אקטיבי',
      note: 'צילום אנכי, אור טבעי, רגע עבודה אמיתי.',
      src: '',
      alt: '',
    },
    {
      id: 'media-team-doron',
      slot: 'team:team-doron',
      label: 'פורטרט של דורון כהן',
      note: 'צילום ברקע הקליניקה — לא סטודיו לבן.',
      src: '',
      alt: '',
    },
    {
      id: 'media-team-tamar',
      slot: 'team:team-tamar',
      label: 'פורטרט של תמר שגיא',
      note: 'אותה שפה חזותית כמו הפורטרט הנוסף.',
      src: '',
      alt: '',
    },
  ],
  createdAt: '2026-07-26T00:00:00.000Z',
  updatedAt: '2026-07-26T00:00:00.000Z',
};
