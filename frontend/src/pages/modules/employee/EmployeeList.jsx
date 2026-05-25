import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const STATUS_CFG = {
  active:   { dot: "bg-green-500",  badge: "bg-green-100 text-green-700",  label: "Active" },
  inactive: { dot: "bg-red-400",    badge: "bg-red-100 text-red-700",      label: "Inactive" },
  onleave:  { dot: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700",label: "On Leave" },
  pending:  { dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-500",    label: "Pending" },
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const EmployeeList = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState("");
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);

  const limit = 20;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = { page, limit, ...(search && { search }), ...(status && { status }) };
      const { data } = await axios.get(`${backendUrl}/api/employees`, { params, withCredentials: true });
      if (data.success) { setEmployees(data.employees); setTotal(data.total); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, [page, status]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchEmployees(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-gray-50 min-h-full">

      {/* HEADER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Workers</h1>
          <p className="text-sm text-gray-400 mt-0.5">รายชื่อพนักงานทั้งหมด — {total} คน</p>
        </div>
        <button
          onClick={() => navigate("/admin/workers/add")}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          <span className="text-base leading-none">+</span> Add Worker
        </button>
      </div>

      <div className="p-6">
        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="ค้นหาชื่อ / รหัสพนักงาน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">ทุกสถานะ</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="onleave">On Leave</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">รหัส</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">ตำแหน่ง</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">แผนก</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Offshore</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">กำลังโหลด...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">ไม่พบข้อมูลพนักงาน</td></tr>
              ) : (
                employees.map((emp) => {
                  const s = STATUS_CFG[emp.status] ?? STATUS_CFG.pending;
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => navigate(`/admin/workers/${emp.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{emp.empCode}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 select-none">
                            {initials(emp.fullName)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{emp.fullName}</p>
                            {emp.fullNameTH && <p className="text-xs text-gray-400">{emp.fullNameTH}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{emp.position?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">{emp.division ?? emp.department?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        {emp.isOffshore
                          ? <span className="text-xs text-blue-600 font-medium">⚓ Yes</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>แสดง {(page - 1) * limit + 1}–{Math.min(page * limit, total)} จาก {total} คน</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-40 hover:bg-gray-50">ก่อนหน้า</button>
              <span className="px-3 py-1 text-gray-600">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-40 hover:bg-gray-50">ถัดไป</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
