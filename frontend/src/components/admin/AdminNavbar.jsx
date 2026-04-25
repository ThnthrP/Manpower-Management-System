import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../context/AppContext";
import logo from "../../assets/experteam_logo.png";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setIsLoggedin, setUserData } =
    useContext(AppContent);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;

      await axios.post(`${backendUrl}/api/auth/logout`);

      setIsLoggedin(false);
      setUserData(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full flex justify-between items-center px-4 sm:px-10 py-3 bg-white shadow sticky top-0 z-50">
      {/* LOGO */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/admin")}
      >
        <img
          src={logo}
          alt="logo"
          className="h-12 sm:h-14 w-auto object-contain"
        />

        <div className="leading-tight">
          <p className="text-sm sm:text-base font-semibold text-gray-800 leading-none">
            Transportation
          </p>
          <p className="text-sm sm:text-base font-semibold text-gray-800 leading-none">
            Management
          </p>
          <p className="text-xs text-gray-500">System</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {userData && (
          <div className="relative group cursor-pointer">
            {/* ICON */}
            <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white">
              {userData?.name?.[0]?.toUpperCase()}
            </div>

            {/* DROPDOWN */}
            <div className="absolute hidden group-hover:block top-0 right-0 z-10 pt-10">
              <ul className="list-none m-0 p-2 bg-gray-100 text-sm rounded-lg shadow-lg min-w-[150px]">
                <li
                  onClick={() => navigate("/admin/profile")}
                  className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded"
                >
                  Profile
                </li>

                <li
                  onClick={logout}
                  className="py-2 px-3 hover:bg-gray-200 cursor-pointer text-red-500"
                >
                  Logout
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNavbar;
