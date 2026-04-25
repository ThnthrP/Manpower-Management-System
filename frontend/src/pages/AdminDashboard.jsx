import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminLayout from "../components/admin/AdminLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [previewImage, setPreviewImage] = useState(null);

  //   const [currentPage, setCurrentPage] = useState(1);
  //   const [totalPages, setTotalPages] = useState(1);

  //   const [search, setSearch] = useState("");
  //   const [statusFilter, setStatusFilter] = useState("");

  const [chartData, setChartData] = useState([]);

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
  });

  const [pendingBookings, setPendingBookings] = useState([]);

  const fetchPending = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/bookings?page=1&limit=5&status=pending`,
      );

      if (data.success) {
        setPendingBookings(data.bookings);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const prepareChartData = (bookings) => {
    const map = {};

    bookings.forEach((b) => {
      const date = b.date?.split("T")[0];

      if (!map[date]) {
        map[date] = 0;
      }

      map[date]++;
    });

    // ✅ sort วันที่
    return Object.keys(map)
      .sort((a, b) => new Date(a) - new Date(b)) // 🔥 ตรงนี้สำคัญ
      .map((date) => ({
        date,
        count: map[date],
      }));
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/bookings?page=1&limit=5`,
      );

      if (data.success) {
        setBookings(data.bookings);
        setChartData(prepareChartData(data.bookings));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔥 update status
  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/bookings/status/${id}`,
        { status },
      );

      if (data.success) {
        toast.success("อัปเดตสถานะสำเร็จ");
        fetchBookings(); // refresh
        fetchPending();
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🎨 สี status
  const statusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "approved":
        return "bg-blue-100 text-blue-600";
      case "completed":
        return "bg-green-100 text-green-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const vehicleMap = {
    car: "🚗 รถเก๋ง",
    pickup: "🛻 กระบะ",
    truck6: "🚚 6 ล้อ",
    truck10: "🚛 10 ล้อ",
    van: "🚐 รถตู้",
  };

  const vehicleLabel = (type) => vehicleMap[type] || type;

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/bookings/stats`);

      console.log("STATS API:", data); // 🔥 debug

      if (data.success) {
        setStats(data.stats || {});
        setChartData(data.chartData || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Stats error:", error);
      toast.error("โหลด stats ไม่สำเร็จ");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchBookings();
      await fetchPending();
      await fetchStats();
    };

    loadData();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* <Navbar /> */}
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <p className="text-sm">Pending</p>
            <p className="text-xl font-bold">{stats.pending}</p>
          </div>

          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <p className="text-sm">Approved</p>
            <p className="text-xl font-bold">{stats.approved}</p>
          </div>

          <div className="bg-green-100 p-4 rounded-lg text-center">
            <p className="text-sm">Completed</p>
            <p className="text-xl font-bold">{stats.completed}</p>
          </div>

          <div className="bg-red-100 p-4 rounded-lg text-center">
            <p className="text-sm">Cancelled</p>
            <p className="text-xl font-bold">{stats.cancelled}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Bookings per Day</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Pending Requests
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {pendingBookings.length}
          </span>
        </h2>

        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          {pendingBookings.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-4">
              🎉 ไม่มีรายการที่รออนุมัติ
            </div>
          ) : (
            pendingBookings.map((b) => (
              <div
                key={b.id}
                className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                {/* LEFT */}
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{b.name}</span>

                  <span className="text-gray-500 text-xs">
                    {b.origin} → {b.destination}
                  </span>

                  <span className="text-gray-400 text-xs">
                    {b.date?.split("T")[0]} {b.time}
                  </span>
                </div>

                {/* RIGHT */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(b.id, "approved")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    ✔ อนุมัติ
                  </button>

                  <button
                    onClick={() => updateStatus(b.id, "cancelled")}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                  >
                    ✖ ยกเลิก
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <h2 className="text-lg font-semibold mb-2 mt-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">ผู้จอง</th>
                <th className="p-2">ประเภท</th>
                <th className="p-2">ประเภทรถ</th>
                <th className="p-2">ต้นทาง</th>
                <th className="p-2">ปลายทาง</th>
                <th className="p-2">วันที่</th>
                <th className="p-2">สถานะ</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t text-center">
                  <td className="p-2">{b.name || "-"}</td>
                  <td className="p-2">
                    {b.type === "person" ? (
                      "🚶‍♂️ คน"
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>📦 ของ</span>

                        {b.image && (
                          <button
                            onClick={() => setPreviewImage(b.image)}
                            className="text-blue-500 underline text-xs"
                          >
                            ดูรูป
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  {/* ✅ ประเภทรถ (เพิ่มตรงนี้) */}
                  <td className="p-2">{vehicleLabel(b.vehicle?.type)}</td>
                  <td className="p-2">{b.origin}</td>
                  <td className="p-2">{b.destination}</td>
                  <td className="p-2">
                    {b.date?.split("T")[0]} {b.time}
                  </td>

                  {/* 🔥 Status */}
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusColor(
                        b.status,
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>

                  {/* 🔥 Action */}
                  <td className="p-2 flex gap-2 justify-center flex-wrap">
                    {b.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(b.id, "approved")}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => updateStatus(b.id, "cancelled")}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {b.status === "approved" && (
                      <button
                        onClick={() => updateStatus(b.id, "completed")}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔥 MODAL ตรงนี้ */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="bg-white p-4 rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`${backendUrl}/${previewImage}`}
                alt="preview"
                className="max-w-md rounded"
              />

              <button
                onClick={() => setPreviewImage(null)}
                className="mt-3 bg-red-500 text-white px-4 py-1 rounded"
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
