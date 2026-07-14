# 🚀 BugForge – Project Management Application

BugForge is a full-stack project management application built with **Next.js**, **Express.js**, **MongoDB**, and **Docker**. It enables users to manage projects, tasks, comments, notifications, and authentication in a secure and scalable environment.

## ✨ Features

- 🔐 JWT Authentication (Access & Refresh Tokens)
- 👤 User Registration & Login
- 📁 Project Management
- ✅ Task Management
- 💬 Comments on Tasks
- 🔔 Notification System
- 📊 Dashboard with Project Statistics
- 🛡️ Rate Limiting & Security Middleware
- 🐳 Docker Support
- 📚 Swagger API Documentation

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Zod Validation

### DevOps
- Docker
- Docker Compose
- Nginx

---

## 📂 Project Structure

```
bugforge/
│
├── apps/
│   ├── api/
│   └── web/
│
├── nginx/
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
cd bugforge
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment

Create a `.env` file in the root directory.

Example:

```env
MONGO_URI=mongodb://localhost:27017/bugforge

JWT_ACCESS_SECRET=your_access_secret

JWT_REFRESH_SECRET=your_refresh_secret

ACCESS_TOKEN_TTL=15m

REFRESH_TOKEN_TTL=7d

API_PORT=4000

NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## ▶️ Run Development Server

### Backend

```bash
pnpm --filter @bugforge/api dev
```

Runs on

```
http://localhost:4000
```

### Frontend

```bash
pnpm --filter @bugforge/web dev
```

Runs on

```
http://localhost:3000
```

---

## 🐳 Run with Docker

```bash
docker compose up --build
```

---

## 🧪 Testing

```bash
pnpm test
```

Lint

```bash
pnpm lint
```

Type Check

```bash
pnpm typecheck
```

---

## 🔒 Security Improvements

- Removed plaintext password logging
- Added authentication rate limiting
- Restricted CORS configuration
- Protected project/task routes
- Added input validation using Zod
- Fixed mass assignment vulnerability
- Removed Stored XSS vulnerability

---

## 📈 Performance Improvements

- Optimized dashboard aggregation queries
- Fixed unnecessary React re-renders
- Added cleanup for polling intervals
- Reduced redundant database queries

---

## 📜 API Documentation

Swagger UI is available after running the backend.

```
http://localhost:4000/api/docs
```
---

## 📄 License

This project is intended for learning and portfolio purposes.
