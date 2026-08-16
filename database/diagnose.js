const pool = require('./db');

(async () => {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('TABLES:', JSON.stringify(tables));

    const [orders] = await pool.query('DESCRIBE orders');
    console.log('ORDERS_SCHEMA:', JSON.stringify(orders.map(r => r.Field)));

    const [items] = await pool.query('DESCRIBE order_items');
    console.log('ORDER_ITEMS_SCHEMA:', JSON.stringify(items.map(r => r.Field)));

    const [prods] = await pool.query('SHOW COLUMNS FROM products');
    console.log('PRODUCTS_COLUMNS:', JSON.stringify(prods.map(r => r.Field)));

    const [users] = await pool.query('SHOW COLUMNS FROM users');
    console.log('USERS_COLUMNS:', JSON.stringify(users.map(r => r.Field)));

    const [existingOrders] = await pool.query('SELECT COUNT(*) AS c FROM orders');
    console.log('EXISTING_ORDERS:', existingOrders[0].c);
  } catch (e) {
    console.error('DB-ERROR:', e.code, e.message);
  } finally {
    process.exit(0);
  }
})();