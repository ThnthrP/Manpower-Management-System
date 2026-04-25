import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedin, loading, userData } = useContext(AppContent);

  // รอโหลด user ก่อน
  if (loading) return <div>Loading...</div>;

  // ยังไม่ login
  if (!isLoggedin) {
    return <Navigate to="/" />;
  }

  // กัน user เข้า admin
  if (adminOnly && userData?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  // ผ่านหมด
  return children;
};

export default ProtectedRoute;
