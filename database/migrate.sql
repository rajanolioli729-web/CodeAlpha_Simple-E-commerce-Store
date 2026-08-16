-- =============================================
-- CodeAlpha Ecommerce Store - Database Migration
-- Run this to upgrade an existing database to the new schema
-- =============================================

USE codealpha_ecommerce;

-- Add role column to users if not exists
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN role ENUM(''user'', ''admin'') NOT NULL DEFAULT ''user'' AFTER password', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename image_url to image in products
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'image_url');
SET @sql = IF(@col_exists = 1, 'ALTER TABLE products CHANGE COLUMN image_url image VARCHAR(500) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename quantity to stock in products
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'quantity');
SET @sql = IF(@col_exists = 1, 'ALTER TABLE products CHANGE COLUMN quantity stock INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add category column to products if not exists
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'category');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT ''Uncategorized'' AFTER image', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename total_price to total_amount in orders
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'total_price');
SET @sql = IF(@col_exists = 1, 'ALTER TABLE orders CHANGE COLUMN total_price total_amount DECIMAL(10, 2) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename order_date to created_at in orders
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'order_date');
SET @sql = IF(@col_exists = 1, 'ALTER TABLE orders CHANGE COLUMN order_date created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add status column to orders if not exists
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'status');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT ''Pending'' AFTER total_amount', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add shipping columns to orders if not exists
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'shipping_name');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN shipping_name VARCHAR(100) NOT NULL DEFAULT '''' AFTER status', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'shipping_email');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN shipping_email VARCHAR(100) NOT NULL DEFAULT '''' AFTER shipping_name', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'shipping_phone');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN shipping_phone VARCHAR(20) NOT NULL DEFAULT '''' AFTER shipping_email', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'shipping_address');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN shipping_address TEXT NOT NULL AFTER shipping_phone', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'shipping_city');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN shipping_city VARCHAR(100) NOT NULL DEFAULT '''' AFTER shipping_address', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'codealpha_ecommerce' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'postal_code');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN postal_code VARCHAR(20) NOT NULL DEFAULT '''' AFTER shipping_city', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update product categories for existing data
UPDATE products SET category = 'Audio' WHERE name LIKE '%Bluetooth%' AND category = 'Uncategorized';
UPDATE products SET category = 'Wearables' WHERE name LIKE '%Smart%' AND category = 'Uncategorized';
UPDATE products SET category = 'Accessories' WHERE name LIKE '%Keyboard%' AND category = 'Uncategorized';
UPDATE products SET category = 'Electronics' WHERE name LIKE '%Monitor%' AND category = 'Uncategorized';
UPDATE products SET category = 'Audio' WHERE name LIKE '%Speaker%' AND category = 'Uncategorized';
UPDATE products SET category = 'Furniture' WHERE name LIKE '%Chair%' AND category = 'Uncategorized';
UPDATE products SET category = 'Cables' WHERE name LIKE '%Cable%' AND category = 'Uncategorized';
UPDATE products SET category = 'Bags' WHERE name LIKE '%Backpack%' AND category = 'Uncategorized';