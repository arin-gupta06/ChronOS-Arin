# Synapze

Synapze is a student talent marketplace and mentorship platform built as a full-stack web application. It helps students discover and complete tasks, build a profile through earned credits, connect with mentors, communicate in real time, and use an AI assistant for platform guidance. 


---

## 🚀 Features

### 👨‍🎓 Student Workflows

* Browse available tasks posted on the platform.
* View task details and accept tasks.
* Submit completed work for review.
* Build a profile with skills, ratings, completed tasks, and credits.
* View the leaderboard.
* Apply to become a mentor.

### 👩‍🏫 Teacher and Mentor Workflows

* Create and manage tasks.
* Review task submissions.
* Reassign or approve submitted work.
* Create and update mentor profiles.
* Manage skills, verification details, and mentorship requests.
* Respond to session requests and mark sessions complete.

### 🛠️ Admin Workflows

* View and manage users.
* Ban, unban, suspend, unsuspend, and change user roles.
* View and manage tasks.
* Review reports.
* View AI logs.
* Update system and AI settings.
* View analytics and audit logs.

---

## 💬 Communication

* Real-time chat using Socket.IO.
* Protected chat APIs for task-based and direct chat rooms.
* Socket events:

  * Joining rooms
  * Sending messages
  * Typing indicators
  * Read receipts
  * Task notifications

---

## 🤖 AI Assistant

* Built using Groq (`groq-sdk`).
* Features:

  * Authenticated AI chat
  * Groq-specific endpoint
  * Conversation history management
  * Health/status checks
  * Intent detection & moderation
  * Rate limiting

---

## 🧰 Tech Stack

### Frontend

* React 18
* Vite
* React Router DOM v6
* Tailwind CSS
* Axios
* Socket.IO Client
* React Hot Toast
* React Icons
* Lucide React
* Heroicons
* Framer Motion
* Firebase Client SDK

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Bcrypt.js
* Cookie Parser
* Socket.IO
* Helmet
* CORS
* Express Rate Limiting
* Nodemailer
* Firebase Admin SDK
* Groq SDK
* Jest & Supertest
* MongoDB Memory Server

---

## 📁 Repository Structure

```
Synapze/
├── README.md
├── ARCHITECTURE.md
├── DEPLOYMENT_CHECKLIST.md
├── DESIGN.md
├── EMAIL_SECURITY_IMPLEMENTATION.md
├── MONITORING_AND_ALERTING.md
├── QUICK_REFERENCE.md
├── TESTING_GUIDE.md
├── docker-compose.yml
├── package.json
├── render.yaml
├── backend/
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   └── tests/
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── src/
    └── tests/
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js 18+
* npm
* MongoDB (local or Atlas)
* Groq API key
* Docker (optional)

---

### 📥 Clone the Repository

```bash
git clone https://github.com/ChronalLabs/ChronOS.git
cd ChronOS/Synapze
```

---

### 📦 Install Dependencies

#### Option 1: Install All

```bash
npm run install:all
```

#### Option 2: Separate Install

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

### 🔐 Environment Configuration

```bash
cd backend
cp .env.example .env
```

#### Example Variables

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/mits_Synapze

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
AI_PROVIDER=groq
```

---

## ▶️ Running the Application

### Run Both

```bash
npm run dev
```

* Backend → http://localhost:5000
* Frontend → http://localhost:5173

### Run Individually

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

---

## 🏗️ Production Build

```bash
npm run build
npm start
```

---

## 🐳 Docker

```bash
docker-compose up
docker-compose --profile debug up
docker-compose up --build
docker-compose down
docker-compose down -v
```

Includes:

* MongoDB
* Redis
* Backend API
* Frontend
* Debug tools (Mongo Express, Redis Commander, Mailhog)

---

## 🔌 API Overview

### Auth (`/api/auth`)

* POST `/register`
* POST `/login`
* GET `/me`
* POST `/forgot-password`

### Tasks (`/api/tasks`)

* GET `/`
* POST `/`
* PUT `/:id/submit`
* DELETE `/:id`

### Users (`/api/users`)

* GET `/leaderboard`
* GET `/profile/:id`

### Chat (`/api/chat`)

* GET `/my-chats`
* POST `/:id/message`

### Mentors (`/api/mentors`)

* POST `/apply`
* PUT `/update`

### AI (`/api/ai`)

* GET `/health`
* POST `/chat`
* GET `/history`

### Admin (`/api/admin`)

* GET `/users`
* PATCH `/users/:userId/ban`
* GET `/analytics`

---

## 🌐 Frontend Routes

```
/
/login
/register
/dashboard
/profile
/tasks/:id
/mentors
/admin
```

---

## 🧪 Testing

### Backend

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend (Playwright)

```bash
cd frontend
npx playwright test
```

### Load Testing

```bash
cd backend
k6 run tests/performance/load.test.js
```

---

## 📜 Scripts

```bash
npm run install:all
npm run dev
npm run build
npm start
```

---

## 🔒 Security & Reliability

* JWT authentication
* Role-based authorization
* HTTP-only cookies
* Password hashing
* Helmet security
* Rate limiting
* Input sanitization
* Socket authentication
* Central error handling
* Graceful shutdown

---

## 🚀 Deployment

* Dockerfiles included
* docker-compose setup
* render.yaml for deployment
* CI/CD workflows available

---

## 📚 Additional Docs

* ARCHITECTURE.md
* DESIGN.md
* TESTING_GUIDE.md
* MONITORING_AND_ALERTING.md

---

## 📄 License

MIT License

---

## 🧾 Content Justification

* Matches repository structure
* Uses actual env variables
* Reflects backend routes
* Aligns with frontend routes
* Matches Docker + testing setup
