import React from "react";

const PeDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">PE Dashboard (CES)</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded">
          Active Projects
        </div>

        <div className="bg-green-500 text-white p-4 rounded">
          Assigned Workers
        </div>

        <div className="bg-yellow-500 text-white p-4 rounded">
          Site Progress
        </div>

        <div className="bg-red-500 text-white p-4 rounded">Safety Issues</div>
      </div>

      {/* 🔧 future section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Recent Activities</h2>
        <div className="bg-white shadow p-4 rounded text-sm text-gray-600">
          No recent activity
        </div>
      </div>
    </div>
  );
};

export default PeDashboard;
