-- Art of Raziel — full schema (MySQL 8+)
-- Run this against an empty database. CREATE TABLE IF NOT EXISTS will not
-- alter tables that already exist from the older one-off scripts.
--
-- Create the first admin with: npm run create-admin
-- (set ADMIN_EMAIL and ADMIN_PASSWORD in the environment). This file
-- does not insert a password.
--
-- Column names match the API that is already deployed:
--   products.title / description are what SELECT and UPDATE use today.
--   products.title_he / description_he mirror those columns.
--   orders.customer_name / customer_email / customer_phone / shipping_city / shipping_country
--   contact_requests.meeting_date / meeting_time

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    phone VARCHAR(32) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_active_created (is_active, created_at),
    CONSTRAINT chk_users_email CHECK (
        email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
    ),
    -- bcrypt hashes are 60 characters. This rejects a plaintext password.
    CONSTRAINT chk_users_password_hash CHECK (CHAR_LENGTH(password) >= 60),
    CONSTRAINT chk_users_phone CHECK (
        phone IS NULL OR CHAR_LENGTH(phone) BETWEEN 7 AND 32
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Admins (no seed row)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NULL,
    role ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admins_email (email),
    KEY idx_admins_active_role (is_active, role),
    CONSTRAINT chk_admins_email CHECK (
        email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT chk_admins_password_hash CHECK (CHAR_LENGTH(password) >= 60)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Catalog
-- title / description stay writable: productController and the storefront
-- already read and update those names. title_he / description_he are the
-- Hebrew columns, kept identical to title / description.
-- category values are the ones the catalog already maps:
--   מזוזות -> mezuzah, קמיעות and חותמים -> amulet.
-- is_active is required by Product.getAll (WHERE is_active = TRUE).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    title_he VARCHAR(255) AS (title) VIRTUAL,
    title_en VARCHAR(255) NULL,
    description TEXT NULL,
    description_he TEXT AS (description) VIRTUAL,
    description_en TEXT NULL,
    category ENUM('מזוזות', 'קמיעות', 'חותמים') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    price_usd DECIMAL(10, 2) NULL,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    allow_preorder TINYINT(1) NOT NULL DEFAULT 0,
    image_url VARCHAR(512) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_products_active_category (is_active, category),
    KEY idx_products_category (category),
    CONSTRAINT chk_products_price CHECK (price >= 0),
    CONSTRAINT chk_products_price_usd CHECK (price_usd IS NULL OR price_usd >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Meeting / contact requests
-- meeting_time is HH:MM (VARCHAR(10) per the latest booking script).
-- One row per date+time, which is the rule contactController already enforces.
-- channel is nullable: the public form does not send it.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_requests (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    meeting_type ENUM('zoom', 'inPerson') NOT NULL DEFAULT 'zoom',
    channel ENUM('whatsapp', 'sheet') NULL,
    notes TEXT NULL,
    meeting_date DATE NOT NULL,
    meeting_time VARCHAR(10) NOT NULL,
    status ENUM('pending', 'in_progress', 'resolved') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_contact_requests_slot (meeting_date, meeting_time),
    KEY idx_contact_requests_status_created (status, created_at),
    KEY idx_contact_requests_email (email),
    CONSTRAINT chk_contact_requests_email CHECK (
        email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT chk_contact_requests_time CHECK (
        meeting_time REGEXP '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Orders
-- user_id is null for guest checkout. customer_* and shipping_city /
-- shipping_country are the columns adminController.getCustomers selects.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_number VARCHAR(40) NOT NULL,
    user_id INT UNSIGNED NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    shipping_method ENUM('delivery', 'pickup') NOT NULL,
    shipping_street VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NULL,
    shipping_zip VARCHAR(20) NOT NULL,
    shipping_country CHAR(2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency ENUM('USD', 'ILS', 'EUR') NOT NULL DEFAULT 'USD',
    status ENUM('Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
    payment_id VARCHAR(64) NULL,
    tracking_number VARCHAR(64) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_orders_order_number (order_number),
    UNIQUE KEY uq_orders_payment_id (payment_id),
    KEY idx_orders_user (user_id),
    KEY idx_orders_customer_email (customer_email),
    KEY idx_orders_status_created (status, created_at),
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_orders_email CHECK (
        customer_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT chk_orders_total CHECK (total_amount >= 0),
    CONSTRAINT chk_orders_country CHECK (shipping_country REGEXP '^[A-Z]{2}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Order lines
-- title and unit_price are a snapshot so later catalog edits do not rewrite
-- history. product_id stays required; retire a product with is_active = 0
-- instead of deleting it.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_order_items_order (order_id),
    KEY idx_order_items_product (product_id),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_order_items_price CHECK (unit_price >= 0),
    CONSTRAINT chk_order_items_qty CHECK (quantity >= 1),
    CONSTRAINT chk_order_items_line_total CHECK (line_total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
