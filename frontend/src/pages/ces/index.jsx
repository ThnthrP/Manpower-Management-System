import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AppContent } from "../../context/AppContext";
import Layout from "../../components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

// dashboards
import AdminDashboard from "./dashboard/AdminDashboard";
import PeDashboard from "./dashboard/PeDashboard";
// import HrDashboard from "./dashboard/HrDashboard";
// import ManpowerDashboard from "./dashboard/ManpowerDashboard";
// import SafetyDashboard from "./dashboard/SafetyDashboard";
// import NurseDashboard from "./dashboard/NurseDashboard";
// import TaDashboard from "./dashboard/TaDashboard";

// Phase 1 — Employee Data (CES)
import WorkerList     from "./employee/WorkerList";
import WorkerDetail   from "./employee/WorkerDetail";
import AddWorker      from "./employee/AddWorker";
import TrainingMatrix from "./training/TrainingMatrix";

// shared page
import AdminUsers from "../admin/AdminUsers";
import { getSharedModuleRoutes } from "../../routes/shared/SharedModuleRoutes";

const CesRouter = () => {
  const { userData } = useContext(AppContent);

  if (!userData) return <div>Loading...</div>;

  const role = userData?.role?.name;

  // เลือก dashboard ตาม role
  const getDashboard = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard />;
      case "pe":
        return <PeDashboard />;
      //   case "hr":
      //     return <HrDashboard />;
      //   case "manpower":
      //     return <ManpowerDashboard />;
      //   case "safety":
      //     return <SafetyDashboard />;
      //   case "nurse":
      //     return <NurseDashboard />;
      //   case "ta":
      //     return <TaDashboard />;
      default:
        return <div>No dashboard for role: {role}</div>;
    }
  };

  return (
    // <ProtectedRoute>
    //   <Layout company="CES">
    //     {/* route ภายใน */}
    //     {window.location.pathname === "/admin/users" ? (
    //       <ProtectedRoute allowRoles={["admin"]}>
    //         <AdminUsers />
    //       </ProtectedRoute>
    //     ) : (
    //       getDashboard()
    //     )}
    //   </Layout>
    // </ProtectedRoute>
    <ProtectedRoute>
      <Layout company="CES">
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

export default CesRouter;
