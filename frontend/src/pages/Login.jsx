import React, { useContext, useState } from "react";
// import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import logo from "../assets/experteam_logo.png";

const Login = () => {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [state, setState] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return toast.error("Invalid email format");
      }

      setLoading(true);
      axios.defaults.withCredentials = true;

      let data;

      if (state === "Sign Up") {
        const res = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });
        data = res.data;

        if (data.success) {
          const loginRes = await axios.post(backendUrl + "/api/auth/login", {
            email,
            password,
          });
          data = loginRes.data;
        }
      } else {
        const res = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });
        data = res.data;
      }

      if (data.success) {
        setIsLoggedin(true);

        const user = await getUserData();

        if (!user) {
          return toast.error("Cannot fetch user data");
        }

        const isAdmin = user.role === "admin";

        navigate(isAdmin ? "/admin" : "/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* CARD */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="logo" className="w-14 mb-2" />
          <h1 className="text-xl font-semibold text-gray-800">
            Transportation Management
          </h1>
          <p className="text-sm text-gray-500">System</p>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {state === "Sign Up" ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          {state === "Sign Up"
            ? "กรอกข้อมูลเพื่อสมัครใช้งาน"
            : "กรุณาเข้าสู่ระบบเพื่อใช้งาน"}
        </p>

        {/* FORM */}
        <form onSubmit={onSubmitHandler} className="space-y-4">
          {state === "Sign Up" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="ชื่อ-นามสกุล"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="อีเมล"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* FORGOT */}
          <div className="text-right">
            <span
              onClick={() => navigate("/reset-password")}
              className="text-sm text-blue-500 cursor-pointer hover:underline"
            >
              ลืมรหัสผ่าน?
            </span>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading && <span className="animate-spin">⏳</span>}
            {loading
              ? "กำลังดำเนินการ..."
              : state === "Sign Up"
                ? "สมัครสมาชิก"
                : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* SWITCH */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {state === "Sign Up" ? "มีบัญชีแล้ว?" : "ยังไม่มีบัญชี?"}{" "}
          <span
            onClick={() => {
              setState(state === "Sign Up" ? "Login" : "Sign Up");
              setName("");
              setEmail("");
              setPassword("");
            }}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            {state === "Sign Up" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;

// useEffect(() => {
//   if (isLoggedin) {
//     navigate("/dashboard");
//   }
// }, [isLoggedin]);

// useEffect(() => {
//   if (isLoggedin) {
//     if (userData?.role === "admin") {
//       navigate("/admin");
//     } else {
//       navigate("/dashboard");
//     }
//   }
// }, [isLoggedin, userData]);

// return (
//   <div className="relative min-h-screen flex items-center justify-center px-6 pt-16 bg-gradient-to-br from-blue-200 to-purple-400">
//     {/* LOGO (ไม่ดัน layout) */}
//     <div className="absolute top-5 left-5 sm:left-10 z-50 flex items-center gap-3">
//       <img src={logo} alt="logo" className="w-12 sm:w-14" />

//       <div className="leading-tight hidden sm:block">
//         <p className="text-base font-semibold text-gray-800 leading-none">
//           Transportation
//         </p>
//         <p className="text-base font-semibold text-gray-800 leading-none">
//           Management
//         </p>
//         <p className="text-xs text-gray-600 mt-0.5">System</p>
//       </div>
//     </div>
//     <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
//       <h2 className="text-3xl font-semibold text-white text-center mb-3">
//         {state === "Sign Up" ? "Create Account" : "Login"}
//       </h2>
//       <p className="text-center text-sm mb-6">
//         {state === "Sign Up"
//           ? "Create your account"
//           : "Login to your account!"}
//       </p>
//       <form onSubmit={onSubmitHandler}>
//         {state === "Sign Up" && (
//           <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
//             <img src={assets.person_icon} alt="" />
//             <input
//               onChange={(e) => setName(e.target.value)}
//               value={name}
//               className="bg-transparent outline-none"
//               type="text"
//               placeholder="Full Name"
//               required
//             />
//           </div>
//         )}
//         <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
//           <img src={assets.mail_icon} alt="" />
//           <input
//             onChange={(e) => setEmail(e.target.value)}
//             value={email}
//             className="bg-transparent outline-none"
//             type="email"
//             placeholder="Email id"
//             required
//           />
//         </div>
//         <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
//           <img src={assets.lock_icon} alt="" />
//           <input
//             onChange={(e) => setPassword(e.target.value)}
//             value={password}
//             className="bg-transparent outline-none"
//             type="password"
//             placeholder="Password"
//             required
//           />
//         </div>
//         <p
//           onClick={() => navigate("/reset-password")}
//           className="mb-4 text-indigo-500 cursor-pointer"
//         >
//           Forgot password?
//         </p>
//         {/* <button
//           disabled={loading}
//           className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer disabled:opacity-50"
//         >
//           {loading ? "Loading..." : state}
//         </button> */}
//         <button
//           disabled={loading}
//           className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium disabled:opacity-50 flex justify-center items-center gap-2"
//         >
//           {loading && <span className="animate-spin">⏳</span>}
//           {loading ? "Loading..." : state}
//         </button>
//       </form>
//       {state === "Sign Up" ? (
//         <p className="text-gray-400 text-center text-xs mt-4">
//           Already have an account?{" "}
//           <span
//             onClick={() => {
//               setState("Login");
//               setName("");
//               setEmail("");
//               setPassword("");
//             }}
//             className="text-blue-400 cursor-pointer underline"
//           >
//             Login here
//           </span>
//         </p>
//       ) : (
//         <p className="text-gray-400 text-center text-xs mt-4">
//           Don't have an account?{" "}
//           <span
//             onClick={() => {
//               setState("Sign Up");
//               setName("");
//               setEmail("");
//               setPassword("");
//             }}
//             className="text-blue-400 cursor-pointer underline"
//           >
//             Sign up
//           </span>
//         </p>
//       )}
//     </div>
//   </div>
// );
