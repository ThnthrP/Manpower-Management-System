import React, { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../context/AppContext";
import { Bell } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setIsLoggedin, setUserData } = useContext(AppContent);

  const [openNotif, setOpenNotif] = useState(false);
  const [openUser,  setOpenUser]  = useState(false);
  const timeoutRef = useRef(null);

  const company = userData?.company?.name ?? localStorage.getItem("company");

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      await axios.post(`${backendUrl}/api/auth/logout`);
      setIsLoggedin(false);
      setUserData(false);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnter = () => { clearTimeout(timeoutRef.current); setOpenUser(true); };
  const handleLeave = () => { timeoutRef.current = setTimeout(() => setOpenUser(false), 150); };

  const notifications = [
    { id: 1, text: "Worker training completed", time: "5 min ago" },
    { id: 2, text: "New manpower request",      time: "10 min ago" },
  ];

  const initials = userData?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="w-full flex justify-between items-center px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500 border border-gray-200 px-3 py-1 rounded">
          {company ?? "No Company"}
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <div className="relative">
          <button
            onClick={() => { setOpenNotif(!openNotif); setOpenUser(false); }}
            className="relative p-2 hover:bg-gray-100 rounded text-gray-500"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {openNotif && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 shadow-md rounded z-50">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Notifications</p>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                  <p className="text-sm text-gray-700">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <div className="w-8 h-8 flex items-center justify-center rounded bg-[#1E3A5F] text-white text-sm font-semibold cursor-pointer">
            {initials}
          </div>

          {openUser && (
            <div
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-md rounded w-44 z-50"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 truncate">{userData?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{userData?.role?.name}</p>
              </div>
              <div className="py-1">
                <button onClick={() => navigate("/profile")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile
                </button>
                <button onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
