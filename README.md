# 🛒 ShopVerse – Production-Grade E-Commerce REST API Engine

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Node.js](https://img.shields.io/badge/node.js-v20-blue)
![Express](https://img.shields.io/badge/express-v4.19-lightgrey)
![MongoDB](https://img.shields.io/badge/mongodb-v7.0-green)
![Redis](https://img.shields.io/badge/redis-v7-red)
![License](https://img.shields.io/badge/license-MIT-yellow)

**ShopVerse** is an enterprise-level, production-ready E-Commerce REST API backend and React 19 frontend application built with **Node.js, Express, MongoDB, Redis, and React**.

> 💡 **Docker-Optional Architecture:** ShopVerse runs natively on your local machine using **Node.js** and **MongoDB** (local or Atlas) without requiring Docker. Redis and Docker are completely **optional** for local development — if Redis or Docker is not installed, the application automatically degrades gracefully using in-memory fallbacks.

---

## 🌟 Key Features

### 🚀 Local Execution Without Docker
- Runs directly using standard `Node.js` (v18 or v20).
- Compatible with **MongoDB Atlas** cloud or local standalone MongoDB.
- Redis caching & rate-limiting automatically degrade to in-memory fallbacks when Redis is not running.
- **Docker Compose is supported but completely optional.**

### 🔐 Authentication & User Security
- Dual-token JWT system (Short-lived Access Token + HTTP-Only Refresh Cookie).
- Email verification via Resend integration.
- Password recovery via time-bound email reset tokens.
- Immediate token blacklisting on logout.

### 📦 Product & Category Catalog
- Multilevel category hierarchy tree structure.
- Advanced product search with filters, text relevancy score matching, and multi-sort criteria.
- ImageKit integration for cloud media upload and management.

### 🛒 Cart & Wishlist Engine
- Real-time stock validation and state management.
- One-click wishlist transfer into active shopping cart.

### 💳 Checkout & Order Tracking
- Transaction-guaranteed order placement with stock auto-reservation and cancellation restoration.
- Razorpay payment integration with HMAC-SHA256 signature verification.
- Order lifecycle management (`pending` → `processing` → `shipped` → `delivered` / `cancelled`) with full timeline audit trail.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend Runtime** | Node.js (v18/v20 LTS), Express.js (v4.19) |
| **Frontend Framework** | React 19, Vite, TypeScript, Tailwind CSS, Shadcn UI |
| **Database** | MongoDB (Local or Atlas) |
| **Caching & Rate Limiting** | Redis (Optional — in-memory fallback enabled) |
| **Containerization** | Docker / Docker Compose (**Optional**) |

---

## 🚀 Quick Start (Local Setup Without Docker)

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (Local instance or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

---

### Step 1: Clone Repository & Install Dependencies

```bash
git clone https://github.com/Harshraj-3108/shopverse-backend.git
cd shopverse-backend
npm install
```

---

### Step 2: Configure Environment Variables

Create `.env` inside the `backend/` directory (or copy `.env.example`):

```bash
cp backend/.env.example backend/.env
```

#### Minimal Local `.env` Configuration:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/shopverse
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_access_token_key_min32chars
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_min32chars
```

> **Note:** If Redis is not installed on your system, the server will log a connection warning and automatically use in-memory rate limiting and direct database queries without crashing.

---

### Step 3: Run Development Server

```bash
# Start backend server from project root:
npm run dev
```

Or run directly inside the `backend` directory:

```bash
cd backend
npm run dev
```

The API server will launch at **`http://localhost:5000`**.  
Interactive Swagger API documentation will be available at **`http://localhost:5000/api/v1/docs`**.

---

## 🐳 Optional Docker Setup (`docker compose up`)

If Docker and Docker Desktop are installed on your machine, you can optionally run the containerized multi-service stack:

```bash
docker compose up --build -d
```

### Containerized Services:
- **Backend API:** `http://localhost:5000`
- **MongoDB ReplicaSet (`rs0`):** `localhost:27017`
- **Redis Server:** `localhost:6379`

To stop Docker services:

```bash
docker compose down
```

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default / Example | Description |
|----------|----------|-------------------|-------------|
| `PORT` | No | `5000` | Server HTTP port |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`) |
| `MONGO_URI` | Yes | `mongodb://localhost:27017/shopverse` | MongoDB connection URL (Local or Atlas) |
| `REDIS_URL` | Optional | `redis://localhost:6379` | Redis connection URL (Falls back to in-memory if unavailable) |
| `JWT_SECRET` | Yes | `min_32_characters_secret` | JWT Access Token signing key |
| `JWT_REFRESH_SECRET` | Yes | `min_32_characters_secret` | JWT Refresh Token signing key |
| `RESEND_API_KEY` | Optional | `re_xxxx` | Transactional email API key |
| `IMAGEKIT_PUBLIC_KEY` | Optional | `public_xxxx` | ImageKit storage public key |
| `IMAGEKIT_PRIVATE_KEY` | Optional | `private_xxxx` | ImageKit storage private key |
| `IMAGEKIT_URL_ENDPOINT` | Optional | `https://ik.imagekit.io/xxx` | ImageKit CDN endpoint |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_xxxx` | Razorpay payment key ID |
| `RAZORPAY_KEY_SECRET` | Optional | `xxxx` | Razorpay payment key secret |

---

## 📖 API Documentation

Interactive Swagger UI is accessible at **`http://localhost:5000/api/v1/docs`** during development.

---

## 📜 License

This project is licensed under the **MIT License**.
