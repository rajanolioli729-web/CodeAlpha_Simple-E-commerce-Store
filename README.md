# CodeAlpha Simple E-commerce Store

A complete full-stack e-commerce web application built with Node.js, Express, MySQL, HTML, CSS, and Vanilla JavaScript. This project was developed as part of the **CodeAlpha Full Stack Development Internship**.

## Project Overview

This is a simple but complete e-commerce store that allows users to browse products, add items to a shopping cart, place orders with Cash on Delivery, and track their order history. It includes a full admin panel for managing products and orders.

## Features

### User Features
- **Home Page** - Hero section, featured products, categories, and call-to-action
- **Products Page** - Browse all products with search and category filtering
- **Product Details** - View detailed information with quantity selector
- **Shopping Cart** - Add, remove, update items with localStorage persistence
- **Checkout** - Collect shipping information with Cash on Delivery payment
- **Order History** - View and track your orders
- **User Registration/Login** - Session-based authentication with bcrypt password hashing
- **User Profile** - View account information and recent orders

### Admin Features
- **Dashboard** - Overview of products, orders, and revenue
- **Product Management** - Add, edit, delete products, update stock and price
- **Order Management** - View all orders, customer info, and update order status

## Technologies

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL
- mysql2

### Authentication
- express-session
- bcrypt

### Other
- dotenv
- nodemon (development)

## Project Structure

```
CodeAlpha_Simple-E-commerce-Store/
│
├── public/
│   ├── index.html
│   ├── products.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── order-success.html
│   ├── orders.html
│   ├── login.html
│   ├── register.html
│   │
│   ├── admin/
│   │   ├── index.html
│   │   ├── products.html
│   │   └── orders.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── admin.css
│   │   └── responsive.css
│   │
│   └── js/
│       ├── api.js
│       ├── script.js
│       ├── auth.js
│       ├── products.js
│       ├── product.js
│       ├── cart.js
│       ├── checkout.js
│       ├── orders.js
│       └── admin.js
│
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js
│
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── adminController.js
│
├── models/
│   ├── userModel.js
│   ├── productModel.js
│   └── orderModel.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── adminMiddleware.js
│
├── database/
│   ├── db.js
│   └── schema.sql
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm (comes with Node.js)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CodeAlpha_Simple-E-commerce-Store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the MySQL database**

   Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line) and run:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   This will create the database, tables, and insert 12 sample products.

4. **Configure environment variables**

   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=codealpha_ecommerce
   SESSION_SECRET=change_this_to_a_secure_secret
   ```

5. **Run the application**

   For development (with auto-reload):
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm start
   ```

6. **Open the website**

   Navigate to: http://localhost:3000

## MySQL Setup

The `database/schema.sql` file creates:
- `codealpha_ecommerce` database
- `users` table with role column (user/admin)
- `products` table with category and stock
- `orders` table with shipping information
- `order_items` table
- 12 sample products

### Upgrading an Existing Database

If you already have an older version of the database, run the migration script first:
```bash
mysql -u root -p < database/migrate.sql
```

This will add the `role` column to users, rename `image_url` to `image`, rename `quantity` to `stock`, add the `category` column, and add shipping/status columns to orders.

### Creating an Admin User

1. Register a normal user through the website
2. Run this SQL command to make them an admin:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | (empty) |
| `DB_NAME` | Database name | `codealpha_ecommerce` |
| `SESSION_SECRET` | Session encryption secret | (required) |

## Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## User Features

- Browse products with search and category filtering
- View product details with stock information
- Add products to cart with quantity control
- Checkout with shipping information (Cash on Delivery)
- View order history and track order status
- Register, login, and logout

## Admin Features

- Dashboard with store statistics
- Add, edit, and delete products
- Update product stock, price, image, and category
- View all customer orders
- Update order status (Pending, Processing, Shipped, Delivered, Cancelled)

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in a user |
| POST | `/api/auth/logout` | Log out the current user |
| GET | `/api/auth/me` | Get the currently logged-in user |
| GET | `/api/auth/profile` | Get user profile with order stats |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (supports search & category) |
| GET | `/api/products/categories` | Get all product categories |
| GET | `/api/products/:id` | Get a single product by ID |
| POST | `/api/products` | Create a new product (admin) |
| PUT | `/api/products/:id` | Update a product (admin) |
| DELETE | `/api/products/:id` | Delete a product (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place a new order (requires login) |
| GET | `/api/orders` | Get all orders for the logged-in user |
| GET | `/api/orders/:id` | Get a single order by ID (ownership verified) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | Get all orders (admin) |
| GET | `/api/admin/orders/:id` | Get a single order with items (admin) |
| PUT | `/api/admin/orders/:id/status` | Update order status (admin) |

## GitHub Pages Deployment

**Important:** GitHub Pages is **static hosting only** — it cannot run Node.js, Express, or MySQL.

The project is split into two deployment parts:

### 1. Frontend (GitHub Pages)
The `public/` directory is deployed to GitHub Pages via the `.github/workflows/static.yml` workflow. The static site works with a **static product catalog fallback** (`public/js/product-data.js`) so browsing products works without a backend.

### 2. Backend (Separate hosting)
The Node.js/Express backend must be deployed to a service that supports Node.js (e.g., Render, Railway, Heroku, Fly.io). The MySQL database must be hosted on a remotely accessible MySQL service (e.g., Railway MySQL, PlanetScale, Aiven, or a VPS).

### Configuring the API URL

Edit `public/js/api.js` and set `API_BASE_URL` to your deployed backend URL:

```js
// For local development (backend running on your machine):
const API_BASE_URL = '';

// For production (deployed backend):
const API_BASE_URL = 'https://your-backend.onrender.com';
```

The frontend automatically falls back to the static product catalog when the API is unreachable.

## Security

- Passwords are hashed using bcrypt (never stored in plain text)
- SQL queries use parameterized statements to prevent SQL injection
- Database credentials are stored in `.env` (not exposed in code)
- Order totals are calculated on the server (frontend prices are never trusted)
- Sessions are used for authentication
- Admin APIs are protected with middleware on the server
- Users can only access their own orders (ownership verified)
- User input is validated on both client and server sides
- MySQL transactions ensure order consistency
- Session secret comes from environment variables

## Screenshots

Add screenshots here:

- `docs/screenshots/home.png`
- `docs/screenshots/products.png`
- `docs/screenshots/product-details.png`
- `docs/screenshots/cart.png`
- `docs/screenshots/login.png`
- `docs/screenshots/admin.png`
- `docs/screenshots/orders.png`

## License

This project is created for educational purposes as part of the **CodeAlpha Full Stack Development Internship**.