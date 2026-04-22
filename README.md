# SMMFlow – Social Media Growth Panel

A complete, production-ready SMM (Social Media Marketing) reseller panel built with React, Node.js/Express, MongoDB, and Stripe.

---

## 📁 Project Structure

```
smm-panel/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, error handler
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── services/         # SMM provider API
│   │   ├── utils/            # Logger (Winston)
│   │   └── server.js         # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React + Tailwind SPA
│   ├── src/
│   │   ├── components/
│   │   │   └── dashboard/    # DashboardLayout (sidebar)
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # All page components
│   │   ├── services/         # Axios API client
│   │   ├── App.jsx           # Router + protected routes
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (test keys)
- An SMM provider API key (e.g. [smmstone.com](https://smmstone.com), [peakerr.com](https://peakerr.com))

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smm_panel
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

SMM_API_URL=https://smmstone.com/api/v2
SMM_API_KEY=your_provider_api_key

FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev     # development (nodemon)
npm start       # production
```

API runs on: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

> The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

---

### 3. Create Admin User

After starting, register a user normally, then in MongoDB:

```js
// mongo shell or MongoDB Compass
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Admin panel is at `/admin`.

---

### 4. Stripe Webhook (local)

Install Stripe CLI and forward events:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copy the webhook secret printed and set it as `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint             | Access  | Description       |
|--------|---------------------|---------|-------------------|
| POST   | /api/auth/register  | Public  | Register user     |
| POST   | /api/auth/login     | Public  | Login             |
| GET    | /api/auth/me        | Private | Get current user  |

### Services
| Method | Endpoint                    | Access       | Description         |
|--------|-----------------------------|--------------|---------------------|
| GET    | /api/services               | Public       | List active services|
| GET    | /api/services/admin/all     | Admin        | All services        |
| POST   | /api/services               | Admin        | Create service      |
| PUT    | /api/services/:id           | Admin        | Update service      |
| DELETE | /api/services/:id           | Admin        | Delete service      |

### Orders
| Method | Endpoint               | Access  | Description         |
|--------|------------------------|---------|---------------------|
| POST   | /api/orders            | Private | Place order         |
| GET    | /api/orders            | Private | User's orders       |
| GET    | /api/orders/:id        | Private | Single order        |
| GET    | /api/orders/admin/all  | Admin   | All orders          |

### Payments
| Method | Endpoint                        | Access  | Description          |
|--------|---------------------------------|---------|----------------------|
| POST   | /api/payments/create-checkout   | Private | Stripe checkout URL  |
| POST   | /api/payments/webhook           | Stripe  | Stripe webhook       |
| GET    | /api/payments/transactions      | Private | Transaction history  |

### Admin
| Method | Endpoint                          | Access | Description        |
|--------|-----------------------------------|--------|--------------------|
| GET    | /api/admin/stats                  | Admin  | Dashboard stats    |
| GET    | /api/admin/users                  | Admin  | All users          |
| PUT    | /api/admin/users/:id              | Admin  | Update user        |
| POST   | /api/admin/users/:id/add-balance  | Admin  | Add balance        |

---

## 🏗️ Production Deployment

### Backend (Railway / Render / VPS)
1. Set all env variables in your hosting dashboard
2. Set `NODE_ENV=production`
3. Set `FRONTEND_URL` to your production frontend domain
4. Deploy: `npm start`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` if not using same-origin proxy
2. Update `vite.config.js` proxy target to your backend URL, or:
   - Create `src/services/api.js` with `baseURL: import.meta.env.VITE_API_URL`
3. Build: `npm run build` → deploy `dist/`

### MongoDB
Use [MongoDB Atlas](https://cloud.mongodb.com) free tier for production.

---

## 🔐 Security Features

- JWT authentication with expiry
- bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min global, 20 req/15min on auth)
- Express-validator input validation on all endpoints
- Mongoose schema validation
- CORS configured to allowed origin only
- Stripe webhook signature verification
- Request body size limit (10kb)

---

## 🔌 SMM Provider Integration

The system is compatible with any SMM panel API that follows the standard format (smmstone, peakerr, justanotherpanel, etc.).

The provider API wrapper is in `backend/src/services/smmProvider.js`.

Supported actions:
- `services` – fetch all available services
- `add` – place an order
- `status` – get single order status
- `status` (bulk) – get multiple orders status
- `balance` – check provider balance
- `cancel` – cancel an order
- `refill` – request a refill

---

## 📦 Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS  |
| Routing   | React Router v6               |
| HTTP      | Axios                         |
| Backend   | Node.js, Express              |
| Database  | MongoDB, Mongoose             |
| Auth      | JWT, bcryptjs                 |
| Payments  | Stripe Checkout               |
| Logging   | Winston                       |
| Security  | express-rate-limit, express-validator |
"# smm-panel" 
"# smm-panel" 
