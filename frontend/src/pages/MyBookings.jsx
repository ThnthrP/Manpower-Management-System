import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [filter, setFilter] = useState("active");

  const [selectedBooking, setSelectedBooking] = useState(null);

  const filteredBookings = bookings.filter((b) => {
    if (filter === "active") {
      return b.status !== "cancelled";
    }
    if (filter === "cancelled") {
      return b.status === "cancelled";
    }
    return true; // all
  });

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/bookings/my", {
        withCredentials: true,
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await axios.put(
        backendUrl + `/api/bookings/cancel/${id}`,
        {},
        { withCredentials: true },
      );
      toast.success("ยกเลิกสำเร็จ");
      fetchBookings(); // refresh
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBookings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">📋 รายการจองของฉัน</h1>
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-1 rounded ${
              filter === "active" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Active
          </button>

          <button
            onClick={() => setFilter("cancelled")}
            className={`px-4 py-1 rounded ${
              filter === "cancelled" ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
          >
            Cancelled
          </button>

          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1 rounded ${
              filter === "all" ? "bg-gray-800 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
        </div>

        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBooking(b)}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition"
            >
              {/* รูป */}
              {b.type === "cargo" && b.image && (
                <img
                  src={`http://localhost:4000/${b.image}`}
                  className="w-20 h-20 object-cover rounded"
                />
              )}

              {/* ข้อมูล */}
              <div className="flex-1">
                <div className="flex-1">
                  {/* 🔥 บรรทัดที่ 1: TYPE */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-base">
                      {b.type === "person" ? "🚶‍♂️" : "📦"}
                    </span>
                    <span>{b.type === "person" ? "ส่งคน" : "ส่งของ"}</span>
                  </div>

                  {/* 🔥 บรรทัดที่ 2: MAIN INFO */}
                  <p className="font-semibold">
                    {b.vehicleType} | {b.origin} → {b.destination}
                  </p>
                </div>

                {/* <p className="text-sm text-gray-500">สถานะ: {b.status}</p> */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-700">สถานะ:</span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      b.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : b.status === "approved"
                          ? "bg-blue-100 text-blue-600"
                          : b.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : b.status === "cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {b.status === "pending"
                      ? "รอดำเนินการ"
                      : b.status === "approved"
                        ? "อนุมัติแล้ว"
                        : b.status === "completed"
                          ? "เสร็จสิ้น"
                          : b.status === "cancelled"
                            ? "ยกเลิก"
                            : b.status}
                  </span>
                </div>
              </div>

              {/* ปุ่ม */}
              {b.status !== "cancelled" && b.status !== "completed" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 สำคัญมาก
                    cancelBooking(b.id);
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-2 right-3 text-gray-500 text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">📄 รายละเอียดการจอง</h2>

            {/* 🔥 Type */}
            <p>
              ประเภท: {selectedBooking.type === "person" ? "ส่งคน" : "ส่งของ"}
            </p>

            {/* 🔥 Route */}
            <p>
              เส้นทาง: {selectedBooking.origin} → {selectedBooking.destination}
            </p>

            {/* 🔥 Vehicle */}
            <p>รถ: {selectedBooking.vehicleType}</p>

            {/* 🔥 Person */}
            {selectedBooking.type === "person" && (
              <>
                <p>ชื่อ: {selectedBooking.name}</p>
                <p>เบอร์: {selectedBooking.phone}</p>
                <p>แผนก: {selectedBooking.department}</p>
                <p>จำนวนคน: {selectedBooking.peopleCount}</p>
              </>
            )}

            {/* 🔥 Cargo */}
            {selectedBooking.type === "cargo" && (
              <>
                <p>จำนวน: {selectedBooking.quantity} ชิ้น</p>
                <p>ขนาด: {selectedBooking.size}</p>
                <p>น้ำหนัก: {selectedBooking.weight} กก.</p>

                {selectedBooking.image && (
                  <img
                    src={`http://localhost:4000/${selectedBooking.image}`}
                    className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                  />
                )}
              </>
            )}

            {/* 🔥 เวลา */}
            <p className="mt-2">วันที่: {selectedBooking.date?.slice(0, 10)}</p>
            <p>เวลา: {selectedBooking.time} น.</p>

            {/* 🔥 สถานะ */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-700">สถานะ:</span>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  selectedBooking.status === "pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : selectedBooking.status === "approved"
                      ? "bg-blue-100 text-blue-600"
                      : selectedBooking.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : selectedBooking.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                }`}
              >
                {selectedBooking.status === "pending"
                  ? "รอดำเนินการ"
                  : selectedBooking.status === "approved"
                    ? "อนุมัติแล้ว"
                    : selectedBooking.status === "completed"
                      ? "เสร็จสิ้น"
                      : selectedBooking.status === "cancelled"
                        ? "ยกเลิก"
                        : selectedBooking.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
