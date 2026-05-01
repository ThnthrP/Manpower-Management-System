# Manpower Management System (MMS)

A web-based workforce management platform designed for multi-company operations (CES & EXPERTEAM), supporting role-based workflows for manpower requests, deployment, safety, and training.

---

## 📌 Overview

MMS handles **multi-tenant workforce management** where each company operates independently within the same system.

The platform ensures:

- Users cannot access data across companies
- UI (Sidebar / Navbar / Dashboard) adapts dynamically based on **company and role**
- Secure and scalable architecture for offshore and onshore operations

---

## 🔑 Core Architecture

### 🏢 Multi-Company (Multi-Tenant)

- Each user belongs to exactly **one company**
- Data is strictly isolated per company
- Users **cannot login across companies**
- Backend enforces company-level filtering

---

### 🛡️ Role-Based Access Control (RBAC)

- Each user has **one role**
- Roles determine accessible pages, sidebar menu, and API permissions
- Permissions enforced via middleware:

```js
authorize(resource, action)
```

---

### 🧭 Frontend Routing Architecture

```
Login
 → /admin
   → CompanyRouter
     ├── CES
     │     → pages/ces/index.jsx
     │          → switch(role)
     │               → AdminDashboard / PeDashboard / ...
     │
     └── EXPERTEAM
           → pages/expert/index.jsx
                → switch(role)
```

- Single entry point: `/admin`
- Company-based routing
- Role-based UI rendering

---

### 🎯 Dynamic UI Behavior

| Layer     | Controlled By                  |
| --------- | ------------------------------ |
| Company   | Backend (`user.companyId`)     |
| Role      | Backend (`user.role`)          |
| Sidebar   | Frontend (company + role)      |
| Dashboard | Frontend (role switch)         |
| Data      | Backend (filtered by company)  |

---

## 🚀 Features

### 🔐 Authentication

- Email & password login
- JWT (HTTP-only cookie)
- Auto session restore via `/api/auth/is-auth`
- OTP password reset via email

---

### 🏢 Company Isolation

- Users only see their own company's data
- Admin cannot view or modify users from another company
- Company is assigned at registration and is not editable from the UI

---

### 🧭 Role-Based UI

Sidebar and Dashboard change dynamically based on role:

| Role       | View                    |
| ---------- | ----------------------- |
| `admin`    | Full system access      |
| `pe`       | Project-focused view    |
| `pe_head`  | Override PE rejections  |
| `manpower` | Candidate management    |
| `hr`       | Employee management     |
| `safety`   | Safety screenings       |
| `nurse`    | Medical records         |
| `ta`       | Release approvals       |
| `expert`   | SSE review & matching   |
| `bd`       | Customer requirements   |

---

### 📋 Manpower Workflow

```
PE creates request
    ↓
Manpower proposes candidates (Round 1, 2, 3...)
    ↓
PE approves or rejects each candidate
    ↓
Safety check + Medical check must pass
    ↓
Deployment → Assignment created
    ↓
WorkflowLog records every action
```

---

## 🏗️ Tech Stack

### Frontend

- React (Vite)
- React Router v6
- Context API
- Axios
- Tailwind CSS

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT (HTTP-only cookie)
- Nodemailer (OTP email)

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── sidebarMenu.js
│   │   ├── AdminRoute.jsx
│   │   └── ProtectedRoute.jsx        ← allowRoles-based guard
│   ├── context/
│   │   └── AppContext.jsx
│   ├── pages/
│   │   ├── shared/                   ← shared across all companies
│   │   │   ├── Login.jsx
│   │   │   ├── CompanySelect.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── ces/
│   │   │   ├── index.jsx             ← role router (CES)
│   │   │   └── dashboard/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── PeDashboard.jsx
│   │   │       ├── HrDashboard.jsx
│   │   │       ├── ManpowerDashboard.jsx
│   │   │       ├── SafetyDashboard.jsx
│   │   │       ├── NurseDashboard.jsx
│   │   │       └── TaDashboard.jsx
│   │   ├── expert/
│   │   │   ├── index.jsx             ← role router (EXPERT)
│   │   │   └── dashboard/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── PeDashboard.jsx
│   │   │       ├── ManpowerDashboard.jsx
│   │   │       ├── HrDashboard.jsx
│   │   │       ├── SafetyDashboard.jsx
│   │   │       ├── NurseDashboard.jsx
│   │   │       └── ExpertDashboard.jsx
│   │   └── admin/                    ← system-level (all companies)
│   │       ├── AdminUsers.jsx
│   │       └── Notifications.jsx
│   ├── routes/
│   │   ├── shared/
│   │   │   └── SharedRoutes.jsx      ← /, /login, /profile, /admin/users
│   │   └── company/
│   │       ├── CompanyRouter.jsx     ← reads company → CES or EXPERT
│   │       ├── CesRoutes.jsx         ← CES team owns this file
│   │       └── ExpertRoutes.jsx      ← EXPERT team owns this file
│   └── App.jsx                       ← mounts SharedRoutes + CompanyRouter

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
│   ├── userAuth.js                   ← verify JWT + load user with permissions
│   └── authorize.js                  ← RBAC permission check
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── config/
│   ├── prisma.js
│   └── nodemailer.js
└── server.js
```

---

## 🔐 Security Model

| Layer              | Protection                        |
| ------------------ | --------------------------------- |
| Authentication     | JWT (HTTP-only cookie)            |
| Authorization      | RBAC middleware                   |
| Company isolation  | Backend filtering per `companyId` |
| UI access          | `ProtectedRoute` + role check     |

---

## 📌 Key API Rules

| Endpoint              | Rule                                   |
| --------------------- | -------------------------------------- |
| `GET /api/user/all`   | Returns only users in the same company |
| `PUT /api/user/role`  | Admin only                             |
| `user.companyId`      | Not editable via frontend              |

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
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Default admin account

```
Email    : admin@mms.com
Password : admin1234
```

> ⚠️ Change the admin password immediately after first login in production.

---

## 📅 Development Status

| Module                    | Status          |
| ------------------------- | --------------- |
| Authentication (JWT)      | ✅ Done          |
| RBAC (Role + Permission)  | ✅ Done          |
| Multi-company isolation   | ✅ Done          |
| Routing architecture      | ✅ Done          |
| User Management (Admin)   | ✅ Done          |
| Sidebar (dynamic)         | 🔄 In progress  |
| Dashboard (per role)      | 🔄 In progress  |
| Manpower request flow     | 🔄 In progress  |
| Safety / Medical gate     | 🔄 In progress  |
| Training matrix           | ⏳ Planned       |
| Notifications             | ⏳ Planned       |
