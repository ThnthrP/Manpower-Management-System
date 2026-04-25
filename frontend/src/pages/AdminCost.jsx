import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/admin/AdminLayout";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AdminCost = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [costs, setCosts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [bookings, setBookings] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [form, setForm] = useState({
    vehicleId: "",
    type: "fuel",
    amount: "",
    note: "",
    date: "",
  });

  const filteredCosts = costs.filter((c) => {
    if (!c.date) return false; // 🔥 กันพัง

    const matchMonth = selectedMonth ? c.date.startsWith(selectedMonth) : true;

    const matchVehicle = selectedVehicle
      ? c.vehicle?.type === selectedVehicle
      : true;

    const matchType = selectedType ? c.type === selectedType : true;

    return matchMonth && matchVehicle && matchType;
  });

  const sortedCosts = [...filteredCosts].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  // const paginatedCosts = filteredCosts.slice((page - 1) * limit, page * limit);
  const paginatedCosts = sortedCosts.slice((page - 1) * limit, page * limit);

  const fetchBookings = async () => {
    // const { data } = await axios.get(`${backendUrl}/api/bookings`);
    try {
      const { data } = await axios.get(`${backendUrl}/api/bookings`);
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      toast.error(err.response?.data?.message || "โหลดข้อมูลล้มเหลว");
    }
  };

  // 🔥 fetch vehicles
  const fetchVehicles = async () => {
    const { data } = await axios.get(`${backendUrl}/api/vehicles`);
    if (data.success) setVehicles(data.vehicles);
  };

  // 🔥 fetch cost
  const fetchCosts = async () => {
    const { data } = await axios.get(`${backendUrl}/api/costs`);

    if (data.success) {
      setCosts(data.costs);
    }
  };

  const stats = {
    total: filteredCosts.reduce((s, c) => s + Number(c.amount), 0),

    fuel: filteredCosts
      .filter((c) => c.type === "fuel")
      .reduce((s, c) => s + Number(c.amount), 0),

    maintenance: filteredCosts
      .filter((c) => c.type === "maintenance")
      .reduce((s, c) => s + Number(c.amount), 0),
  };

  const getMonthlyData = () => {
    const map = {};

    filteredCosts.forEach((c) => {
      if (!c.date) return; // 🔥 กันพัง

      const date = new Date(c.date);

      if (isNaN(date)) return; // 🔥 กัน invalid date

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

      if (!map[key]) map[key] = 0;
      map[key] += Number(c.amount);
    });

    return Object.keys(map)
      .sort() // 🔥 สำคัญ (เรียงเดือน)
      .map((k) => ({
        month: k,
        total: map[k],
      }));
  };

  // const handleChange = (e) => {
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const addCost = async () => {
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      const { data } = await axios.post(`${backendUrl}/api/costs`, payload);

      if (data.success) {
        toast.success("เพิ่มค่าใช้จ่ายสำเร็จ");
        fetchCosts();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const getCostPerVehicle = () => {
    const map = {};

    filteredCosts.forEach((c) => {
      const key = c.vehicle?.type || "unknown";

      if (!map[key]) map[key] = 0;
      map[key] += c.amount;
    });

    return Object.keys(map)
      .map((k) => ({
        vehicle: labelMap[k] || k, // ✅ ใช้ตรงนี้
        total: map[k],
      }))
      .sort((a, b) => b.total - a.total);
  };

  const labelMap = {
    truck10: "🚛 10 ล้อ",
    truck6: "🚚 6 ล้อ",
    van: "🚐 รถตู้",
    car: "🚗 รถเก๋ง",
    pickup: "🛻 กระบะ",
  };

  const costPerVehicle = getCostPerVehicle();
  const topVehicles = costPerVehicle.slice(0, 3);

  const getCostPerBooking = () => {
    if (!bookings.length) return 0;

    const totalCost = filteredCosts.reduce(
      (sum, c) => sum + Number(c.amount),
      0,
    );

    const filteredBookings = selectedMonth
      ? bookings.filter((b) => b.date?.startsWith(selectedMonth))
      : bookings;

    if (!filteredBookings.length) return 0;

    return Math.round(totalCost / filteredBookings.length);
  };

  const exportExcel = () => {
    // ✅ ใช้ filteredCosts ตรง ๆ (ตัวเดียวกับ UI)
    const filtered = filteredCosts;

    // ✅ format data
    const data = [];
    // const data = filtered.map((c) => ({
    //   รถ: labelMap[c.vehicle?.type] || c.vehicle?.type,
    //   ประเภท: c.type === "fuel" ? "Fuel" : "Maintenance",
    //   จำนวนเงิน: `${c.amount.toLocaleString()} บาท`,
    //   วันที่: c.date?.split("T")[0],
    //   รายละเอียด: c.note || "",
    // }));

    // 🔥 ใส่ filter header
    data.push({
      รถ: "Filter",
      ประเภท: selectedType || "ทั้งหมด",
      จำนวนเงิน: selectedVehicle
        ? labelMap[selectedVehicle] || selectedVehicle
        : "รถทั้งหมด",
      วันที่: selectedMonth || "ทุกเดือน",
      รายละเอียด: "",
    });

    filtered.forEach((c) => {
      data.push({
        รถ: labelMap[c.vehicle?.type] || c.vehicle?.type,
        ประเภท: c.type === "fuel" ? "Fuel" : "Maintenance",
        จำนวนเงิน: `${c.amount.toLocaleString()} บาท`,
        วันที่: c.date?.split("T")[0],
        รายละเอียด: c.note || "",
      });
    });

    // 🔥 รวมยอดจาก filter จริง
    const total = filtered.reduce((sum, c) => sum + Number(c.amount), 0);

    data.push({
      รถ: "",
      ประเภท: "",
      จำนวนเงิน: `รวม: ${total.toLocaleString()} บาท`,
      วันที่: "",
      รายละเอียด: "",
    });

    const ws = XLSX.utils.json_to_sheet(data);

    ws["!cols"] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Costs");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    const today = new Date().toISOString().slice(0, 10);

    // 🔥 ใช้ filter จริงในการตั้งชื่อไฟล์
    const filename = selectedMonth
      ? `costs_${selectedMonth}_${today}.xlsx`
      : `costs_${today}.xlsx`;

    saveAs(file, filename);
  };

  useEffect(() => {
    fetchVehicles();
    fetchCosts();
    fetchBookings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedVehicle, selectedType]);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* TITLE */}
        {/* <h1 className="text-2xl font-bold mb-4">💰 Cost Management</h1> */}

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">💰 Cost Management</h1>
          <div className="flex gap-2">
            {/* 🚗 Vehicle */}
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="">รถทั้งหมด</option>
              {[...new Set(costs.map((c) => c.vehicle?.type))]
                .filter(Boolean)
                .map((v) => (
                  <option key={v} value={v}>
                    {labelMap[v] || v}
                  </option>
                ))}
            </select>

            {/* 🛠️ Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="">ทุกประเภท</option>
              <option value="fuel">⛽ Fuel</option>
              <option value="maintenance">🔧 Maintenance</option>
            </select>

            <button
              onClick={() => {
                setSelectedMonth("");
                setSelectedVehicle("");
                setSelectedType("");
              }}
              className="border px-3 py-2 rounded text-sm hover:bg-gray-100"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* 🔥 dropdown เดือน */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="">ทั้งหมด</option>
              {[
                ...new Set(
                  costs.map((c) => c.date?.slice(0, 7)).filter(Boolean),
                ),
              ]

                .sort()
                .map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>

            {/* export */}
            <button
              onClick={exportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              📄 Export Excel
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 p-4 rounded text-center">
            <p className="text-sm">Total</p>
            <p className="text-xl font-bold transition-all duration-300">
              {stats.total.toLocaleString()}
            </p>
          </div>

          <div className="bg-yellow-100 p-4 rounded text-center">
            <p className="text-sm">Fuel</p>
            <p className="text-xl font-bold transition-all duration-300">
              {stats.fuel.toLocaleString()}
            </p>
          </div>

          <div className="bg-blue-100 p-4 rounded text-center">
            <p className="text-sm">Maintenance</p>
            <p className="text-xl font-bold transition-all duration-300">
              {stats.maintenance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-purple-100 p-4 rounded text-center">
          <p className="text-sm">Cost / Booking</p>
          <p className="text-xl font-bold">
            {getCostPerBooking().toLocaleString()} บาท
          </p>
        </div>

        {/* 📊 Monthly Cost Chart */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">📊 ค่าใช้จ่ายรายเดือน</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#6366f1" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🚗 Cost per Vehicle */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">🚗 ค่าใช้จ่ายต่อรถ</h2>

          <div className="flex gap-3 mb-4">
            {topVehicles.map((v) => (
              <div
                key={v.vehicle}
                className="bg-gray-100 px-3 py-2 rounded text-sm"
              >
                {v.vehicle} → {v.total}
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={getCostPerVehicle()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* FORM */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">➕ Add Cost</h2>

          <div className="grid grid-cols-2 gap-3">
            <select
              name="vehicleId"
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="">เลือกรถ</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.type}
                </option>
              ))}
            </select>

            <select
              name="type"
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="fuel">⛽ Fuel</option>
              <option value="maintenance">🔧 Maintenance</option>
            </select>

            <input
              name="amount"
              placeholder="จำนวนเงิน"
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              type="date"
              name="date"
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="note"
              placeholder="รายละเอียด"
              onChange={handleChange}
              className="border p-2 rounded col-span-2"
            />
          </div>

          <button
            onClick={addCost}
            className="mt-3 bg-green-500 text-white px-4 py-2 rounded"
          >
            บันทึก
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold">📄 รายการค่าใช้จ่าย</h2>

            <span className="text-sm text-gray-500">
              ทั้งหมด {filteredCosts.length} รายการ
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2">รถ</th>
                <th>ประเภท</th>
                <th>จำนวนเงิน</th>
                <th>วันที่</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>

            <tbody>
              {filteredCosts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-gray-400 text-center">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                paginatedCosts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t text-center hover:bg-gray-50"
                  >
                    <td className="p-2">
                      {labelMap[c.vehicle?.type] || c.vehicle?.type}
                    </td>
                    <td>{c.type === "fuel" ? "⛽ Fuel" : "🔧 Maintenance"}</td>
                    <td>{c.amount.toLocaleString()} บาท</td>
                    <td>{c.date?.split("T")[0]}</td>
                    <td>{c.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex justify-center mt-4 gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>

            <span className="px-2">Page {page}</span>

            <button
              // disabled={page * limit >= filteredCosts.length}
              disabled={page * limit >= sortedCosts.length}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCost;
