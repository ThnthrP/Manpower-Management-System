import { useContext } from "react";
import { AppContent } from "../../context/AppContext";

// แยก component
const CesDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Admin CES Dashboard</h1>

    <div className="grid grid-cols-4 gap-4">
      <div className="bg-blue-500 text-white p-4 rounded">Projects</div>
      <div className="bg-green-500 text-white p-4 rounded">Workers</div>
      <div className="bg-yellow-500 text-white p-4 rounded">Sites</div>
      <div className="bg-red-500 text-white p-4 rounded">Incidents</div>
    </div>
  </div>
);

const ExpertDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Admin EXPERT Dashboard</h1>

    <div className="grid grid-cols-4 gap-4">
      <div className="bg-purple-500 text-white p-4 rounded">Active Jobs</div>
      <div className="bg-indigo-500 text-white p-4 rounded">Engineers</div>
      <div className="bg-pink-500 text-white p-4 rounded">Maintenance</div>
      <div className="bg-gray-700 text-white p-4 rounded">Alerts</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { userData } = useContext(AppContent);

  // 🔥 ใช้ .name ตรงนี้เลย
  const company = userData?.company?.name;

  if (!userData) return <div>Loading...</div>;

  if (company === "CES") {
    return <CesDashboard />;
  }

  if (company === "EXPERT") {
    return <ExpertDashboard />;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-red-500">No dashboard available</h1>
      <p>Company: {company || "Unknown"}</p> {/* 🔥 ไม่ error แล้ว */}
    </div>
  );
};

export default AdminDashboard;
