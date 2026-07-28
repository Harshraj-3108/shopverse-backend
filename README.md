# ApexCart - Production-Grade E-Commerce REST API Engine

A high-performance, modular, and production-grade E-Commerce backend built using Node.js, Express, and MongoDB. The platform implements **Clean Architecture** principles, the **Repository Pattern**, and a decoupled **Service Layer** to ensure maximum maintainability, scalability, and robust testing isolation.

---

## 🚀 Features

*   **Clean Architecture Scaffolding**: Decoupled layers separating route controllers, business logic services, database repositories, and database schemas.
*   **Fail-Safe Environment validations**: Dynamic boot-time schema checking using Zod to prevent startup on invalid configurations.
*   **Centralized Error Handling**: Custom operational error wrapper (`AppError`) mapping structured API payloads and hiding details in production.
*   **Winston Logging Pipeline**: Daily rolling rotation logs logging http requests and error streams to disk.
*   **Robust Security Handshake**: Secure password hashing (bcrypt), email verification callbacks, short-lived JWT access tokens, and HttpOnly cookies containing rotating refresh tokens.
*   **Token Revocation**: Statefully blacklist refresh tokens in database on user logout.
*   **Category Taxonomy Trees**: Nested parent-child category allocations preventing loops and building hierarchies.

---

## 🛠️ Tech Stack

*   **Core**: Node.js, Express.js (ES Modules)
*   **Database**: MongoDB + Mongoose ORM
*   **Cache & Rate-Limiting**: Redis (planned)
*   **Authentication & Security**: JSON Web Tokens (JWT), Cookie-Parser, Bcryptjs, Helmet
*   **Validations**: Zod
*   **Logging**: Winston + Winston Daily Rotate File
*   **API Documentation**: Swagger / OpenAPI 3.0
*   **Integrations**: Resend (email dispatches), ImageKit (planned), Razorpay (planned)

---

## 📂 Folder Structure

```
d:/E - commerce/
├── backend/                  # Node.js + Express backend service
│   ├── logs/                 # Encrypted/Plain rotational log storage
│   ├── src/
│   │   ├── app.js            # Express application setup
│   │   ├── server.js         # HTTP server entrypoint
│   │   ├── config/           # Setup wrappers (DB, Winston, Resend, etc.)
│   │   ├── constants/        # Mapped static constants (errors codes)
│   │   ├── controllers/      # Parsing layers and HTTP responses
│   │   ├── errors/           # Operational errors classes and log formatters
│   │   ├── middlewares/      # Interceptors (Protect, authorize, validation)
│   │   ├── models/           # Mongoose schemas and collection indexes
│   │   ├── repositories/     # Database-only queries (Base CRUD mappings)
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Core business logic
│   │   └── validators/       # Zod schemas verification
│   ├── .env                  # Private configurations (git-ignored)
│   ├── .env.example          # Blueprint configuration details
│   └── swagger.json          # OpenAPI specifications
├── frontend/                 # Client UI application placeholder
├── README.md                 # Root master documentation
└── .gitignore                # Root gitignore ignore boundaries
```

---

## 💻 Installation Steps

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/apexcart-backend.git
    cd apexcart-backend
    ```

2.  **Install Dependencies**:
    ```bash
    cd backend
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file in the `backend` folder matching the `.env.example` blueprint.

4.  **Launch local Database**:
    Ensure MongoDB is running locally or supply a MongoDB Atlas connection URI.

5.  **Run Server in Development Mode**:
    ```bash
    npm run dev
    ```

6.  **Run Server in Production Mode**:
    ```bash
    npm start
    ```

---

## ⚙️ Environment Variables

Copy the `.env.example` file and configure these keys inside `backend/.env`:
```ini
# Server Config
PORT=5000
NODE_ENV=development

# Database Config
MONGO_URI=mongodb+srv://...

# Redis Cache Config
REDIS_URL=redis://...

# JWT Keys
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# Third Party APIs
RESEND_API_KEY=re_...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

---

## 📖 API Documentation

The project includes an OpenAPI 3.0 Swagger configuration detailing endpoint inputs/outputs located in [swagger.json](file:///d:/E%20-%20commerce/backend/swagger.json).

### Route Summaries
*   **Auth**: Signup (`/auth/signup`), Verify Email (`/auth/verify-email`), Login (`/auth/login`), Token Rotation (`/auth/refresh-token`), Logout (`/auth/logout`), Password Resets (`/auth/forgot-password` & `/auth/reset-password`).
*   **Users Profile & Address Book**: Fetch/Edit Profile (`/users/profile`), Addresses CRUD (`/users/addresses` & `/users/addresses/:addressId`).
*   **Category Taxonomies**: Nested categories trees (`/categories?format=tree`), flat lists (`/categories?format=flat`), slug details (`/categories/:slug`), and admin mutations.

---

## 🗺️ Project Roadmap

1.  **Phase 1-3**: Environment validations, Logger configurations, and MongoDB connection hooks. (Completed)
2.  **Phase 4-5**: Bcrypt secure registers, Resend email dispatches, JWT logins, cookie rotation, and token blacklisting. (Completed)
3.  **Phase 6**: User profiles and address book CRUD mapping. (Completed)
4.  **Phase 7**: Categories taxonomies CRUD and tree calculations. (Completed)
5.  **Phase 8-9**: Products catalog management, ImageKit uploads, pagination, search text-indexing. (Planned)
6.  **Phase 10-12**: Product reviews scoring, Carts tracking, and Wishlists mapping. (Planned)
7.  **Phase 13-16**: Coupon discount rules, checkouts verification, Razorpay webhook loops, and order tracking. (Planned)
8.  **Phase 17-19**: Redis caching, Helmet configurations, Swagger visual endpoints, and multi-stage Dockerizations. (Planned)
