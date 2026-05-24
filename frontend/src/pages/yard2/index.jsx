import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AppContent } from "../../context/AppContext";
import Layout from "../../components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

import AdminDashboard from "./dashboard/AdminDashboard";
import PeDashboard from "./dashboard/PeDashboard";

// Phase 1 — Employee Data (YARD2)
import WorkerList     from "./employee/WorkerList";
import WorkerDetail   from "./employee/WorkerDetail";
import AddWorker      from "./employee/AddWorker";
import TrainingMatrix from "./training/TrainingMatrix";

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

          {/* Phase 1 — Employee Data */}
          <Route path="workers" element={<ProtectedRoute allowRoles={["admin","hr","manpower"]}><WorkerList /></ProtectedRoute>} />
          <Route path="workers/add" element={<ProtectedRoute allowRoles={["admin","hr"]}><AddWorker /></ProtectedRoute>} />
          <Route path="workers/:id" element={<ProtectedRoute allowRoles={["admin","hr","manpower","pe","pe_head"]}><WorkerDetail /></ProtectedRoute>} />
          <Route path="training-matrix" element={<ProtectedRoute allowRoles={["admin","hr","manpower","pe","pe_head"]}><TrainingMatrix /></ProtectedRoute>} />

          {getSharedModuleRoutes()}
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
};

export default Yard2Router;
