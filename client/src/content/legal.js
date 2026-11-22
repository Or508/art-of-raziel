// Legal page texts. Written by Claude, rendered by components/LegalPage.jsx.
// Shape: legalPages[key][language] = { title, updated, sections: [{ heading, paragraphs }] }
//
// Every line marked [למלא] / [TO FILL] needs real details before launch,
// and the whole text should be read by a lawyer or accountant.

const UPDATED = '2026-11-22';

export const legalPages = {
  privacy: {
    he: {
      title: 'מדיניות פרטיות',
      updated: UPDATED,
      sections: [
        {
          heading: 'מי אנחנו',
          paragraphs: [
            'האתר Art of Raziel מציג ומוכר יצירות של האמן רזיאל [למלא: שם מלא]. ליצירת קשר: [למלא: כתובת מייל] או בוואטסאפ דרך הכפתור באתר.',
          ],
        },
        {
          heading: 'איזה מידע נאסף',
          paragraphs: [
            'כשאתם שולחים הזמנה: שם, מייל, טלפון, כתובת למשלוח, הפריטים שהוזמנו והערות שכתבתם.',
            'כשאתם קובעים פגישה או פונים אלינו: שם, מייל, טלפון, תאריך ושעה מבוקשים והודעתכם.',
            'אם נרשמתם לאתר: מייל, שם וסיסמה. הסיסמה נשמרת מוצפנת (hash) ואיננו יכולים לראות אותה.',
            'איננו אוספים פרטי כרטיס אשראי. לא מתבצע תשלום באתר.',
          ],
        },
        {
          heading: 'למה המידע משמש',
          paragraphs: [
            'לטיפול בהזמנה, לתיאום תשלום ומשלוח, לקביעת פגישות ולמענה לפניות. איננו שולחים דיוור שיווקי בלי הסכמה, ואיננו מוכרים מידע לאף אחד.',
          ],
        },
        {
          heading: 'עם מי המידע משותף',
          paragraphs: [
            'רק עם שירותים שהאתר צריך כדי לפעול: שרת האחסון ומסד הנתונים, שירות המייל ששולח הודעות על הזמנות, וכשאתם בוחרים בכך, וואטסאפ. חלק מהשירותים האלה פועלים מחוץ לישראל.',
          ],
        },
        {
          heading: 'כמה זמן נשמר המידע',
          paragraphs: [
            'פרטי הזמנות נשמרים כל עוד נדרש לניהול ההזמנה ולפי חובות שמירת מסמכים על פי דין. פניות ופגישות נמחקות כשאין בהן עוד צורך.',
          ],
        },
        {
          heading: 'הזכויות שלכם',
          paragraphs: [
            'אתם רשאים לבקש לעיין במידע עליכם, לתקן אותו או למחוק אותו. כתבו לנו ל־[למלא: כתובת מייל] ונענה תוך זמן סביר.',
          ],
        },
        {
          heading: 'עוגיות ואחסון בדפדפן',
          paragraphs: [
            'האתר שומר בדפדפן שלכם את סל הקניות, את שפת התצוגה ואת פרטי ההתחברות שלכם. איננו משתמשים בעוגיות פרסום או מעקב.',
          ],
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      updated: UPDATED,
      sections: [
        {
          heading: 'Who we are',
          paragraphs: [
            'Art of Raziel presents and sells works by the artist Raziel [TO FILL: full name]. Contact: [TO FILL: email] or WhatsApp through the button on the site.',
          ],
        },
        {
          heading: 'What we collect',
          paragraphs: [
            'When you send an order: name, email, phone, shipping address, the items ordered, and any notes you write.',
            'When you book a meeting or contact us: name, email, phone, the requested date and time, and your message.',
            'If you create an account: email, name, and password. The password is stored as a hash, and we cannot see it.',
            'We do not collect credit card details. No payment is taken on the site.',
          ],
        },
        {
          heading: 'How we use it',
          paragraphs: [
            'To handle your order, arrange payment and shipping, schedule meetings, and answer you. We do not send marketing without your consent, and we never sell your data.',
          ],
        },
        {
          heading: 'Who we share it with',
          paragraphs: [
            'Only services the site needs to run: the hosting server and database, the email service that sends order notifications, and WhatsApp when you choose to use it. Some of these services operate outside Israel.',
          ],
        },
        {
          heading: 'How long we keep it',
          paragraphs: [
            'Order details are kept as long as needed to handle the order and as record-keeping law requires. Contact and meeting requests are deleted when no longer needed.',
          ],
        },
        {
          heading: 'Your rights',
          paragraphs: [
            'You may ask to see, correct, or delete the data we hold about you. Write to [TO FILL: email] and we will answer within a reasonable time.',
          ],
        },
        {
          heading: 'Cookies and browser storage',
          paragraphs: [
            'The site keeps your cart, display language, and sign-in in your browser. We do not use advertising or tracking cookies.',
          ],
        },
      ],
    },
  },

  terms: {
    he: {
      title: 'תקנון, משלוחים והחזרות',
      updated: UPDATED,
      sections: [
        {
          heading: 'המוכר',
          paragraphs: [
            'המוכר הוא האמן רזיאל [למלא: שם מלא ופרטי העסק]. ליצירת קשר: [למלא: כתובת מייל], וואטסאפ דרך הכפתור באתר.',
          ],
        },
        {
          heading: 'איך מזמינים',
          paragraphs: [
            'בוחרים יצירות, ממלאים פרטים ושולחים בקשת הזמנה. לא מתבצע תשלום באתר. אחרי שליחת ההזמנה רזיאל ייצור איתכם קשר לאישור ההזמנה, לתיאום אמצעי התשלום ולתיאום המשלוח.',
            'ההזמנה מחייבת רק אחרי שאישרתם אותה מול רזיאל ושולם עליה.',
          ],
        },
        {
          heading: 'מחירים',
          paragraphs: [
            'המחירים באתר נקבעים בדולר אמריקאי. המחיר בשקלים שמוצג בעברית הוא לפי שער משוער, והסכום הסופי לתשלום ייקבע בעת תיאום התשלום.',
            '[למלא: האם המחיר כולל מע"מ / מיסים, ומה עלות המשלוח לישראל ולחו"ל.]',
          ],
        },
        {
          heading: 'מלאי והזמנה מראש',
          paragraphs: [
            'כל יצירה נעשית בעבודת יד והמלאי מוגבל. פריט שמסומן "הזמנה מראש" ייוצר לאחר ההזמנה, וזמן ההכנה יתואם איתכם.',
          ],
        },
        {
          heading: 'משלוח ואיסוף',
          paragraphs: [
            '[למלא: לאן שולחים, באיזו חברה, זמני משלוח משוערים, והאם אפשר לאסוף ומאיפה.]',
          ],
        },
        {
          heading: 'ביטול והחזרות',
          paragraphs: [
            'אפשר לבטל הזמנה לפני ששולמה ונשלחה, בהודעה בוואטסאפ או במייל.',
            'לאחר קבלת המוצר, ביטול והחזרה יתאפשרו בהתאם לחוק הגנת הצרכן. יצירות שהוכנו במיוחד עבורכם לפי הזמנה (למשל עם שם או נוסח אישי) אינן ניתנות להחזרה, אלא אם הגיעו פגומות.',
            '[למלא: מי משלם על משלוח ההחזרה ותוך כמה ימים מחזירים את הכסף.]',
          ],
        },
        {
          heading: 'אחריות',
          paragraphs: [
            'אם יצירה הגיעה פגומה או שונה מההזמנה, פנו אלינו תוך [למלא] ימים עם תמונה ונמצא פתרון: תיקון, החלפה או החזר.',
          ],
        },
      ],
    },
    en: {
      title: 'Terms, Shipping and Returns',
      updated: UPDATED,
      sections: [
        {
          heading: 'The seller',
          paragraphs: [
            'The seller is the artist Raziel [TO FILL: full name and business details]. Contact: [TO FILL: email], or WhatsApp through the button on the site.',
          ],
        },
        {
          heading: 'How ordering works',
          paragraphs: [
            'Choose works, fill in your details, and send an order request. No payment is taken on the site. After you send it, Raziel will contact you to confirm the order and arrange payment and shipping.',
            'An order is binding only after you confirm it with Raziel and it is paid.',
          ],
        },
        {
          heading: 'Prices',
          paragraphs: [
            'Prices are set in US dollars. The shekel price shown in Hebrew uses an approximate rate, and the final amount is set when payment is arranged.',
            '[TO FILL: whether prices include tax, and shipping costs to Israel and abroad.]',
          ],
        },
        {
          heading: 'Stock and pre-orders',
          paragraphs: [
            'Every piece is handmade and stock is limited. An item marked "pre-order" is made after you order it, and the preparation time is agreed with you.',
          ],
        },
        {
          heading: 'Shipping and pickup',
          paragraphs: [
            '[TO FILL: where you ship, which carrier, estimated delivery times, and whether pickup is possible and where.]',
          ],
        },
        {
          heading: 'Cancellations and returns',
          paragraphs: [
            'You can cancel an order before it is paid and shipped by sending a message on WhatsApp or by email.',
            'After delivery, cancellation and returns follow consumer protection law. Pieces made especially for you (for example with a personal name or text) cannot be returned unless they arrived damaged.',
            '[TO FILL: who pays return shipping and how many days a refund takes.]',
          ],
        },
        {
          heading: 'Damaged items',
          paragraphs: [
            'If a piece arrives damaged or different from your order, contact us within [TO FILL] days with a photo and we will repair, replace, or refund it.',
          ],
        },
      ],
    },
  },

  accessibility: {
    he: {
      title: 'הצהרת נגישות',
      updated: UPDATED,
      sections: [
        {
          heading: 'המחויבות שלנו',
          paragraphs: [
            'אנחנו רוצים שכל אחד ואחת יוכלו לגלוש באתר ולהזמין בו, כולל אנשים עם מוגבלות. האתר נבנה בשאיפה לעמוד בתקן הישראלי 5568 ובהנחיות WCAG 2.1 ברמה AA.',
          ],
        },
        {
          heading: 'מה עשינו',
          paragraphs: [
            'האתר מותאם לטלפונים ולמחשבים, תומך בעברית מימין לשמאל ובאנגלית, ניתן לניווט במקלדת, ולתמונות יש טקסט חלופי.',
          ],
        },
        {
          heading: 'מה עוד לא מושלם',
          paragraphs: [
            'ייתכן שחלקים באתר עדיין אינם נגישים במלואם. אנחנו ממשיכים לשפר.',
          ],
        },
        {
          heading: 'נתקלתם בבעיה?',
          paragraphs: [
            'נשמח לשמוע ולתקן. רכז/ת הנגישות: [למלא: שם], [למלא: טלפון], [למלא: כתובת מייל].',
          ],
        },
      ],
    },
    en: {
      title: 'Accessibility Statement',
      updated: UPDATED,
      sections: [
        {
          heading: 'Our commitment',
          paragraphs: [
            'We want everyone, including people with disabilities, to be able to browse and order on this site. It is built to meet Israeli Standard 5568 and WCAG 2.1 level AA.',
          ],
        },
        {
          heading: 'What we did',
          paragraphs: [
            'The site works on phones and computers, supports Hebrew right to left and English, can be used with a keyboard, and images have alternative text.',
          ],
        },
        {
          heading: 'What is not perfect yet',
          paragraphs: [
            'Some parts of the site may not be fully accessible yet. We keep improving it.',
          ],
        },
        {
          heading: 'Found a problem?',
          paragraphs: [
            'Tell us and we will fix it. Accessibility contact: [TO FILL: name], [TO FILL: phone], [TO FILL: email].',
          ],
        },
      ],
    },
  },
};
