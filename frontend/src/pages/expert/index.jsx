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

// shared page
import AdminUsers from "../admin/AdminUsers";

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
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
};

export default ExpertRouter;
