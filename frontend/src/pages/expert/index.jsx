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
// import ExpertDashboard from "./dashboard/ExpertDashboard";

// Phase 1 — Employee Data (EXPERTEAM)
import WorkerList          from "./employee/WorkerList";
import WorkerDetail        from "./employee/WorkerDetail";
import AddWorker           from "./employee/AddWorker";
import EditWorker          from "./employee/EditWorker";
import CertificationList   from "./employee/CertificationList";
import PassportList        from "./employee/PassportList";
import WorkerCV            from "./employee/WorkerCV";
import TrainingMatrix      from "./training/TrainingMatrix";
// shared page
import AdminUsers from "../admin/AdminUsers";
import { getSharedModuleRoutes } from "../../routes/shared/SharedModuleRoutes";

const ExpertRouter = () => {
  const { userData } = useContext(AppContent);

  if (!userData) return <div>Loading...</div>;

  const role = userData?.role?.name;

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
      //   case "expert":
      //     return <ExpertDashboard />;
      default:
        return <div>No dashboard</div>;
    }
  };

  return (
    // <ProtectedRoute>
    //   <Layout company="EXPERTEAM">
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
      <Layout company="EXPERTEAM">
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
          <Route path="workers/:id/edit" element={<ProtectedRoute allowRoles={["admin","hr"]}><EditWorker /></ProtectedRoute>} />
          <Route path="workers/:id/cv" element={<ProtectedRoute allowRoles={["admin","hr","manpower","pe","pe_head"]}><WorkerCV /></ProtectedRoute>} />
          <Route path="workers/:id" element={<ProtectedRoute allowRoles={["admin","hr","manpower","pe","pe_head"]}><WorkerDetail /></ProtectedRoute>} />
          <Route path="certifications" element={<ProtectedRoute allowRoles={["admin","hr","manpower"]}><CertificationList /></ProtectedRoute>} />
          <Route path="passports" element={<ProtectedRoute allowRoles={["admin","hr","manpower"]}><PassportList /></ProtectedRoute>} />
          <Route path="training-matrix" element={<ProtectedRoute allowRoles={["admin","hr","manpower","pe","pe_head"]}><TrainingMatrix /></ProtectedRoute>} />

          {getSharedModuleRoutes()}
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
};

export default ExpertRouter;
