/* eslint-disable */

// End-to-end test for POST /api/orders

const BASE = 'http://localhost:3000';
let cookie = '';

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
  }
  if (cookie) {
    headers['Cookie'] = cookie;
  }
  const res = await fetch(BASE + path, {
    method: options.method || 'GET',
    headers,
    body: options.body && typeof options.body === 'object'
      ? JSON.stringify(options.body)
      : options.body
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    cookie = setCookie.split(';')[0];
  }
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch (e) { data = text; }
  return { status: res.status, data };
}

(async () => {
  const email = `order_test_${Date.now()}@example.com`;
  const password = 'test123456';
  const db = require('./db');
  let pass = true;

  console.log('=== STEP 1: Register user ===');
  const reg = await request('/api/auth/register', {
    method: 'POST',
    body: { fullName: 'Order Test User', email, password, confirmPassword: password }
  });
  console.log('register:', reg.status, JSON.stringify(reg.data));

  console.log('=== STEP 2: Login ===');
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  console.log('login:', login.status, JSON.stringify(login.data));
  if (!login.data.success) { console.error('FAIL: login'); pass = false; }

  console.log('=== STEP 3: Auth me ===');
  const me = await request('/api/auth/me');
  console.log('me:', me.status, JSON.stringify({ success: me.data.success, id: me.data.user && me.data.user.id }));
  if (!me.data.success) { console.error('FAIL: auth me'); pass = false; }

  console.log('=== STEP 4: Product stock before ===');
  const [prodRows] = await db.query('SELECT id, price, stock FROM products WHERE id IN (1,3) ORDER BY id');
  console.log(JSON.stringify(prodRows));
  const stockBefore1 = prodRows.find(p => p.id === 1).stock;
  const stockBefore3 = prodRows.find(p => p.id === 3).stock;
  const price1 = parseFloat(prodRows.find(p => p.id === 1).price);
  const price3 = parseFloat(prodRows.find(p => p.id === 3).price);

  console.log('=== STEP 5: Place order (happy path) ===');
  const orderRes = await request('/api/orders', {
    method: 'POST',
    body: {
      items: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 }
      ],
      shipping: {
        name: 'Order Test User',
        email,
        phone: '555-1234',
        address: '123 Test Street',
        city: 'Kathmandu',
        postalCode: '44600'
      }
    }
  });
  console.log('order:', orderRes.status, JSON.stringify(orderRes.data));
  if (!orderRes.data.success) { console.error('ORDER PLACEMENT FAILED'); pass = false; return; }
  const orderId = orderRes.data.order.id;
  const expectedTotal = Math.round((price1 * 2 + price3 * 1) * 100) / 100;
  console.log('orderId:', orderId, 'expectedTotal:', expectedTotal, 'actualTotal:', orderRes.data.order.totalAmount);
  if (parseFloat(orderRes.data.order.totalAmount) !== expectedTotal) { console.error('FAIL: total mismatch'); pass = false; }

  console.log('=== STEP 6: Verify DB state ===');
  const [orderRows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  console.log('order row:', JSON.stringify(orderRows[0]));
  if (orderRows.length !== 1) { console.error('FAIL: order row missing'); pass = false; }
  if (orderRows[0].user_id !== me.data.user.id) { console.error('FAIL: user_id mismatch'); pass = false; }
  if (parseFloat(orderRows[0].total_amount) !== expectedTotal) { console.error('FAIL: total_amount mismatch'); pass = false; }

  const [itemRows] = await db.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id', [orderId]);
  console.log('order_items:', JSON.stringify(itemRows));
  if (itemRows.length !== 2) { console.error('FAIL: expected 2 order_items'); pass = false; }
  const it1 = itemRows.find(i => i.product_id === 1);
  const it3 = itemRows.find(i => i.product_id === 3);
  if (!it1 || it1.quantity !== 2 || parseFloat(it1.price) !== price1) { console.error('FAIL: item1 mismatch'); pass = false; }
  if (!it3 || it3.quantity !== 1 || parseFloat(it3.price) !== price3) { console.error('FAIL: item3 mismatch'); pass = false; }

  const [prodAfter] = await db.query('SELECT id, stock FROM products WHERE id IN (1,3) ORDER BY id');
  console.log('stock after:', JSON.stringify(prodAfter));
  const s1 = prodAfter.find(p => p.id === 1).stock;
  const s3 = prodAfter.find(p => p.id === 3).stock;
  if (s1 !== stockBefore1 - 2) { console.error('FAIL: stock product1 not decremented'); pass = false; }
  if (s3 !== stockBefore3 - 1) { console.error('FAIL: stock product3 not decremented'); pass = false; }

  console.log('=== STEP 7: Rollback test (non-existent product) ===');
  const [orderCountBefore] = await db.query('SELECT COUNT(*) AS c FROM orders');
  const rollbackRes = await request('/api/orders', {
    method: 'POST',
    body: {
      items: [{ productId: 999999, quantity: 1 }],
      shipping: { name: 'X', email, phone: '1', address: 'X', city: 'X', postalCode: 'X' }
    }
  });
  console.log('rollback status:', rollbackRes.status, JSON.stringify(rollbackRes.data));
  const [orderCountAfter] = await db.query('SELECT COUNT(*) AS c FROM orders');
  if (rollbackRes.data.success === true) { console.error('FAIL: rollback test should fail'); pass = false; }
  if (orderCountAfter[0].c !== orderCountBefore[0].c) { console.error('FAIL: orders count changed'); pass = false; }

  console.log('=== STEP 8: Rollback test (insufficient stock) ===');
  const [stockInfo] = await db.query('SELECT stock FROM products WHERE id = 2');
  const hugeQty = stockInfo[0].stock + 100;
  const insuffRes = await request('/api/orders', {
    method: 'POST',
    body: {
      items: [{ productId: 2, quantity: hugeQty }],
      shipping: { name: 'X', email, phone: '1', address: 'X', city: 'X', postalCode: 'X' }
    }
  });
  console.log('insufficient status:', insuffRes.status, JSON.stringify(insuffRes.data));
  const [orderCountAfter2] = await db.query('SELECT COUNT(*) AS c FROM orders');
  if (orderCountAfter2[0].c !== orderCountAfter[0].c) { console.error('FAIL: orders count changed on insuff test'); pass = false; }

  console.log('=== STEP 9: GET /api/orders ===');
  const ordersList = await request('/api/orders');
  console.log('GET orders:', ordersList.status, 'success:', ordersList.data.success, 'num:', ordersList.data.orders && ordersList.data.orders.length);
  if (!ordersList.data.success) { console.error('FAIL: GET /api/orders failed'); pass = false; }
  const found = ordersList.data.orders.find(o => o.id === orderId);
  if (!found) { console.error('FAIL: new order not in list'); pass = false; } else {
    console.log('found:', JSON.stringify({ id: found.id, total: found.total_amount, items: found.items && found.items.length }));
  }

  console.log('=== STEP 10: GET /api/orders/:id ===');
  const orderById = await request('/api/orders/' + orderId);
  console.log('by id:', orderById.status, 'success:', orderById.data.success,
    'user_id:', orderById.data.order && orderById.data.order.user_id,
    'items:', orderById.data.order && orderById.data.order.items && orderById.data.order.items.length);
  if (!orderById.data.success) { console.error('FAIL: GET /api/orders/:id'); pass = false; }

  await db.end();
  console.log('RESULT:', pass ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
  process.exitCode = pass ? 0 : 1;
})();