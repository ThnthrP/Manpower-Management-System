import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const STATUS_CFG = {
  completed: { badge: "bg-green-100 text-green-700",  row: "",              label: "Completed" },
  due_soon:  { badge: "bg-yellow-100 text-yellow-700",row: "bg-yellow-50",  label: "Due Soon" },
  overdue:   { badge: "bg-red-100 text-red-700",      row: "bg-red-50",     label: "Overdue" },
  pending:   { badge: "bg-gray-100 text-gray-500",    row: "",              label: "Pending" },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const CertificationList = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  const [certs, setCerts]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 30;

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const params = { page, limit, ...(search && { search }), ...(status && { status }) };
      const { data } = await axios.get(`${backendUrl}/api/employees/certifications`, { params, withCredentials: true });
      if (data.success) { setCerts(data.certifications); setTotal(data.total); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCerts(); }, [page, status]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchCerts(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(total / limit);

  const overdue  = certs.filter((c) => c.status === "overdue").length;
  const dueSoon  = certs.filter((c) => c.status === "due_soon").length;

  return (
    <div className="bg-gray-50 min-h-full">

      {/* HEADER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">Certifications</h1>
        <p className="text-sm text-gray-400 mt-0.5">ใบรับรองและหลักสูตรฝึกอบรมของพนักงาน — {total} รายการ</p>
      </div>

      <div className="p-6">
        {/* ALERT STRIP */}
        {(overdue > 0 || dueSoon > 0) && (
          <div className="flex gap-3 mb-4">
            {overdue > 0 && (
              <div className="bg-red-50 border border-red-200 rounded px-4 py-2.5 flex items-center gap-2">
                <span className="text-red-500 text-sm font-semibold">{overdue}</span>
                <span className="text-red-700 text-sm">หมดอายุแล้ว</span>
              </div>
            )}
            {dueSoon > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded px-4 py-2.5 flex items-center gap-2">
                <span className="text-yellow-600 text-sm font-semibold">{dueSoon}</span>
                <span className="text-yellow-800 text-sm">ใกล้หมดอายุ</span>
              </div>
            )}
          </div>
        )}

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="ค้นหาชื่อพนักงาน / หลักสูตร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-72 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">ทุกสถานะ</option>
            <option value="overdue">Overdue</option>
            <option value="due_soon">Due Soon</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">พนักงาน</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">ตำแหน่ง</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">หลักสูตร / ใบรับรอง</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">วันหมดอายุ</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-28">เหลือ</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-28">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400">กำลังโหลด...</td></tr>
              ) : certs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400">ไม่พบข้อมูลใบรับรอง</td></tr>
              ) : (
                certs.map((c) => {
                  const days = daysUntil(c.expiryDate);
                  const s = STATUS_CFG[c.status] ?? STATUS_CFG.pending;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/admin/workers/${c.employee?.id}`)}
                      className={`cursor-pointer hover:brightness-95 transition-all ${s.row}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {initials(c.employee?.fullName ?? "")}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{c.employee?.fullName}</p>
                            <p className="text-xs text-gray-400 font-mono">{c.employee?.empCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{c.employee?.position?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-800">{c.globalTraining?.name ?? c.rawTrainingName}</td>
                      <td className="px-4 py-3 text-gray-500">{fmt(c.expiryDate)}</td>
                      <td className="px-4 py-3 text-sm">
                        {days !== null ? (
                          <span className={days < 0 ? "text-red-600 font-medium" : days <= 60 ? "text-yellow-600 font-medium" : "text-gray-400"}>
                            {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>{s.label}</span>
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
            <span>แสดง {(page - 1) * limit + 1}–{Math.min(page * limit, total)} จาก {total} รายการ</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-40 hover:bg-gray-50">ก่อนหน้า</button>
              <span className="px-3 py-1">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-40 hover:bg-gray-50">ถัดไป</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationList;
