# מערכת אימות - Art of Raziel

## התקנה והגדרה

### 1. התקנת Dependencies בשרת

```bash
cd server
npm install
```

### 2. יצירת טבלאות במסד הנתונים

הרץ את הקובץ `server/database/schema.sql` במסד הנתונים MySQL שלך:

```sql
-- Users table for customers
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Admins table for super admin
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 3. הגדרת משתני סביבה

עדכן את קובץ `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=art_of_raziel
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

### 4. יצירת אדמין ראשון

#### אפשרות א': דרך API (מומלץ)

השתמש ב-Postman או כלי אחר לשליחת POST request:

```bash
POST http://localhost:5000/api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@artofraziel.com",
  "password": "admin123"
}
```

**חשוב:** לפני זה, צריך ליצור את האדמין במסד הנתונים. השתמש בסקריפט Python או Node.js ליצירת hash לסיסמה:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
```

ואז הכנס למסד הנתונים:

```sql
INSERT INTO admins (email, password, name, role) 
VALUES ('admin@artofraziel.com', '<HASHED_PASSWORD>', 'Super Admin', 'super_admin');
```

#### אפשרות ב': דרך Node.js Script

צור קובץ `server/scripts/createAdmin.js`:

```javascript
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createAdmin() {
  const email = 'admin@artofraziel.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    await db.query(
      'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, 'Super Admin', 'super_admin']
    );
    console.log('Admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit();
}

createAdmin();
```

הרץ: `node server/scripts/createAdmin.js`

### 5. הפעלת השרת

```bash
cd server
npm start
# או לפיתוח:
npm run dev
```

### 6. API Endpoints

#### לקוחות (Users)

- **POST** `/api/auth/register` - הרשמה
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "0501234567"
  }
  ```

- **POST** `/api/auth/login` - התחברות
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **GET** `/api/auth/me` - קבלת משתמש נוכחי (דורש token)
  Headers: `Authorization: Bearer <token>`

#### אדמין (Admin)

- **POST** `/api/auth/admin/login` - התחברות אדמין
  ```json
  {
    "email": "admin@artofraziel.com",
    "password": "admin123"
  }
  ```

### 7. שימוש ב-Frontend

המערכת כוללת:
- **AuthModal** - התחברות/הרשמה ללקוחות
- **AdminLoginModal** - התחברות לאדמין
- ניהול state אוטומטי עם localStorage
- כפתורי logout אוטומטיים

### 8. אבטחה

- כל הסיסמאות מוצפנות עם bcrypt
- JWT tokens עם תוקף של 7 ימים
- Middleware להגנה על routes
- Validation של קלט

### הערות חשובות

1. **שנה את JWT_SECRET** ב-production!
2. **שנה את סיסמת האדמין** הראשונית!
3. **השתמש ב-HTTPS** ב-production!
4. **הוסף rate limiting** ל-API endpoints!
