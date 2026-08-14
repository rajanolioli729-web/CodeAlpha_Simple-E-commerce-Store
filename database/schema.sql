-- =============================================
-- CodeAlpha Ecommerce Store - Database Schema
-- =============================================

-- Create the database if it does not exist
CREATE DATABASE IF NOT EXISTS codealpha_ecommerce;
USE codealpha_ecommerce;

-- =============================================
-- Table: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: products
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: orders
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- Table: order_items
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- Sample Products (8 realistic products)
-- =============================================
INSERT INTO products (name, description, price, image_url, quantity) VALUES
('Wireless Bluetooth Headphones', 'High-quality over-ear wireless headphones with active noise cancellation, 30-hour battery life, and comfortable cushioned ear cups. Perfect for music lovers and frequent travelers.', 79.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 25),
('Smart Watch Series 5', 'Advanced smartwatch with heart rate monitoring, GPS tracking, waterproof design, and a vibrant AMOLED display. Compatible with both Android and iOS devices.', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 15),
('Mechanical Gaming Keyboard', 'RGB backlit mechanical keyboard with tactile switches, anti-ghosting keys, and a durable aluminum frame. Includes detachable USB-C cable and wrist rest.', 89.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 30),
('4K Ultra HD Monitor 27"', 'Crystal-clear 27-inch 4K UHD monitor with IPS panel, 99% sRGB color accuracy, and adjustable stand. Ideal for designers, gamers, and professionals.', 329.99, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', 10),
('Portable Bluetooth Speaker', 'Compact waterproof Bluetooth speaker with 360-degree sound, 12-hour playtime, and built-in microphone for hands-free calls. Great for outdoor adventures.', 49.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 40),
('Ergonomic Office Chair', 'Breathable mesh ergonomic office chair with adjustable lumbar support, armrests, and height. Designed for all-day comfort during long work sessions.', 149.99, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400', 12),
('USB-C Fast Charging Cable', 'Durable braided USB-C to USB-A fast charging cable (3ft) with 60W power delivery. Compatible with smartphones, tablets, and laptops.', 12.99, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400', 100),
('Laptop Backpack 15.6"', 'Water-resistant laptop backpack with padded compartment for 15.6-inch laptops, multiple pockets, USB charging port, and anti-theft design.', 39.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 20);