import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const STATUS_BADGE = {
  active:   "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
  onleave:  "bg-yellow-100 text-yellow-700",
};

const EmployeeList = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 20;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = { page, limit, ...(search && { search }), ...(status && { status }) };
      const { data } = await axios.get(`${backendUrl}/api/employees`, {
        params,
        withCredentials: true,
      });
      if (data.success) {
        setEmployees(data.employees);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, status]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchEmployees();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Workers</h1>
          <p className="text-gray-500 text-sm mt-1">
            รายชื่อพนักงานทั้งหมดในบริษัท — {total} คน
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/workers/add")}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#16305A] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">+</span> Add Worker
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อ / รหัสพนักงาน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
        >
          <option value="">ทุกสถานะ</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="onleave">On Leave</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">รหัส</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อ-นามสกุล</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ตำแหน่ง</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">แผนก</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Offshore</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  กำลังโหลด...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  ไม่พบข้อมูลพนักงาน
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => navigate(`/admin/workers/${emp.id}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">{emp.empCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {emp.fullName}
                    {emp.fullNameTH && (
                      <p className="text-xs text-gray-400">{emp.fullNameTH}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{emp.position?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.division ?? emp.department?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {emp.isOffshore ? (
                      <span className="text-[#1E3A5F] font-semibold text-xs">⚓ Yes</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[emp.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            แสดง {(page - 1) * limit + 1}–{Math.min(page * limit, total)} จาก {total} คน
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ก่อนหน้า
            </button>
            <span className="px-3 py-1">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
