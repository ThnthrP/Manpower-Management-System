export const CES_MENU = [
  {
    section: "MAIN",
    items: [{ name: "Dashboard", path: "/dashboard" }],
  },

  {
    section: "CONSTRUCTION",
    items: [
      { name: "Projects", path: "/projects" },
      { name: "Workers", path: "/workers", roles: ["admin", "hr"] },
      { name: "Sites", path: "/sites" },
      { name: "Incidents", path: "/incidents", roles: ["safety", "admin"] },
    ],
  },

  {
    section: "SYSTEM",
    items: [
      { name: "User Management", path: "/admin/users", roles: ["admin"] },
    ],
  },
];

export const EXPERT_MENU = [
  {
    section: "MAIN",
    items: [{ name: "Dashboard", path: "/dashboard" }],
  },

  {
    section: "MAINTENANCE",
    items: [
      { name: "Active Jobs", path: "/jobs" },
      { name: "Engineers", path: "/engineers" },
      { name: "Maintenance Logs", path: "/maintenance" },
      { name: "Alerts", path: "/alerts", roles: ["admin"] },
    ],
  },

  {
    section: "SYSTEM",
    items: [
      { name: "User Management", path: "/admin/users", roles: ["admin"] },
    ],
  },
];
