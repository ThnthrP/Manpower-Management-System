const CesAdminDashboard = () => {
  return (
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
};

export default CesAdminDashboard;