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

## Public quiz API (students, no teacher session)
Each activity has a **code** (e.g. `quiz-de-fundamentos-frontend`). The teacher sees it on
the activity card, and the "Código" button copies it. That code alone opens the quiz:
`http://localhost:5176/a/<code>` (or paste it in the code box of the quiz app).
The lookup is tolerant: the code works in any case, the **title** of the activity works too
("La célula") and the old links (`https://.../actividades/<code>`) still open the activity.
An activity marked as inactive can also be opened, the quiz app only shows a notice.
The backend never sends the expected answers to the browser: every answer is graded server side.

A student registers with their **name only** (no password): `POST /api/public/students`.
The token that comes back is kept by the browser and is used to start the attempts, so all
the attempts of a student are gathered under the same student.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/public/students` | Register a student by name -> returns the student id, name and token |
| `GET` | `/api/public/students/me` | The student behind the token (header `x-student-token`) with their attempts |
| `GET` | `/api/public/activities/:code` | Activity meta (title, description, question count) |
| `GET` | `/api/public/activities/:code/questions` | Every question of the activity (no answer key) |
| `GET` | `/api/public/activities/:code/questions/:number` | A single question, addressed by its number (1 based) |
| `POST` | `/api/public/activities/:code/attempts` | Start an attempt (`studentToken` or `studentName`) - returns the attempt id and its token |
| `PUT` | `/api/public/attempts/:attemptId/answers` | Log one answer (header `x-attempt-token`, body carries `questionNumber` or `questionId`) |
| `POST` | `/api/public/attempts/:attemptId/submit` | Send the solution and get the score |
| `GET` | `/api/public/attempts/:attemptId` | Attempt state (header `x-attempt-token`) |

Supported question types: `abc` (multiple choice), `sort` (ordering), `lines` (matching)
and `concepts` (open answer cards).

The questions of an activity are built from a secret, so the same code always returns the
same question numbers and ids. That way a question can be asked for by its number and the
answer still matches the key of the attempt.

## Project layout
```
TeacherPortal/
  backend/  (Express API)
  frontend/ (React + Vite, teacher portal)
  frontend-quiz/ (React + Vite, public quiz app for students)
  package.json (root scripts)
```

## Quick start

### 1) Backend setup
```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, ACTIVITY_LINK_SECRET, API_KEY (optional)
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

### 3) Quiz app setup
```bash
cd frontend-quiz
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:4000/api
# VITE_API_KEY=  (if backend requires it)
npm install
npm run dev
```
App runs at http://localhost:5176 (proxies /api to 4000). Open an activity with
`http://localhost:5176/a/<slug>`.

To get a ready to try activity (teacher `demo` / `demo1234` with the four question types):
```bash
npm run seed --prefix backend
```

### 4) MongoDB
Use MongoDB Atlas (paste connection string in `MONGODB_URI`) or local `mongodb://127.0.0.1:27017/teacher_portal`.

## Environment variables
See `backend/.env.example` for all required/optional variables. Set `ACTIVITY_LINK_SECRET` to a long, random secret in production; it is used only by the backend to generate hashed activity links and must never be included in frontend code. All env access is centralized in `backend/src/config/env.js`.

## How to extend (modular)
- **Add fields:** Edit `backend/src/models/teacher.model.js`, update validators (`validators/auth.validator.js`), adjust service/controller if needed.
- **Add routes:** Create route + controller + service + repo as needed. Keep DB access only in repository layer.
- **DB:** Change from Mongo to another DB by replacing `repositories/teacher.repository.js` only.
- **Frontend:** UI primitives in `frontend/src/components/ui/` - change once, reuse everywhere.