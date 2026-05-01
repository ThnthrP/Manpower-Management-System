import { Route, Navigate } from "react-router-dom";

import Login from "../../pages/shared/Login";
import Profile from "../../pages/shared/Profile";
import CompanySelect from "../../pages/shared/CompanySelect";
import ResetPassword from "../../pages/shared/ResetPassword";

import ProtectedRoute from "../../components/ProtectedRoute";

export const sharedRoutes = () => (
  <>
    <Route path="/company-select" element={<CompanySelect />} />

    <Route
      path="/login"
      element={
        localStorage.getItem("company") ? (
          <Login />
        ) : (
          <Navigate to="/company-select" />
        )
      }
    />

    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />

    <Route path="/reset-password" element={<ResetPassword />} />
  </>
);
