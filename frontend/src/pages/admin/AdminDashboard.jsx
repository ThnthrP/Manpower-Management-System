const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded">
          Total Users
        </div>

        <div className="bg-green-500 text-white p-4 rounded">
          Projects
        </div>

        <div className="bg-purple-500 text-white p-4 rounded">
          Active Requests
        </div>

        <div className="bg-red-500 text-white p-4 rounded">
          Alerts
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;