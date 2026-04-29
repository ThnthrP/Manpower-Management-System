import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedin, loading, userData } = useContext(AppContent);

  // 🔥 รอข้อมูลให้ครบก่อน
  if (loading || (isLoggedin && !userData)) {
    return <div>Loading...</div>;
  }

  if (!isLoggedin) {
    return <Navigate to="/" />;
  }

  // 🔥 FIX ตรงนี้
  if (adminOnly && userData?.role?.name !== "admin") {
    return <Navigate to="/profile" />;
  }

  return children;
};

export default ProtectedRoute;
