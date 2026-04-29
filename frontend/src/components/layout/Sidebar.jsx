import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContent } from "../../context/AppContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useContext(AppContent);

  const role = userData?.role?.name || "guest";

  const isActive = (path) => location.pathname === path;

  // 🔥 function เช็คว่า role นี้เห็น menu ไหม
  const allow = (roles) => {
    if (!roles) return true;
    return roles.includes(role);
  };

  const menu = [
    {
      section: "MAIN",
      items: [{ name: "Dashboard", path: "/dashboard" }],
    },

    {
      section: "PHASE 1 — ONBOARDING",
      items: [
        { name: "Workers", path: "/workers", roles: ["admin", "hr"] },
        { name: "Add Worker", path: "/workers/add", roles: ["admin", "hr"] },
        { name: "Training Matrix", path: "/training-matrix" },
      ],
    },

    {
      section: "PHASE 2 — REQUEST",
      items: [
        { name: "Request Manpower", path: "/requests", roles: ["pe"] },
        { name: "My Requests", path: "/my-requests", roles: ["pe"] },
        { name: "Approval Queue", path: "/approvals", roles: ["mp", "admin"] },
      ],
    },

    {
      section: "PHASE 3 — COMPLIANCE",
      items: [
        {
          name: "Certifications",
          path: "/certifications",
          roles: ["hr", "admin"],
        },
        {
          name: "Training Requirement",
          path: "/training-requirement",
          roles: ["hr"],
        },
        {
          name: "Eligibility Check",
          path: "/eligibility",
          roles: ["mp", "admin"],
        },
      ],
    },

    {
      section: "PHASE 4 — DEPLOYMENT",
      items: [
        { name: "Projects", path: "/projects" },
        { name: "Allocation", path: "/allocation", roles: ["mp", "admin"] },
        { name: "Mobilization", path: "/mobilization", roles: ["mp"] },
      ],
    },

    {
      section: "PHASE 5 — SAFETY",
      items: [
        { name: "HSE / Safety", path: "/safety", roles: ["safety", "admin"] },
        { name: "PPE / Medical", path: "/ppe", roles: ["nurse", "safety"] },
      ],
    },

    {
      section: "INSIGHTS",
      items: [
        {
          name: "Analytics & Reports",
          path: "/reports",
          roles: ["admin", "manager"],
        },
        {
          name: "Client Feedback",
          path: "/feedback",
          roles: ["admin", "manager"],
        },
      ],
    },

    {
      section: "SYSTEM",
      items: [
        { name: "Notifications", path: "/notifications" },
        { name: "User Management", path: "/admin/users", roles: ["admin"] },
        { name: "Admin Settings", path: "/admin/settings", roles: ["admin"] },
      ],
    },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-6">MMS Panel</h2>

      {menu.map((group, idx) => {
        // 🔥 filter item ตาม role
        const filteredItems = group.items.filter((item) => allow(item.roles));

        // ❗ ถ้าไม่มี item เลย ไม่ต้องแสดง section
        if (filteredItems.length === 0) return null;

        return (
          <div key={idx} className="mb-6">
            <p className="text-xs text-gray-400 mb-2">{group.section}</p>

            <div className="flex flex-col gap-1">
              {filteredItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`text-left px-3 py-2 rounded transition 
                    ${
                      isActive(item.path) ? "bg-blue-600" : "hover:bg-slate-700"
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
