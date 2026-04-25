import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminLayout from "../components/admin/AdminLayout";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewUser, setPreviewUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusQuery = filter === "all" ? "" : `&status=${filter}`;

        const { data } = await axios.get(
          `${backendUrl}/api/bookings?page=${currentPage}&limit=15&search=${search}${statusQuery}`,
        );

        if (data.success) {
          setBookings(data.bookings);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, [currentPage, search, filter, backendUrl]);

  // 🔥 update status
  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/bookings/status/${id}`,
        { status },
      );

      if (data.success) {
        toast.success("อัปเดตสำเร็จ");

        // 👇 ใช้แบบนี้แทน
        const updated = bookings.map((b) =>
          b.id === id ? { ...b, status } : b,
        );

        setBookings(updated);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🎨 status color
  const statusUI = (status) => {
    switch (status) {
      case "pending":
        return { text: "Pending", color: "bg-yellow-100 text-yellow-600" };
      case "approved":
        return { text: "Approved", color: "bg-blue-100 text-blue-600" };
      case "completed":
        return { text: "Completed", color: "bg-green-100 text-green-600" };
      case "cancelled":
        return { text: "Cancelled", color: "bg-red-100 text-red-600" };
      default:
        return { text: status, color: "bg-gray-100 text-gray-600" };
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

  return (
    <AdminLayout>
      <div className="p-6">
        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-4">📋 Manage Bookings</h1>

        {/* 🔥 FILTER + SEARCH */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search name / department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />

          {["all", "pending", "approved", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded capitalize ${
                filter === s ? "bg-slate-900 text-white" : "bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* 🔥 TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-center">
              <tr>
                <th className="p-3">ผู้จอง</th>
                <th>ประเภท</th>
                <th>ประเภทรถ</th> {/* ✅ เพิ่ม */}
                <th>เส้นทาง</th>
                <th>วันที่</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => {
                const ui = statusUI(b.status);

                return (
                  <tr
                    key={b.id}
                    className="border-t hover:bg-gray-50 cursor-pointer text-center"
                    onClick={() => setSelected(b)}
                  >
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <span>{b.name || "-"}</span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewUser(b);
                          }}
                          className="text-blue-500 underline text-xs hover:text-blue-700"
                        >
                          ดูโปรไฟล์
                        </button>
                      </div>
                    </td>

                    {/* ประเภท */}
                    <td>
                      {b.type === "person" ? (
                        "🚶‍♂️ คน"
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>📦 ของ</span>

                          {b.image && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // 🔥 กัน trigger row click
                                setPreviewImage(b.image);
                              }}
                              className="text-blue-500 underline text-xs hover:text-blue-700"
                            >
                              ดูรูป
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* ✅ ประเภทรถ */}
                    <td>{vehicleLabel(b.vehicle?.type || b.vehicleType)}</td>

                    {/* เส้นทาง */}
                    <td>
                      {b.origin} → {b.destination}
                    </td>

                    {/* วันที่ */}
                    <td>
                      {b.date?.split("T")[0]} {b.time}
                    </td>

                    {/* สถานะ */}
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${ui.color}`}
                      >
                        {ui.text}
                      </span>
                    </td>

                    {/* จัดการ */}
                    <td className="flex gap-2 justify-center p-2">
                      {b.status === "pending" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(b.id, "approved");
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                          >
                            อนุมัติ
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(b.id, "cancelled");
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          >
                            ยกเลิก
                          </button>
                        </>
                      )}

                      {b.status === "approved" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(b.id, "completed");
                          }}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                        >
                          เสร็จสิ้น
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-center mt-4 gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-black text-white" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        </div>

        {/* 🔥 MODAL */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-3">Booking Detail</h2>

              <p>👤 {selected.name}</p>
              <p>
                📍 {selected.origin} → {selected.destination}
              </p>
              <p>🚗 {selected.vehicleType}</p>
              <p>
                📅 {selected.date?.split("T")[0]} {selected.time}
              </p>
              <p>📌 {selected.purpose}</p>

              <button
                onClick={() => setSelected(null)}
                className="mt-4 bg-gray-200 px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
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
        {previewUser && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setPreviewUser(null)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">👤 User Profile</h2>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>ชื่อ:</strong> {previewUser.name || "-"}
                </p>
                <p>
                  <strong>อีเมล:</strong> {previewUser.email || "-"}
                </p>
                <p>
                  <strong>เบอร์โทร:</strong> {previewUser.phone || "-"}
                </p>
                <p>
                  <strong>แผนก:</strong> {previewUser.department || "-"}
                </p>
              </div>

              <button
                onClick={() => setPreviewUser(null)}
                className="mt-4 bg-gray-200 px-3 py-1 rounded"
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

export default AdminBookings;
