# 🎓 QuizMaster Pro — Full-Stack Quiz & Examination Management System

QuizMaster Pro is a production-grade, full-stack **MERN** (MongoDB, Express, React, Node.js) academic examination platform designed for universities, colleges, and educational institutes. It features role-based access control (Admin, Faculty, Student), AI-assisted question generation, real-time timed test taking, instant auto-grading, and comprehensive audit logs.

---

## 🌟 Key Features & Functional Expectations

### 1. 🔑 Multi-Role Authentication & Access Control
- **Admin Dashboard**: Full system oversight, department and course configuration, user user account management (Faculty & Student enrollment), system stats, and immutable audit logs.
- **Faculty Portal**: Quiz creation, AI-driven question generation with custom difficulty and question count, course assignment, manual grading override, and submission analytics.
- **Student Examination Suite**: Course catalog, timed examination interface with question navigation, instant score calculation, detailed feedback, and historic performance logs.

### 2. ⚡ Resilient Dual-Layer Persistence (MongoDB Atlas + Fallback)
- **Production MongoDB Atlas**: Seamless connection via the standard `MONGO_URI` environment variable with Mongoose schemas and strict validation.
- **In-Memory Fault-Tolerance**: Automatic fallback to a rich in-memory data layer when running in isolated preview environments without a live MongoDB connection string.

### 3. 🤖 AI-Powered Quiz Generation
- Integrated server-side Gemini API support (`@google/genai`) to instantly draft multiple-choice questions, options, correct answer keys, and explanations based on subject topics and difficulty tiers.

### 4. ⏱️ Examination Engine & Auto-Grading
- Timed examination sessions with progress tracking.
- Automatic objective grading upon submission with instantaneous feedback and breakdown of correct vs. incorrect answers.
- Submission attempt logging and preventions against multiple unauthorized re-takes.

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB / Mongoose connection setup & in-memory fallback
│   ├── controllers/         # Express endpoint handlers (Users, Quizzes, Courses, Submissions, Stats)
│   ├── models/              # Mongoose Schemas (User, Quiz, Course, Submission, AuditLog)
│   ├── routes/              # Modular Express REST API routes
│   └── services/            # Gemini AI service integrations
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI views (LoginPage, AdminDashboard, FacultyDashboard, StudentDashboard, QuizPage)
│   │   ├── App.jsx          # Root component & state router
│   │   └── index.css        # Tailwind styling & custom design token declarations
│   └── vite.config.js       # Vite build configuration
├── .env.example             # Environment variable declarations template
├── metadata.json            # Application metadata
├── package.json             # Workspace dependencies & build scripts
└── server.js                # Full-stack Express server entry point
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18+` or higher
- **npm** or **bun**
- *(Optional)* **MongoDB Atlas** database cluster (or local MongoDB instance)

### 2. Environment Setup
Copy `.env.example` to create your environment configuration file:

```bash
cp .env.example .env
```

Define your configuration values:

```env
# Server Port (Defaults to 3000)
PORT=3000

# MongoDB Connection String (Atlas or Local)
# Example: mongodb+srv://username:password@cluster0.mongodb.net/quizmaster?retryWrites=true&w=majority
MONGO_URI=

# Optional: Google Gemini API Key for AI Quiz Generation
GEMINI_API_KEY=
```

### 3. Installation & Local Development

Install project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will launch at `http://localhost:3000`.

---

## 🛠️ Build & Production Deployment

To build the client SPA and bundle the Express server for production:

```bash
# Compile client assets & bundle CommonJS backend
npm run build

# Start production server
npm start
```

---

## 🔌 API Documentation Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/users/login` | Authenticate user credentials and return user role session data |
| `GET` | `/api/users` | List all system users (Admin required) |
| `POST` | `/api/users` | Register a new user |
| `DELETE` | `/api/users/:id` | Remove a user account |
| `GET` | `/api/courses` | Fetch course list |
| `POST` | `/api/courses` | Create a new academic course |
| `GET` | `/api/quizzes` | Fetch quizzes filtered by course or instructor |
| `POST` | `/api/quizzes` | Create a new quiz |
| `PUT` | `/api/quizzes/:id` | Update quiz details |
| `DELETE` | `/api/quizzes/:id` | Delete a quiz |
| `POST` | `/api/submissions` | Submit quiz responses for instant evaluation |
| `GET` | `/api/submissions/student/:id` | View submission history for a student |
| `POST` | `/api/ai/generate-quiz` | Trigger AI generation for quiz questions |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
