# TeacherPortal (Template)

Minimal, modular template for a **teacher login/register + home** page.

## Stack
- **Backend:** Node.js + Express (ESM), Mongoose (MongoDB), JWT in httpOnly cookie, Zod validation
- **Frontend:** React (Vite) + Tailwind CSS (easy to restyle), Zustand for auth state
- **Structure:** Repository/Service/Controller pattern on backend; API service + store + components on frontend

## What it includes
- `POST /api/auth/register` - Create teacher (name + password)
- `POST /api/auth/login` - Login (name + password)
- `POST /api/auth/logout` - Logout
- `GET  /api/auth/me` - Get current session (protected)
- Home page (empty by design)
- API key guard via `x-api-key` header (optional - disable by leaving API_KEY empty)

## Project layout
```
TeacherPortal/
  backend/  (Express API)
  frontend/ (React + Vite)
  package.json (root scripts)
```

## Quick start

### 1) Backend setup
```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, API_KEY (optional)
npm install
npm run dev
```
Server runs at http://localhost:4000

### 2) Frontend setup
```bash
cd frontend
cp .env.example .env.local  # or .env
# VITE_API_BASE_URL=/api
# VITE_API_KEY=  (if backend requires it)
npm install
npm run dev
```
App runs at http://localhost:5173 (proxies /api to 4000)

### 3) MongoDB
Use MongoDB Atlas (paste connection string in `MONGODB_URI`) or local `mongodb://127.0.0.1:27017/teacher_portal`.

## Environment variables
See `backend/.env.example` for all required/optional variables. All env access is centralized in `backend/src/config/env.js`.

## How to extend (modular)
- **Add fields:** Edit `backend/src/models/teacher.model.js`, update validators (`validators/auth.validator.js`), adjust service/controller if needed.
- **Add routes:** Create route + controller + service + repo as needed. Keep DB access only in repository layer.
- **DB:** Change from Mongo to another DB by replacing `repositories/teacher.repository.js` only.
- **Frontend:** UI primitives in `frontend/src/components/ui/` - change once, reuse everywhere.