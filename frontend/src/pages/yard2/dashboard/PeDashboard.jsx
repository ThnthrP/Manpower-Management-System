const Yard2PeDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">PE Yard 2 Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded">My Requests</div>
        <div className="bg-green-500 text-white p-4 rounded">Pending Review</div>
        <div className="bg-yellow-500 text-white p-4 rounded">Active Assignments</div>
      </div>
    </div>
  );
};

export default Yard2PeDashboard;
