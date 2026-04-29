# Manpower Management System (MMS)

A web-based workforce management platform for managing employees, projects, manpower requests, training, safety, and deployment workflows — built for offshore and onshore operations.

---

## 📌 Overview

MMS streamlines the end-to-end process of requesting and deploying manpower across projects. The system handles role-based access for multiple stakeholders (PE, Manpower, HR, Safety, Nurse, BD, Expert, TA), candidate round selection, safety/medical gate checks, and full audit logging.

---

## 🚀 Features

### 🔐 Authentication
- User registration & login (email + password)
- JWT stored in HTTP-only cookies
- Auto session restore on page refresh (`/api/auth/is-auth`)
- Password reset via OTP email

### 🛡️ Role-Based Access Control (RBAC)
- **Single role per user** — each user has exactly one role
- **Permission layer** — roles are mapped to granular permissions (e.g. `mp_request:create`, `employee:view`)
- `authorize(resource, action)` middleware enforces access at the API level
- Supported roles:

| Role | Description |
|---|---|
| `admin` | Full system access |
| `executive` | Read-only overview |
| `manager` | Project oversight, approve candidates |
| `pe_head` | Override PE rejections |
| `pe` | Create requests, approve/reject candidates |
| `manpower` | Propose candidates, manage assignments |
| `hr` | Manage employees, training, certificates |
| `safety` | Record safety screenings |
| `nurse` | Record medical checks and health certificates |
| `bd` | Manage customer requirements per position |
| `expert` | Review training matrix, propose candidates |
| `ta` | Approve employee release from home department |

### 📋 Manpower Request Flow
```
PE creates request
    ↓
Manpower proposes candidates (Round 1)
    ↓
PE approves or rejects each candidate
    ↓
If all rejected → new round opened (Round 2, 3...)
If rejected ≥ 3 rounds → escalate to PE Head
    ↓
Approved candidate → Booking created
    ↓
Safety check + Medical check must pass
    ↓
Booking approved → Assignment created (deployed)
    ↓
WorkflowLog records every action
```

### 📊 Admin Dashboard
- Overview cards: Total Users, Projects, Active Requests, Alerts
- Sidebar: Dashboard, Training Matrix, Projects, Notifications

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- React Router v6
- Context API (global auth state)
- Axios
- Tailwind CSS

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT (HTTP-only cookie)
- Nodemailer (OTP email)

---

## 🗄️ Database Schema (Key Models)

```
User ──── Role ──── RolePermission ──── Permission
 │
 └── Employee ──── Company
      ├── EmployeeSkill ──── Skill
      ├── EmployeeTraining ──── Training
      ├── Certificate / HealthCertificate
      ├── SafetyCheck
      └── MedicalCheck

Project ──── ManpowerRequest
              ├── CandidateRound
              │    └── Candidate ──── Employee
              │         └── CustomerDecision
              ├── Booking ──── Assignment
              └── WorkflowLog
```

> Full schema: [`server/prisma/schema.prisma`](./server/prisma/schema.prisma)

---

## 🔑 Authentication Flow

```
1. POST /api/auth/login
       ↓
   Backend verifies credentials
       ↓
   JWT signed → stored in HTTP-only cookie
       ↓
2. GET /api/auth/is-auth   (on every page load)
       ↓
   userAuth middleware: verifies JWT → loads user + role + permissions
       ↓
3. GET /api/user/data
       ↓
   Returns { id, name, email, role, permissions[] }
       ↓
4. AppContext stores userData
       ↓
5. Redirect by role:
   admin    → /admin
   others   → /dashboard
```

---

## 🛡️ Authorization (RBAC)

Every protected API route uses two middlewares in sequence:

```js
router.post("/", userAuth, authorize("mp_request", "create"), handler);
//            ↑              ↑
//     verify JWT      check permission
```

`userAuth` loads the full user including role and permissions from DB.  
`authorize(resource, action)` checks that the user's role has the required permission — returns `403` if not.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AppContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CompanySelect.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       └── AdminUsers.jsx
│   └── App.jsx

server/
├── controllers/
│   └── authController.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── safetyRoutes.js
│   ├── medicalRoutes.js
│   └── requestRoutes.js
├── middleware/
│   ├── userAuth.js       ← verify JWT + load user with permissions
│   └── authorize.js      ← RBAC permission check
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── config/
│   ├── prisma.js
│   └── nodemailer.js
└── server.js
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/manpower_db
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password
```

### Frontend (`frontend/.env`)
```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## ▶️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mms.git
cd mms
```

### 2. Backend setup
```bash
cd server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run database migrations
npx prisma migrate dev --name init

# Seed roles, permissions, and admin user
node prisma/seed.js

# Start dev server
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Default admin account (after seed)
```
Email    : admin@mms.com
Password : admin1234
```

> ⚠️ Change the admin password immediately after first login in production.

---

## 📌 API Routes (Overview)

| Method | Endpoint | Auth | Permission |
|---|---|---|---|
| POST | `/api/auth/register` | — | — |
| POST | `/api/auth/login` | — | — |
| POST | `/api/auth/logout` | — | — |
| GET | `/api/auth/is-auth` | ✓ | — |
| GET | `/api/user/data` | ✓ | — |
| GET | `/api/safety` | ✓ | `safety:view` |
| POST | `/api/safety` | ✓ | `safety:manage` |
| GET | `/api/medical` | ✓ | `medical:view` |
| POST | `/api/medical` | ✓ | `medical:manage` |
| GET | `/api/request` | ✓ | `mp_request:view` |
| POST | `/api/request` | ✓ | `mp_request:create` |

---

## 📅 Development Status

| Module | Status |
|---|---|
| Authentication (JWT + Cookie) | ✅ Done |
| RBAC (Role + Permission) | ✅ Done |
| Database schema | ✅ Done |
| Seed data | ✅ Done |
| Employee management | 🔄 In progress |
| Manpower request flow | 🔄 In progress |
| Candidate round system | 🔄 In progress |
| Safety / Medical gate | 🔄 In progress |
| Admin dashboard | 🔄 In progress |
| Notifications | ⏳ Planned |
| Training matrix | ⏳ Planned |
