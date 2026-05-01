import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContent } from "../../context/AppContext";
import { CES_MENU, EXPERT_MENU } from "./sidebarMenu";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useContext(AppContent);

  const role = userData?.role?.name;
  const company = userData?.company?.name;

  const isActive = (path) => location.pathname.startsWith(path);

  const allow = (roles) => {
    if (!roles) return true;
    return roles.includes(role);
  };

  // FIX company mapping
  let menu = [];

  if (company === "CES") {
    menu = CES_MENU;
  } else if (company === "EXPERTEAM") {
    menu = EXPERT_MENU;
  }

  // DEBUG
  console.log("Sidebar Debug:", { role, company, menu });

  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-4 overflow-y-auto">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-lg font-bold">MMS Panel</h2>

        <div className="text-xs mt-1 font-semibold">
          {company === "CES" && (
            <span className="text-blue-400">🏗️ CES (Construction)</span>
          )}
          {company === "EXPERTEAM" && (
            <span className="text-purple-400">🔧 EXPERTEAM (Maintenance)</span>
          )}
          {!company && <span className="text-red-400">No Company</span>}
        </div>
      </div>

      {/* MENU */}
      {menu.map((group, idx) => {
        const filteredItems = group.items.filter((item) => allow(item.roles));

        if (filteredItems.length === 0) return null;

        return (
          <div key={idx} className="mb-6">
            <p className="text-xs text-gray-400 mb-2">{group.section}</p>

            <div className="flex flex-col gap-1">
              {filteredItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`text-left px-3 py-2 rounded transition ${
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
