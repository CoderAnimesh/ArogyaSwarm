<div align="center">

# 🏥 Arogya-Swarm HMS

### Hospital Management System with AI-Powered Triage

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)](LICENSE)

<br/>

**A full-stack, role-based Hospital Management System featuring AI-driven patient triage, real-time appointment scheduling, smart pharmacy management, ASHA worker coordination, and environmental bio-waste impact analysis — all within a single unified platform.**

[🚀 Live Demo](#) · [🐛 Report Bug](https://github.com/psychobeast071/hms/issues) · [💡 Request Feature](https://github.com/psychobeast071/hms/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Folder Structure](#-folder-structure)
- [⚙️ Installation](#️-installation)
- [🔐 Environment Variables](#-environment-variables)
- [▶️ Running the Project](#️-running-the-project)
- [🌐 API Endpoints](#-api-endpoints)
- [📸 Screenshots](#-screenshots)
- [🔮 Future Improvements](#-future-improvements)
- [👨‍💻 Author](#-author)
- [📄 License](#-license)

---

## 🏥 About the Project

**Arogya-Swarm HMS** is a modern, multi-role Hospital Management System designed to digitize and streamline every aspect of hospital operations. From patient self-registration to AI-assisted medical triage, smart appointment assignment, and pharmacy inventory tracking — this system brings all stakeholders under one roof.

The platform supports **4 distinct user roles**, each with a dedicated dashboard and role-protected routes:

| Role | Access |
|------|--------|
| 👨‍⚕️ **Doctor** | View assigned patients, prescribe medicines, manage queue |
| 🛡️ **Admin** | Manage all users, appointments, medicines, ASHA tasks, stats |
| 🤒 **Patient** | Register, triage chat with AI, book appointments, view prescriptions |
| 🌿 **ASHA Worker** | View assigned community health tasks, mark tasks complete |

---

## ✨ Features

### 🤖 AI-Powered Patient Triage
- Conversational AI nurse powered by **Google Gemini 2.5 Flash**
- Strictly medical-domain restricted chat (rejects off-topic queries)
- Automatically generates a structured clinical **AI Summary** for the doctor
- Condition tagging (e.g., *"Acute Headache"*, *"Fever"*) on appointment booking

### 📅 Smart Appointment Management
- Patients submit symptoms and book appointments in minutes
- Admins assign doctors and the system **auto-calculates predicted consultation time** based on queue position (15 min/patient from 9:00 AM)
- Auto-generates appointment reference numbers (format: `APT-DDMM-XXXX`)

### 💊 Pharmacy & Prescription Engine
- Doctors can prescribe **multiple medicines** per appointment in a single interaction
- System automatically **deducts stock** based on frequency × days logic
- Stock-out protection with pre-prescription validation
- Patients can view their complete prescription history with medicine names

### 🌿 ASHA Worker Management
- Admins create and assign community health tasks to ASHA workers
- ASHA workers have their own dedicated portal to track and complete tasks

### 🌍 Environmental Impact Dashboard
- Powered by **OpenWeatherMap API** (with smart fallback data)
- **Bio-waste prediction model** that factors in temperature, humidity, and wind speed
- Calculates hourly/daily/weekly/monthly waste projections
- Carbon footprint (CO₂) calculation for incineration + transport
- Aerosol dispersion risk, water contamination alerts, and sanitation recommendations
- Interactive **Chart.js** visualizations

### 🔐 Security
- **JWT authentication** with 24-hour token expiry
- **bcrypt** password hashing (10 salt rounds)
- Role-based route protection on both frontend (React Context) and backend (middleware)
- CORS configured for dev/prod origins

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI Framework |
| TypeScript | ~6.0 | Type Safety |
| Vite | 8.x | Build Tool & Dev Server |
| React Router DOM | 7.x | Client-Side Routing |
| Axios | 1.x | HTTP Client |
| Chart.js + react-chartjs-2 | 4.x / 5.x | Data Visualizations |
| AOS | 2.x | Scroll Animations |
| Font Awesome | 7.x | Icons |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js + Express | 5.x | REST API Server |
| Drizzle ORM | 0.45.x | Type-safe Database ORM |
| Drizzle Kit | 0.31.x | Schema Migrations & Push |
| Neon Postgres (Serverless) | 1.x | Cloud PostgreSQL Database |
| JSON Web Token (JWT) | 9.x | Authentication Tokens |
| bcrypt | 6.x | Password Hashing |
| dotenv | 17.x | Environment Config |
| Google Generative AI SDK | 0.24.x | Gemini AI Integration |
| Axios | 1.x | Weather API HTTP Client |
| Nodemon | 3.x | Dev Hot Reload |

---

## 📁 Folder Structure

```
hms/
├── backend/                        # Node.js + Express API
│   ├── db/
│   │   ├── index.js                # Neon + Drizzle connection setup
│   │   └── schema.js               # Database table definitions (Drizzle ORM)
│   ├── middleware/
│   │   └── auth.middleware.js      # JWT token verification middleware
│   ├── routes/
│   │   ├── auth.js                 # POST /register, POST /login
│   │   ├── appointments.js         # GET /, POST /book, GET /:id/prescriptions
│   │   ├── admin.js                # Admin-only CRUD routes
│   │   ├── doctor.js               # Doctor appointment & prescription routes
│   │   ├── asha.js                 # ASHA worker task routes
│   │   ├── ai.js                   # Gemini AI chat & summarize routes
│   │   └── environment.js          # Bio-waste & environmental impact route
│   ├── .env                        # Environment variables (not committed)
│   ├── drizzle.config.js           # Drizzle ORM configuration
│   └── server.js                   # Express app entry point
│
└── frontend/                       # React + TypeScript + Vite
    ├── public/                     # Static assets
    ├── src/
    │   ├── api/
    │   │   └── api.ts              # Centralized Axios API layer
    │   ├── context/
    │   │   └── AuthContext.tsx     # Auth state + ProtectedRoute component
    │   ├── pages/
    │   │   ├── LandingPage.tsx     # Public landing/home page
    │   │   ├── LoginPage.tsx       # Role-based login
    │   │   ├── RegisterPage.tsx    # Patient self-registration
    │   │   ├── AdminDashboard.tsx  # Admin management portal
    │   │   ├── DoctorDashboard.tsx # Doctor's patient & prescription view
    │   │   ├── PatientDashboard.tsx# Patient triage, booking, history
    │   │   └── AshaDashboard.tsx   # ASHA task tracker
    │   ├── types/                  # Shared TypeScript interfaces
    │   ├── utils/                  # Utility/helper functions
    │   ├── assets/                 # Images and static assets
    │   ├── App.tsx                 # Root router & route guards
    │   └── main.tsx                # Vite entry point
    ├── index.html                  # HTML entry point
    ├── vite.config.ts              # Vite config
    └── tsconfig.json               # TypeScript config
```

---

## ⚙️ Installation

### Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
- **npm** ≥ 9.x (bundled with Node.js)
- A **Neon PostgreSQL** database — [Create free account](https://neon.tech/)
- (Optional) **Google Gemini API Key** — [Get API Key](https://ai.google.dev/)
- (Optional) **OpenWeatherMap API Key** — [Get API Key](https://openweathermap.org/api)

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/psychobeast071/hms.git
cd hms
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Configure Environment Variables

```bash
# Create your .env file in the backend directory
cp .env.example .env
# Then edit .env with your actual credentials (see Environment Variables section)
```

#### 4. Push the Database Schema

```bash
# Inside /backend
npm run db:push
```

> This uses Drizzle Kit to sync your schema to Neon Postgres automatically.

#### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
# ── Server ──────────────────────────────────────────────
PORT=3000

# ── Authentication ───────────────────────────────────────
JWT_SECRET=your_super_secure_random_secret_here

# ── Database (Neon PostgreSQL) ───────────────────────────
# Get this from your Neon project dashboard
DATABASE_URL="postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/dbname?sslmode=require&channel_binding=require"

# ── AI Integration (Google Gemini) ───────────────────────
# Leave blank to use built-in mock AI responses
GEMINI_API_KEY="your_gemini_api_key_here"

# ── Weather API (OpenWeatherMap) ─────────────────────────
# Leave blank to use built-in fallback weather data
WEATHER_API_KEY="your_openweathermap_api_key_here"
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## ▶️ Running the Project

### Start the Backend Server

```bash
cd backend

# Development mode (with hot reload via Nodemon)
npm run dev

# Production mode
npm start
```

> Backend runs on **http://localhost:3000**

### Start the Frontend Dev Server

```bash
cd frontend

# Start Vite dev server
npm run dev
```

> Frontend runs on **http://localhost:5173**

### Build Frontend for Production

```bash
cd frontend
npm run build
```

> The compiled output goes to `frontend/dist/`. The Express server is already configured to serve this directory statically for a single-deployment setup.

### Database Commands

```bash
cd backend

# Generate migration files
npm run db:generate

# Push schema to database (sync)
npm run db:push
```

---

## 🌐 API Endpoints

### 🔓 Auth (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new patient | ❌ |
| `POST` | `/api/auth/login` | Login for all roles (returns JWT) | ❌ |

### 👤 Patient (`/api/appointments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/appointments` | Get my appointments (enriched with doctor info) | ✅ Patient |
| `POST` | `/api/appointments/book` | Book a new appointment | ✅ Patient |
| `GET` | `/api/appointments/:id/prescriptions` | View prescriptions for an appointment | ✅ Patient |

### 👨‍⚕️ Doctor (`/api/doctor`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/doctor/appointments` | Get all assigned appointments | ✅ Doctor |
| `POST` | `/api/doctor/appointments/:id/prescribe` | Prescribe medicines (deducts stock) | ✅ Doctor |
| `GET` | `/api/doctor/prescriptions/:aptId` | Get prescriptions with medicine names | ✅ Doctor |

### 🛡️ Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin/stats` | Dashboard statistics | ✅ Admin |
| `GET` | `/api/admin/appointments` | All appointments | ✅ Admin |
| `POST` | `/api/admin/appointments/:id/assign` | Assign doctor + auto-queue time | ✅ Admin |
| `GET` | `/api/admin/doctors` | List all doctors | ✅ Admin |
| `POST` | `/api/admin/doctors` | Add a new doctor | ✅ Admin |
| `GET` | `/api/admin/doctors/:id/patients` | Get patients of a doctor | ✅ Admin |
| `GET` | `/api/admin/medicines` | List all medicines (& stock) | ✅ Any |
| `POST` | `/api/admin/medicines` | Add new medicine to inventory | ✅ Admin |
| `GET` | `/api/admin/ashas` | List all ASHA workers | ✅ Admin |
| `POST` | `/api/admin/ashas` | Add a new ASHA worker | ✅ Admin |
| `GET` | `/api/admin/asha-tasks` | List all ASHA tasks | ✅ Admin |
| `POST` | `/api/admin/asha-tasks` | Assign task to ASHA worker | ✅ Admin |

### 🌿 ASHA Worker (`/api/asha`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/asha/tasks` | Get my assigned tasks | ✅ ASHA |
| `POST` | `/api/asha/tasks/:id/complete` | Mark a task as completed | ✅ ASHA |

### 🤖 AI (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/ai/chat` | Conversational triage chat (Gemini) | ✅ Patient |
| `POST` | `/api/ai/summarize` | Generate clinical summary from chat | ✅ Patient |

### 🌍 Environment (`/api/environment`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/environment/impact` | Bio-waste prediction & CO₂ footprint | ❌ |

### ❤️ Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | API status check |

---

## 📸 Screenshots

> 🖼️ Screenshots will be added once the application is deployed.

| Page | Preview |
|------|---------|
| 🏠 Landing Page | *Coming soon* |
| 🔐 Login / Register | *Coming soon* |
| 🛡️ Admin Dashboard | *Coming soon* |
| 👨‍⚕️ Doctor Dashboard | *Coming soon* |
| 🤒 Patient Triage Chat | *Coming soon* |
| 🌿 ASHA Worker Portal | *Coming soon* |
| 🌍 Environmental Dashboard | *Coming soon* |

---

## 🔮 Future Improvements

| # | Enhancement | Priority |
|---|-------------|----------|
| 1 | 📱 Progressive Web App (PWA) with offline support | High |
| 2 | 📧 Email notifications for appointment status changes | High |
| 3 | 📊 PDF generation for prescriptions and reports | Medium |
| 4 | 💬 Real-time doctor-patient messaging via WebSockets | Medium |
| 5 | 🗓️ Calendar view for appointment scheduling | Medium |
| 6 | 📍 Geo-location tracking for ASHA field workers | Medium |
| 7 | 🌐 Multi-language support (Hindi, regional languages) | Medium |
| 8 | 🔔 In-app push notification system | Low |
| 9 | 📷 Medical image upload for patient reports | Low |
| 10 | 🏥 Multi-hospital / multi-branch support | Low |

---

## 👨‍💻 Author

<div align="center">

### Animesh Pathak

[![GitHub](https://img.shields.io/badge/GitHub-CoderAnimesh-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/CoderAnimesh)

*Full-Stack Developer | Building tech for healthcare*

</div>

---

## 📄 License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2025 Animesh Pathak

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

<div align="center">

⭐ **If you found this project useful, please consider giving it a star!** ⭐

Made with ❤️ by [Animesh Pathak](https://github.com/CoderAnimesh)

</div>
