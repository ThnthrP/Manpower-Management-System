import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AppContent } from "../../context/AppContext";
import Layout from "../../components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

import AdminDashboard from "./dashboard/AdminDashboard";
import PeDashboard from "./dashboard/PeDashboard";

import AdminUsers from "../admin/AdminUsers";
import { getSharedModuleRoutes } from "../../routes/shared/SharedModuleRoutes";

const Yard2Router = () => {
  const { userData } = useContext(AppContent);

  if (!userData) return <div>Loading...</div>;

  const role = userData?.role?.name;

  const getDashboard = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard />;
      case "pe":
        return <PeDashboard />;
      default:
        return <div>No dashboard for role: {role}</div>;
    }
  };

  return (
    <ProtectedRoute>
      <Layout company="YARD2">
        <Routes>
          <Route path="/" element={getDashboard()} />

          <Route
            path="users"
            element={
              <ProtectedRoute allowRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {getSharedModuleRoutes()}
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
};

export default Yard2Router;
