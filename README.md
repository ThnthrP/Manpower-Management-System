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
├── public/
│
├── src/
│
│   ├── assets/
│   │
│   │   ├── images/
│   │   ├── icons/
│   │   └── logos/
│
│   ├── components/
│   │
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── sidebarMenu.js
│   │   │
│   │   ├── guards/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── StatusBadge.jsx
│   │   │
│   │   └── common/
│   │       ├── PageHeader.jsx
│   │       ├── EmptyState.jsx
│   │       ├── SearchInput.jsx
│   │       └── ConfirmDialog.jsx
│
│   ├── context/
│   │   ├── AppContext.jsx
│   │   ├── AuthContext.jsx
│   │   └── CompanyContext.jsx
│
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCompany.js
│   │   └── usePermission.js
│
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── employeeService.js
│   │   ├── trainingService.js
│   │   ├── medicalService.js
│   │   └── manpowerService.js
│
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── calculateExperience.js
│   │   ├── constants.js
│   │   └── permissions.js
│
│   ├── pages/
│   │
│   │   ├── shared/
│   │   │   ├── Login.jsx
│   │   │   ├── CompanySelect.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Unauthorized.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── expert/
│   │   │
│   │   │   ├── index.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── HrDashboard.jsx
│   │   │   │   ├── PeDashboard.jsx
│   │   │   │   ├── SafetyDashboard.jsx
│   │   │   │   ├── NurseDashboard.jsx
│   │   │   │   ├── ManpowerDashboard.jsx
│   │   │   │   └── ExpertDashboard.jsx
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── EmployeeList.jsx
│   │   │   │   ├── EmployeeDetail.jsx
│   │   │   │   ├── EmployeeProfile.jsx
│   │   │   │   └── EmployeeTraining.jsx
│   │   │   │
│   │   │   ├── trainings/
│   │   │   │   ├── TrainingMatrixExpert.jsx
│   │   │   │   ├── TrainingRequirement.jsx
│   │   │   │   ├── TrainingHistory.jsx
│   │   │   │   └── TrainingDashboard.jsx
│   │   │   │
│   │   │   ├── medical/
│   │   │   │   ├── MedicalDashboard.jsx
│   │   │   │   ├── MedicalList.jsx
│   │   │   │   └── MedicalHistory.jsx
│   │   │   │
│   │   │   ├── manpower/
│   │   │   │   ├── RequestList.jsx
│   │   │   │   ├── BookingList.jsx
│   │   │   │   ├── AssignmentList.jsx
│   │   │   │   └── DeploymentBoard.jsx
│   │   │   │
│   │   │   ├── safety/
│   │   │   │   ├── SafetyDashboard.jsx
│   │   │   │   ├── SafetyChecks.jsx
│   │   │   │   └── IncidentReports.jsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── AdminUsers.jsx
│   │   │       ├── Roles.jsx
│   │   │       ├── Permissions.jsx
│   │   │       └── Notifications.jsx
│   │   │
│   │   ├── ces/
│   │   │
│   │   │   ├── index.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── HrDashboard.jsx
│   │   │   │   ├── PeDashboard.jsx
│   │   │   │   ├── SafetyDashboard.jsx
│   │   │   │   ├── NurseDashboard.jsx
│   │   │   │   ├── ManpowerDashboard.jsx
│   │   │   │   └── TaDashboard.jsx
│   │   │   │
│   │   │   ├── manpower/
│   │   │   ├── employees/
│   │   │   ├── trainings/
│   │   │   ├── medical/
│   │   │   └── safety/
│   │   │
│   │   └── system/
│   │       ├── Companies.jsx
│   │       ├── Contracts.jsx
│   │       ├── Notifications.jsx
│   │       └── SystemDashboard.jsx
│
│   ├── routes/
│   │
│   │   ├── shared/
│   │   │   └── SharedRoutes.jsx
│   │   │
│   │   ├── company/
│   │   │   ├── CompanyRouter.jsx
│   │   │   ├── ExpertRoutes.jsx
│   │   │   └── CesRoutes.jsx
│   │   │
│   │   └── index.jsx
│
│   ├── styles/
│   │   ├── index.css
│   │   └── theme.css
│
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── .gitignore
├── package.json
└── vite.config.js

backend/
├── config/
│   ├── prisma.js
│   ├── nodemailer.js
│   ├── emailTemplates.js
│   ├── jwt.js
│   └── multer.js
│
├── controllers/
│
│   ├── auth/
│   │   └── authController.js
│   │
│   ├── employee/
│   │   ├── employeeController.js
│   │   ├── employeeTrainingController.js
│   │   └── medicalController.js
│   │
│   ├── manpower/
│   │   ├── requestController.js
│   │   ├── bookingController.js
│   │   └── assignmentController.js
│   │
│   ├── safety/
│   │   └── safetyController.js
│   │
│   └── admin/
│       ├── userController.js
│       ├── roleController.js
│       └── permissionController.js
│
├── middleware/
│   ├── authorize.js
│   ├── upload.js
│   ├── userAuth.js
│   ├── errorHandler.js
│   └── validateRequest.js
│
├── prisma/
│
│   ├── migrations/
│   │
│   ├── seeds/
│   │
│   │   ├── common/
│   │   │   ├── seedCompanies.js
│   │   │   ├── seedClients.js
│   │   │   ├── seedContracts.js
│   │   │   ├── seedPositions.js
│   │   │   ├── seedGlobalTrainings.js
│   │   │   ├── seedMedicalRequirements.js
│   │   │   ├── seedTrainingStandards.js
│   │   │   ├── seedTrainings.js
│   │   │   └── clearTraining.js
│   │   │
│   │   ├── chevron/
│   │   │   └── seedClientTrainings.js
│   │   │
│   │   ├── erawan/
│   │   │   └── seedClientTrainings.js
│   │   │
│   │   ├── ptt/
│   │   │   └── seedClientTrainings.js
│   │   │
│   │   └── valeura/
│   │       └── seedClientTrainings.js
│   │
│   ├── schema.prisma
│   ├── seed.js
│   └── trainingMapping.json
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── employeeRoutes.js
│   ├── trainingRoutes.js
│   ├── medicalRoutes.js
│   ├── safetyRoutes.js
│   ├── requestRoutes.js
│   ├── bookingRoutes.js
│   └── assignmentRoutes.js
│
├── scripts/
│
│   ├── common/
│   │   ├── parseDate.js
│   │   ├── cleanText.js
│   │   ├── normalizeName.js
│   │   ├── normalizePosition.js
│   │   └── excelHelpers.js
│   │
│   ├── chevron/
│   │   ├── importEmployees.js
│   │   ├── importEmployeeTrainings.js
│   │   └── importMatrix.js
│   │
│   ├── erawan/
│   │   ├── importEmployees.js
│   │   ├── importEmployeeTrainings.js
│   │   └── importMatrix.js
│   │
│   ├── ptt/
│   │   ├── importEmployees.js
│   │   ├── importEmployeeTrainings.js
│   │   └── importMatrix.js
│   │
│   ├── valeura/
│   │   ├── importEmployees.js
│   │   ├── importEmployeeTrainings.js
│   │   └── importMatrix.js
│   │
│   ├── resetImportData.js
│   └── debugExcel.js
│
├── services/
│   ├── authService.js
│   ├── employeeService.js
│   ├── trainingService.js
│   ├── medicalService.js
│   ├── manpowerService.js
│   └── notificationService.js
│
├── utils/
│   ├── calculateExperience.js
│   ├── formatDate.js
│   ├── constants.js
│   ├── permissions.js
│   └── trainingStatus.js
│
├── uploads/
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
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
