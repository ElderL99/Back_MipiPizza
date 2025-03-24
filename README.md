# 🍕 MiPiPizza API - Backend

This is the backend for **MiPiPizza**, an online pizza ordering platform built with Node.js, Express, and MongoDB. It supports authentication, order management, product control, and real-time updates via WebSockets.

---

## 🚀 Features

- User and admin authentication (JWT)
- User registration and login
- CRUD for users, orders, and pizzas
- Persistent user cart
- Completed and canceled order tracking
- Sales reporting
- Real-time updates via WebSockets (Socket.IO)
- Modular architecture with controllers, routes, and models
- Role-based access control

---

## 📁 Project Structure

```
mipipizza-backend/
├── server.js                   # Main entry point
├── package.json
├── .env                        # Environment variables
├── .gitignore

├── src/
│   ├── controllers/            # Business logic
│   │   ├── adminController.js
│   │   ├── authController.js
│
│   ├── middleware/             # Auth and validation
│   │   └── authMiddleware.js
│
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Pizza.js
│   │   ├── Order.js
│   │   ├── CompletedOrder.js
│   │   └── CanceledOrder.js
│
│   ├── routes/                 # REST API endpoints
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── pizzas.js
│   │   ├── orders.js
│   │   └── adminroutes.js
│
│   └── utils/                  # Helper functions (optional)
│       └── (empty)
```

---

## ⚙️ Installation

```bash
git clone https://github.com/yourusername/mipipizza-backend.git
cd mipipizza-backend
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## ▶️ Available Scripts

```bash
npm run dev   # Start with nodemon (development)
npm start     # Start in production mode
```

---

## 📡 REST API Endpoints

### 🔐 Auth (`/auth`)
- `POST /login` – Login
- `POST /register` – Register new user

### 👤 Users (`/users`)
- `GET /cart` – Get user's cart
- `PUT /cart` – Save user's cart
- `POST /` – Create new user
- `PUT /:id` – Update user
- `DELETE /:id` – Delete user

### 🍕 Pizzas (`/pizzas`)
- `GET /` – List all pizzas
- `POST /` – Add new pizza
- `DELETE /:id` – Delete pizza

### 🛒 Orders (`/orders`)
- `POST /` – Create new order
- `GET /` – Get user orders
- `GET /active-order` – Check for active order
- `PUT /:id` – Update order status
- `DELETE /:id` – Cancel order

### 🛠 Admin (`/admin`) _(requires admin role + token)_
- `GET /orders` – Get all active orders
- `PUT /orders/:id` – Update order status
- `PUT /orders/:id/markAsPaid` – Mark order as paid
- `PUT /orders/:id/cancel` – Cancel order
- `GET /sales` – Get sales report
- `GET /canceled-orders` – Get all canceled orders

---

## 🔄 WebSocket Events

Real-time updates using Socket.IO:

- `newOrder` – Triggered when a new order is placed
- `orderUpdated` – Triggered when an order is updated
- `orderDeleted` – Triggered when an order is canceled

---

## 🛡 Security

- JWT-based authentication
- Role verification with middleware (`verifyToken`, `verifyAdmin`)
- CORS protection for allowed domains
- Input validation and error handling

---

## 🧪 Test Route

`GET /`  
> 🍕 MiPiPizza API is running successfully.

---

## 📬 Contact

For questions or contributions:

- Email: aaro.adan.lugo@gmail.com
- GitHub: https://github.com/ElderL99

---

## 📝 License

This project is licensed under the **ISC** license.
