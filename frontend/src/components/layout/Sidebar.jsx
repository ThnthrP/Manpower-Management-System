import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContent } from "../../context/AppContext";
import { CES_MENU, EXPERT_MENU, YARD2_MENU } from "./sidebarMenu";

const COMPANY_LABEL = {
  CES:       "CES",
  EXPERTEAM: "EXPERTEAM",
  YARD2:     "YARD 2",
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useContext(AppContent);

  const role    = userData?.role?.name;
  const company = userData?.company?.name;

  const isActive = (path) => location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
  const allow    = (roles) => !roles || roles.includes(role);

  let menu = [];
  if (company === "CES")       menu = CES_MENU;
  else if (company === "EXPERTEAM") menu = EXPERT_MENU;
  else if (company === "YARD2")     menu = YARD2_MENU;

  return (
    <div className="w-60 h-screen flex flex-col bg-[#1E3A5F] text-white overflow-y-auto flex-shrink-0">
      {/* HEADER */}
      <div className="px-5 py-5 border-b border-[#2D5A8E]">
        <div className="text-base font-bold tracking-wide">MMS</div>
        <div className="text-xs text-slate-300 mt-0.5">
          {COMPANY_LABEL[company] ?? "—"}
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 px-3 py-4 space-y-5">
        {menu.map((group, idx) => {
          const items = group.items.filter((item) => allow(item.roles));
          if (items.length === 0) return null;

          return (
            <div key={idx}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 mb-1">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      isActive(item.path)
                        ? "bg-white text-[#1E3A5F] font-semibold"
                        : "text-slate-200 hover:bg-[#2D5A8E] hover:text-white"
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
    </div>
  );
};

export default Sidebar;
