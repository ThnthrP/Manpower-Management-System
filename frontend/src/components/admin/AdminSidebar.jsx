import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 🔥 ต้องมี
import { AppContent } from "../../context/AppContext"; // 🔥 ต้องมี

const AdminSidebar = () => {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin, setUserData } = useContext(AppContent); // 🔥 ดึงจาก context

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);

      if (data.success) {
        setIsLoggedin(false);
        setUserData(false);
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    // <div className="w-60 min-h-screen bg-slate-900 text-white p-4 flex flex-col justify-between">
    <div className="w-60 h-screen sticky top-0 bg-slate-900 text-white p-4 flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold mb-4">Admin Panel</h2>

        {/* <button
          onClick={() => navigate("/admin/profile")}
          className="text-left hover:bg-slate-700 p-2 rounded"
        >
          Profile
        </button> */}

        <button
          onClick={() => navigate("/admin")}
          className="text-left hover:bg-slate-700 p-2 rounded"
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/admin/bookings")}
          className="text-left hover:bg-slate-700 p-2 rounded"
        >
          Bookings
        </button>

        <button
          onClick={() => navigate("/admin/cost")}
          className="text-left hover:bg-slate-700 p-2 rounded"
        >
          Cost Management
        </button>
      </div>

      {/* 🔥 Logout */}
      {/* <button
        onClick={logout}
        className="bg-red-500 p-2 rounded hover:bg-red-600"
      >
        Logout
      </button> */}
    </div>
  );
};

export default AdminSidebar;
