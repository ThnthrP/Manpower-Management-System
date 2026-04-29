import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import CompanySelect from "./pages/CompanySelect";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";

import { AppContent } from "./context/AppContext";

const App = () => {
  const { isLoggedin, loading, userData } = useContext(AppContent);

  useEffect(() => {
    console.log("userData:", userData);
    console.log("isLoggedin:", isLoggedin);
    console.log("role:", userData?.role);
    console.log("loading:", loading);
  }, [userData, isLoggedin, loading]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <ToastContainer />

      <Routes>
        {/* 🔹 Step 1: เลือกบริษัท */}
        {/* <Route path="/" element={<CompanySelect />} /> */}
        {/* <Route
          path="/"
          element={isLoggedin ? <Navigate to="/admin" /> : <CompanySelect />}
        /> */}
        {/* <Route
          path="/"
          element={
            isLoggedin ? (
              userData?.role === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/profile" />
              )
            ) : (
              <CompanySelect />
            )
          }
        /> */}
        
        <Route
          path="/"
          element={
            isLoggedin ? (
              !userData ? (
                <div>Loading...</div> // 🔥 รอ userData ก่อน
              ) : userData.role?.name === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/profile" />
              )
            ) : (
              <CompanySelect />
            )
          }
        />

        {/* Step 2: Login */}
        <Route
          path="/login"
          element={
            localStorage.getItem("company") ? <Login /> : <Navigate to="/" />
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Users */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Reset password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* กัน path มั่ว */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
