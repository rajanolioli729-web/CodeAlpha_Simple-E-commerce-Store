const pool = require('./db');

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].c > 0;
}

async function migrate() {
  try {
    // --- users: add role column ---
    if (!(await columnExists('users', 'role'))) {
      await pool.query(
        "ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user' AFTER password"
      );
      console.log('users.role added');
    }

    // --- products: image_url -> image ---
    if (await columnExists('products', 'image_url')) {
      await pool.query('ALTER TABLE products CHANGE COLUMN image_url image VARCHAR(500) NOT NULL');
      console.log('products.image_url renamed to image');
    }

    // --- products: quantity -> stock ---
    if (await columnExists('products', 'quantity')) {
      await pool.query('ALTER TABLE products CHANGE COLUMN quantity stock INT NOT NULL DEFAULT 0');
      console.log('products.quantity renamed to stock');
    }

    // --- products: add category ---
    if (!(await columnExists('products', 'category'))) {
      await pool.query(
        "ALTER TABLE products ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'Uncategorized' AFTER image"
      );
      console.log('products.category added');
    }

    // --- orders: total_price -> total_amount ---
    if (await columnExists('orders', 'total_price')) {
      await pool.query('ALTER TABLE orders CHANGE COLUMN total_price total_amount DECIMAL(10, 2) NOT NULL');
      console.log('orders.total_price renamed to total_amount');
    }

    // --- orders: order_date -> created_at ---
    if (await columnExists('orders', 'order_date')) {
      await pool.query('ALTER TABLE orders CHANGE COLUMN order_date created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('orders.order_date renamed to created_at');
    }

    // --- orders: add status ---
    if (!(await columnExists('orders', 'status'))) {
      await pool.query(
        "ALTER TABLE orders ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Pending' AFTER total_amount"
      );
      console.log('orders.status added');
    }

    // --- orders: add shipping columns ---
    const shippingCols = [
      ['shipping_name', "VARCHAR(100) NOT NULL DEFAULT ''"],
      ['shipping_email', "VARCHAR(100) NOT NULL DEFAULT ''"],
      ['shipping_phone', "VARCHAR(20) NOT NULL DEFAULT ''"],
      ['shipping_address', 'TEXT NOT NULL'],
      ['shipping_city', "VARCHAR(100) NOT NULL DEFAULT ''"],
      ['postal_code', "VARCHAR(20) NOT NULL DEFAULT ''"]
    ];
    for (const [col, def] of shippingCols) {
      if (!(await columnExists('orders', col))) {
        await pool.query(`ALTER TABLE orders ADD COLUMN ${col} ${def}`);
        console.log(`orders.${col} added`);
      }
    }

    // --- Populate category for existing products based on name ---
    const [prodRows] = await pool.query("SELECT id, name, price, stock, image, category FROM products");
    for (const p of prodRows) {
      let category = null;
      if (/bluetooth/i.test(p.name)) category = 'Audio';
      else if (/smart/i.test(p.name)) category = 'Wearables';
      else if (/keyboard/i.test(p.name)) category = 'Accessories';
      else if (/monitor/i.test(p.name)) category = 'Electronics';
      else if (/speaker/i.test(p.name)) category = 'Audio';
      else if (/chair/i.test(p.name)) category = 'Furniture';
      else if (/cable/i.test(p.name)) category = 'Cables';
      else if (/backpack/i.test(p.name)) category = 'Bags';
      else if (/mouse/i.test(p.name)) category = 'Accessories';
      else if (/microphone/i.test(p.name)) category = 'Audio';
      else if (/laptop stand/i.test(p.name)) category = 'Accessories';
      else if (/hard drive/i.test(p.name)) category = 'Storage';

      if (category && p.category === 'Uncategorized') {
        await pool.query('UPDATE products SET category = ? WHERE id = ?', [category, p.id]);
      }
    }
    console.log('Product categories updated');

    // --- Verify final schema ---
    const [orders] = await pool.query('DESCRIBE orders');
    const [products] = await pool.query('DESCRIBE products');
    const [users] = await pool.query('DESCRIBE users');
    console.log('FINAL orders:', orders.map(r => r.Field).join(', '));
    console.log('FINAL products:', products.map(r => r.Field).join(', '));
    console.log('FINAL users:', users.map(r => r.Field).join(', '));
    console.log('MIGRATION COMPLETE');
  } catch (e) {
    console.error('MIGRATION ERROR:', e.code, e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();