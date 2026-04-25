import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppContent } from "./context/AppContext";
import AdminRoute from "./components/AdminRoute";
import AdminBookings from "./pages/AdminBookings";
import AdminProfile from "./pages/AdminProfile";
import AdminCost from "./pages/AdminCost";

const App = () => {
  const { isLoggedin } = useContext(AppContent);

  return (
    <div>
      <ToastContainer />

      <Routes>
        <Route path="/login" element={<Login />} />
        {/* หน้าแรก */}
        <Route
          path="/"
          element={isLoggedin ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Reset password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Booking */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        {/* My Bookings */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
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

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminProfile />
            </AdminRoute>
          }
        />

        {/* ✅ เพิ่มตรงนี้ */}
        <Route
          path="/admin/cost"
          element={
            <AdminRoute>
              <AdminCost />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
