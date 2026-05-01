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

// shared page
import AdminUsers from "../admin/AdminUsers";

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
          {/* /admin */}
          <Route path="/" element={getDashboard()} />

          {/* /admin/users */}
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

export default CesRouter;
