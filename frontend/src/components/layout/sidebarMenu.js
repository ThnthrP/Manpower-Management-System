// ============================================================
// sidebarMenu.js
// อ้างอิง: flowchart PDF + meeting notes + dashboard screenshot
// ============================================================

// ─────────────────────────────────────────────
// CES MENU
// flow: PE request → MP → Safety/PPE → Nurse → Deploy
// ─────────────────────────────────────────────
export const CES_MENU = [
  {
    section: "MAIN",
    items: [
      { name: "Dashboard", path: "/admin", icon: "dashboard" },
    ],
  },

  {
    section: "PHASE 1 — ONBOARDING",
    items: [
      // HR ดูแล employee, training, cert
      { name: "Workers",        path: "/admin/workers",         roles: ["admin", "hr", "manpower"] },
      { name: "Add Worker",     path: "/admin/workers/add",     roles: ["admin", "hr"] },
      { name: "Training Matrix",path: "/admin/training-matrix", roles: ["admin", "hr", "manpower", "expert"] },
      { name: "Certifications", path: "/admin/certifications",  roles: ["admin", "hr", "manpower"] },
    ],
  },

  {
    section: "PHASE 2 — REQUEST",
    items: [
      // PE สร้าง request → MP รับ → เสนอ candidate
      { name: "Request Manpower", path: "/admin/requests",          roles: ["pe", "pe_head", "admin"] },
      { name: "My Requests",      path: "/admin/my-requests",       roles: ["pe"] },
      { name: "Approval Queue",   path: "/admin/approvals",         roles: ["manpower", "admin", "pe_head"] },
      { name: "Candidate Review", path: "/admin/candidates",        roles: ["manpower", "admin"] },
    ],
  },

  {
    section: "PHASE 3 — COMPLIANCE",
    items: [
      // SSE / SSHE flow จาก flowchart
      { name: "SSE Compliance",   path: "/admin/sse",               roles: ["admin", "manpower", "safety"] },
      { name: "HSE / Safety",     path: "/admin/safety",            roles: ["admin", "safety"] },
      { name: "PPE / Medical",    path: "/admin/ppe",               roles: ["admin", "nurse", "safety"] },
      { name: "Incidents",        path: "/admin/incidents",         roles: ["admin", "safety"] },
    ],
  },

  {
    section: "PHASE 4 — DEPLOYMENT",
    items: [
      // MP book ลงเรือ, จัด transport, จองที่พัก
      { name: "Projects",       path: "/admin/projects",            roles: ["admin", "pe", "pe_head", "manpower"] },
      { name: "Allocation",     path: "/admin/allocation",          roles: ["admin", "manpower"] },
      { name: "Mobilization",   path: "/admin/mobilization",        roles: ["admin", "manpower"] },
      // TA release approval (แผนกต้นสังกัด)
      { name: "TA Approvals",   path: "/admin/ta-approvals",        roles: ["admin", "ta"] },
    ],
  },

  {
    section: "INSIGHTS",
    items: [
      // report HR + Manpower + HSE (จาก meeting notes)
      { name: "Analytics & Reports", path: "/admin/reports",        roles: ["admin", "manager", "executive"] },
      { name: "Training Matrix",     path: "/admin/training-matrix",roles: ["admin", "hr", "manpower"] },
    ],
  },

  {
    section: "DATABASE",
    items: [
      // export/import จากภาพ dashboard
      { name: "Export Database", path: "/admin/export",             roles: ["admin"] },
      { name: "Import Database", path: "/admin/import",             roles: ["admin"] },
    ],
  },

  {
    section: "SYSTEM",
    items: [
      { name: "User Management", path: "/admin/users",              roles: ["admin"] },
      { name: "Notifications",   path: "/admin/notifications",      roles: ["admin", "manpower"] },
    ],
  },
];

// ─────────────────────────────────────────────
// EXPERT MENU
// flow: User/PE request → MP matching (CV/Cert) → SSE review →
//       TA → Supervisor interview → SSHE → booking → mobilization
// ─────────────────────────────────────────────
export const EXPERT_MENU = [
  {
    section: "MAIN",
    items: [
      { name: "Dashboard", path: "/admin", icon: "dashboard" },
    ],
  },

  {
    section: "PHASE 1 — ONBOARDING",
    items: [
      // matching CV, Cert, Passport จาก flowchart
      { name: "Workers",         path: "/admin/workers",            roles: ["admin", "hr", "manpower"] },
      { name: "Add Worker",      path: "/admin/workers/add",        roles: ["admin", "hr"] },
      { name: "Certifications",  path: "/admin/certifications",     roles: ["admin", "hr", "manpower"] },
      // training matrix แยกตามลูกค้าและแผนก (จาก meeting notes)
      { name: "Training Matrix", path: "/admin/training-matrix",    roles: ["admin", "hr", "manpower", "expert"] },
    ],
  },

  {
    section: "PHASE 2 — COMPLIANCE",
    items: [
      // SSE flow: MP recheck cert CV ตาม F-11
      { name: "Certifications",  path: "/admin/certifications",     roles: ["admin", "manpower", "hr"] },
      // badge แจ้งจำนวน cert ที่ใกล้หมดอายุ (จากภาพ dashboard)
      { name: "Cert Alerts",     path: "/admin/cert-alerts",        roles: ["admin", "manpower", "hr"], badge: true },
    ],
  },

  {
    section: "PHASE 3 — DEPLOYMENT",
    items: [
      { name: "Projects",        path: "/admin/projects",           roles: ["admin", "pe", "manpower"] },
      { name: "Allocation",      path: "/admin/allocation",         roles: ["admin", "manpower"] },
      // Mobilization: MP book ลงเรือ, transport, ที่พัก
      { name: "Mobilization",    path: "/admin/mobilization",       roles: ["admin", "manpower"] },
      { name: "Post-Project Review", path: "/admin/review",         roles: ["admin", "pe", "pe_head"] },
    ],
  },

  {
    section: "PHASE 4 — MOBILIZATION",
    items: [
      // จาก flowchart: MP ตั้งกลุ่มไลน์, จัด transport, จองที่พัก
      { name: "Mobilization",      path: "/admin/mobilization",     roles: ["admin", "manpower"] },
      { name: "Post-Project Review",path: "/admin/review",          roles: ["admin", "pe", "pe_head"] },
    ],
  },

  {
    section: "INSIGHTS",
    items: [
      // dashboard มี Worker Status donut + Cert compliance bar chart
      { name: "Analytics & Reports", path: "/admin/reports",        roles: ["admin", "manager", "executive"] },
      { name: "Training Matrix",     path: "/admin/training-matrix",roles: ["admin", "hr", "manpower"] },
    ],
  },

  {
    section: "DATABASE",
    items: [
      // export/import จากภาพ dashboard
      { name: "Export Database", path: "/admin/export",             roles: ["admin"] },
      { name: "Import Database", path: "/admin/import",             roles: ["admin"] },
    ],
  },

  {
    section: "SYSTEM",
    items: [
      { name: "User Management", path: "/admin/users",              roles: ["admin"] },
      { name: "Notifications",   path: "/admin/notifications",      roles: ["admin", "manpower"] },
    ],
  },
];