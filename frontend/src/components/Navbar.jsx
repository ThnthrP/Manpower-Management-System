import React, { useContext } from "react";
// import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import logo from "../assets/experteam_logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContent);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(backendUrl + "/api/auth/logout");

      if (data.success) {
        setIsLoggedin(false);
        // setUserData(false);
        setUserData(null);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* LEFT: LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img src={logo} alt="logo" className="h-10" />

          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-800 leading-none">
              Manpower
            </p>
            <p className="text-sm font-semibold text-gray-800 leading-none">
              Management
            </p>
            <p className="text-xs text-gray-500">System</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">
          {/* My Bookings */}
          {userData && (
            <button
              onClick={() => navigate("/my-bookings")}
              // className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 cursor-pointer transition"
            >
              My Bookings
            </button>
          )}

          {/* USER / LOGIN */}
          {userData ? (
            <div className="relative group">
              {/* AVATAR */}
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold 
cursor-pointer hover:bg-blue-700 transition">
                {userData.name?.[0]?.toUpperCase()}
              </div>

              {/* DROPDOWN */}
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                <ul className="py-2 text-sm text-gray-700">
                  <li
                    onClick={() => navigate("/profile")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                  >
                    👤 โปรไฟล์ของฉัน
                  </li>

                  <li
                    onClick={logout}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition text-red-500"
                  >
                    ออกจากระบบ
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="w-full flex justify-between items-center px-4 sm:px-10 py-3 bg-white shadow sticky top-0 z-50">
  //     {/* LOGO + TEXT */}
  //     <div
  //       className="flex items-center gap-3 cursor-pointer"
  //       onClick={() => navigate("/")}
  //     >
  //       <img src={logo} alt="logo" className="h-12 sm:h-14 w-auto object-contain" />

  //       <div className="leading-tight">
  //         <p className="text-sm sm:text-base font-semibold text-gray-800 leading-none">
  //           Transportation
  //         </p>
  //         <p className="text-sm sm:text-base font-semibold text-gray-800 leading-none">
  //           Management
  //         </p>
  //         <p className="text-xs text-gray-500">System</p>
  //       </div>
  //     </div>

  //     {/* RIGHT SIDE */}
  //     <div className="flex items-center gap-4">
  //       {/* My Bookings */}
  //       {userData && (
  //         <button
  //           onClick={() => navigate("/my-bookings")}
  //           className="text-sm bg-white border px-4 py-1.5 rounded-full hover:bg-gray-100 transition"
  //         >
  //           My Bookings
  //         </button>
  //       )}

  //       {/* USER / LOGIN */}
  //       {userData ? (
  //         <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group cursor-pointer">
  //           {userData.name[0].toUpperCase()}

  //           {/* DROPDOWN */}
  //           <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10 transition-all duration-200">
  //             <ul className="list-none m-0 p-2 bg-gray-100 text-sm rounded-lg shadow-lg min-w-[150px]">
  //               {/* list-none m-0 p-2 bg-white text-sm rounded-lg shadow-lg min-w-[150px] border */}
  //               {/* {!userData.isAccountVerified && (
  //                 <li
  //                   onClick={sendVerificationOtp}
  //                   className="py-1 px-3 hover:bg-gray-200 cursor-pointer"
  //                 >
  //                   Verify email
  //                 </li>
  //               )} */}
  //               <li
  //                 onClick={() => navigate("/profile")}
  //                 className="py-2 px-3 hover:bg-gray-200 cursor-pointer whitespace-nowrap rounded"
  //               >
  //                 My Profile
  //               </li>

  //               <li
  //                 onClick={logout}
  //                 className="py-1 px-3 hover:bg-gray-200 cursor-pointer whitespace-nowrap"
  //               >
  //                 Logout
  //               </li>
  //             </ul>
  //           </div>
  //         </div>
  //       ) : (
  //         <button
  //           onClick={() => navigate("/")}
  //           className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer"
  //         >
  //           Login <img src={assets.arrow_icon} alt="" />
  //         </button>
  //       )}
  //     </div>
  //   </div>
  // );
};

export default Navbar;
