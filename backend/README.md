# 🛒 ShopVerse – Production-Grade E-Commerce REST API Engine

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Node.js](https://img.shields.io/badge/node.js-v20-blue)
![Express](https://img.shields.io/badge/express-v4.19-lightgrey)
![MongoDB](https://img.shields.io/badge/mongodb-v7.0-green)
![Redis](https://img.shields.io/badge/redis-v7-red)
![License](https://img.shields.io/badge/license-MIT-yellow)

**ShopVerse** is an enterprise-level, production-ready E-Commerce REST API backend built with **Node.js, Express, MongoDB, Redis, and Docker**.

> 💡 **Docker-Optional Architecture:** ShopVerse runs natively on your local machine using **Node.js** and **MongoDB** (local or Atlas) without requiring Docker. Redis and Docker are completely **optional** for local development — if Redis or Docker is not installed, the application automatically degrades gracefully using in-memory fallbacks.

---

## 🚀 Quick Start (Local Setup Without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Start backend server
npm run dev
```

Server launches at `http://localhost:5000`. Swagger API docs available at `http://localhost:5000/api/v1/docs`.
