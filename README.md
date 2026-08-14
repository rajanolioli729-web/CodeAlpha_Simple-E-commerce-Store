# CodeAlpha Ecommerce Store

A complete full-stack e-commerce web application built with Node.js, Express, MySQL, HTML, CSS, and Vanilla JavaScript. This project was created as part of the CodeAlpha Full Stack Development internship.

## Features

- **Home Page** - Hero section, featured products, and call-to-action
- **Products Page** - Browse all products with search/filter functionality
- **Product Details** - View detailed information about each product
- **Shopping Cart** - Add, remove, and update items with localStorage persistence
- **User Registration** - Create an account with password hashing (bcrypt)
- **User Login/Logout** - Session-based authentication
- **Order System** - Place orders with server-side price calculation
- **Responsive Design** - Mobile-friendly layout

## Technologies Used

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
- Express sessions
- bcrypt for password hashing

### Development
- Nodemon

## Folder Structure

```
CodeAlpha_EcommerceStore/
│
├── public/
│   ├── index.html
│   ├── products.html
│   ├── product.html
│   ├── cart.html
│   ├── login.html
│   ├── register.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
│
├── routes/
│   ├── productRoutes.js
│   ├── authRoutes.js
│   └── orderRoutes.js
│
├── controllers/
│   ├── productController.js
│   ├── authController.js
│   └── orderController.js
│
├── models/
│   ├── productModel.js
│   ├── userModel.js
│   └── orderModel.js
│
├── database/
│   ├── db.js
│   └── schema.sql
│
├── .env
├── .gitignore
├── package.json
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
   cd CodeAlpha_EcommerceStore
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
   This will create the database, tables, and insert sample products.

4. **Configure environment variables**

   Create a `.env` file in the root directory (or edit the existing one):
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

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get a single product by ID |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in a user |
| POST | `/api/auth/logout` | Log out the current user |
| GET | `/api/auth/me` | Get the currently logged-in user |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place a new order (requires login) |
| GET | `/api/orders` | Get all orders for the logged-in user |

## Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | User ID |
| full_name | VARCHAR(100) | User's full name |
| email | VARCHAR(100) | User's email (unique) |
| password | VARCHAR(255) | Hashed password |
| created_at | TIMESTAMP | Registration date |

### products
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Product ID |
| name | VARCHAR(150) | Product name |
| description | TEXT | Product description |
| price | DECIMAL(10,2) | Product price |
| image_url | VARCHAR(255) | Product image URL |
| quantity | INT | Available stock |
| created_at | TIMESTAMP | Creation date |

### orders
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Order ID |
| user_id | INT (FK) | References users.id |
| total_price | DECIMAL(10,2) | Order total |
| order_date | TIMESTAMP | Order date |

### order_items
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Item ID |
| order_id | INT (FK) | References orders.id |
| product_id | INT (FK) | References products.id |
| quantity | INT | Quantity ordered |
| price | DECIMAL(10,2) | Price at time of order |

## Security Features

- Passwords are hashed using bcrypt (never stored in plain text)
- SQL queries use parameterized statements to prevent SQL injection
- Database credentials are stored in `.env` (not exposed in code)
- Order totals are calculated on the server (frontend prices are not trusted)
- Sessions are used for authentication
- User input is validated on both client and server sides
- Unauthorized order access is prevented

## Screenshots

*Add screenshots here:*
- Home Page
- Products Page
- Product Details
- Shopping Cart
- Login/Register Pages

## Future Improvements

- Add product categories and filtering
- Implement product reviews and ratings
- Add payment gateway integration (Stripe, PayPal)
- Add order history page for users
- Implement email notifications
- Add admin panel for product management
- Add pagination for products
- Implement wishlist functionality
- Add product search suggestions
- Improve image handling with file uploads

## License

This project is created for educational purposes as part of the CodeAlpha Full Stack Development internship.