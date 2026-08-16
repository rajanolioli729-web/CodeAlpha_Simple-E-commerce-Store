const pool = require('./db');

(async () => {
  try {
    const [prods] = await pool.query('SELECT id, name, price, stock FROM products ORDER BY id LIMIT 5');
    console.log('PRODUCTS:', JSON.stringify(prods));

    const [users] = await pool.query('SELECT id, full_name, email, role FROM users');
    console.log('USERS:', JSON.stringify(users));

    const [orders] = await pool.query('SELECT id, user_id, total_amount, status FROM orders');
    console.log('ORDERS:', JSON.stringify(orders));

    const [counts] = await pool.query(
      `SELECT (SELECT COUNT(*) FROM products) AS p, (SELECT COUNT(*) FROM users) AS u, (SELECT COUNT(*) FROM order_items) AS oi`
    );
    console.log('COUNTS:', JSON.stringify(counts[0]));
  } catch (e) {
    console.error('STATE-ERROR:', e.code, e.message);
  } finally {
    process.exit(0);
  }
})();