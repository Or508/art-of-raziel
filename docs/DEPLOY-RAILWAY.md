# העלאת Art of Raziel ל־Railway

בפרויקט אחד ב־Railway יש שני שירותים: **MySQL** (מסד הנתונים) ו־**האתר** (שרת Node שמגיש גם את ה־API וגם את החנות).
בכל הפעלה השרת מכין את מסד הנתונים לבד: יוצר טבלאות שחסרות, ממלא את הקטלוג (14 המוצרים מהמחשב שלך) אם הוא ריק, ויוצר את מנהל האתר הראשון אם עוד אין אחד.

עלות משוערת: תוכנית Hobby, 5 דולר לחודש, וזה מספיק לאתר הזה.

## לפני שמתחילים

1. קורסור סיים את בריף 001, ובדקנו את השינויים שלו.
2. כל הקוד שמור בקומיט ונדחף ל־GitHub, למאגר `Or508/art-of-raziel`. Railway בונה את האתר מ־GitHub, אז מה שלא נדחף לא יעלה.

## שלב 1: חשבון ופרויקט

1. נכנסים ל־railway.com ונרשמים עם חשבון ה־GitHub (Or508).
2. בוחרים תוכנית Hobby ומזינים אמצעי תשלום. את זה עושים אתם, לא אני.
3. **New Project → Deploy from GitHub repo → `art-of-raziel`**. מאשרים ל־Railway לגשת למאגר.
4. הבנייה הראשונה תיכשל, כי עוד אין מסד נתונים. זה צפוי.

## שלב 2: מסד נתונים

1. באותו פרויקט: **Create → Database → MySQL**.
2. נכנסים לשירות של האתר (לא ל־MySQL), בלשונית **Variables**: **New Variable → Add Reference**. מוסיפים את חמשת המשתנים מהשירות MySQL:
   `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`.
   השרת קורא אותם ישירות. אין צורך ב־`DB_HOST` וחבריו, ואין צורך ב־`DB_SSL`, כי החיבור עובר ברשת הפנימית של Railway.

## שלב 3: משתנים של האתר

באותה לשונית Variables, ב־**Raw Editor**, מדביקים וממלאים:

```
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=Raziel
EMAIL_USER=
EMAIL_PASS=
VITE_WHATSAPP_NUMBER=
```

- `JWT_SECRET`: מחרוזת אקראית ארוכה. אפשר ליצור אותה ב־PowerShell עם הפקודה שבסוף הקובץ.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: הכניסה של רזיאל לדשבורד. בוחרים סיסמה חזקה וחדשה. היא נשמרת מוצפנת.
- `EMAIL_USER` / `EMAIL_PASS`: חשבון Gmail ששולח את המיילים על הזמנות חדשות, עם "סיסמת אפליקציה" של גוגל (לא הסיסמה הרגילה). אם משאירים ריק, ההזמנות נשמרות אבל לא נשלח מייל.
- `VITE_WHATSAPP_NUMBER`: המספר של רזיאל בספרות בלבד, עם קידומת מדינה ובלי `+`, למשל `1646...`.
- **לא** להגדיר `VITE_API_URL` ולא `PORT`. Railway קובע את הפורט לבד, והאתר פונה לכתובת של עצמו.

## שלב 4: כתובת והפעלה

1. בשירות של האתר: **Settings → Networking → Generate Domain**. מקבלים כתובת בסגנון `art-of-raziel-production.up.railway.app`.
2. **Deploy** (או Redeploy). בלוגים צריך לראות:
   `initDb: added 14 catalog products`, `initDb: created the first admin`, `initDb: database ready`.
3. פותחים את הכתובת, בודקים את החנות, שולחים הזמנת בדיקה ומוודאים שמגיע מייל.
4. נכנסים לדשבורד דרך ADMIN LOGIN, מעדכנים את המלאי האמיתי (כרגע לכל מוצר יש 25 יחידות, שזה מספר זמני), ומוחקים או מבטלים את הזמנת הבדיקה.

## שלב 5: דומיין משלכם (כשתרצו)

1. קונים דומיין, למשל `artofraziel.com`, אצל Namecheap, Cloudflare או ספק ישראלי לדומיין `.co.il`.
2. ב־Railway: **Settings → Networking → Custom Domain**, מזינים את הדומיין ומעתיקים את רשומת ה־CNAME שמופיעה.
3. אצל ספק הדומיין מוסיפים את רשומת ה־CNAME. אחרי כמה דקות עד כמה שעות האתר עולה בכתובת החדשה, עם HTTPS.

## אחרי שהאתר באוויר

- כל דחיפה לענף `main` ב־GitHub בונה ומעלה גרסה חדשה אוטומטית.
- גיבוי: בשירות MySQL, בלשונית **Backups**, כדאי להפעיל גיבוי יומי.

---

יצירת `JWT_SECRET` ב־PowerShell:

```powershell
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```
