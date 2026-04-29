import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedin, loading, userData } = useContext(AppContent);

  if (loading) return <div>Loading...</div>;

  if (!isLoggedin) {
    return <Navigate to="/" />;
  }

  // ✅ ใช้ string ตรง ๆ
  if (adminOnly && userData?.role !== "admin") {
    return <Navigate to="/profile" />; // 🔥 เปลี่ยนตรงนี้
  }

  return children;
};

export default ProtectedRoute;