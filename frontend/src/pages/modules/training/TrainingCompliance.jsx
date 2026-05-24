import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const STATUS_CFG = {
  completed: { icon: "✓", label: "Completed", row: "bg-green-50",  badge: "bg-green-100 text-green-700",   text: "text-green-700" },
  due_soon:  { icon: "!",  label: "Due Soon",  row: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-700", text: "text-yellow-700" },
  overdue:   { icon: "✕", label: "Overdue",   row: "bg-red-50",    badge: "bg-red-100 text-red-700",       text: "text-red-700" },
  pending:   { icon: "·",  label: "Pending",   row: "",             badge: "bg-gray-100 text-gray-500",     text: "text-gray-400" },
  missing:   { icon: "✕", label: "ยังไม่มี",  row: "bg-red-50",    badge: "bg-red-100 text-red-600",       text: "text-red-600" },
};

const REQ_CFG = {
  mandatory: { letter: "M", color: "bg-red-100 text-red-700" },
  relevant:  { letter: "R", color: "bg-blue-100 text-blue-700" },
  required:  { letter: "X", color: "bg-orange-100 text-orange-700" },
  assigned:  { letter: "O", color: "bg-purple-100 text-purple-700" },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const TrainingCompliance = () => {
  const { backendUrl } = useContext(AppContent);

  const [employees, setEmployees]       = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [empSearch, setEmpSearch]       = useState("");
  const [compliance, setCompliance]     = useState(null);
  const [loading, setLoading]           = useState(false);

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/employees`,
        { params: { limit: 200, ...(empSearch && { search: empSearch }) }, withCredentials: true });
      if (data.success) setEmployees(data.employees);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchEmployees(), 400);
    return () => clearTimeout(t);
  }, [empSearch]);

  useEffect(() => {
    if (!selectedEmpId) { setCompliance(null); return; }
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/employees/${selectedEmpId}/compliance`, { withCredentials: true });
        if (data.success) setCompliance(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [selectedEmpId]);

  const emp          = compliance?.employee;
  const requirements = compliance?.requirements ?? [];
  const summary      = compliance?.summary ?? {};
  const pct          = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : null;

  return (
    <div className="bg-gray-50 min-h-full">

      {/* HEADER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">Training Compliance</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          ตรวจสอบว่าแต่ละคนผ่านหลักสูตรตาม Training Matrix ของตำแหน่งครบหรือยัง
        </p>
      </div>

      <div className="p-6">
        {/* EMPLOYEE SELECTOR */}
        <div className="bg-white border border-gray-200 p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">เลือกพนักงาน</p>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="ค้นหาชื่อ / รหัสพนักงาน..."
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-60 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm min-w-[280px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">— เลือกพนักงาน —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.empCode} — {e.fullName}{e.position?.name ? ` (${e.position.name})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading && <div className="text-center py-16 text-gray-400">กำลังโหลด...</div>}

        {/* RESULT */}
        {!loading && selectedEmpId && compliance && (
          <>
            {/* EMPLOYEE CARD */}
            <div className="bg-white border border-gray-200 px-5 py-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {initials(emp?.fullName ?? "")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{emp?.fullName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {emp?.empCode}
                      {emp?.position && <span className="ml-2 text-blue-600">{emp.position.name}</span>}
                    </p>
                  </div>
                </div>

                {/* SUMMARY SCORES */}
                {requirements.length > 0 && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{pct}%</p>
                      <p className="text-xs text-gray-400">ครบถ้วน</p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{summary.completed}</p>
                        <p className="text-xs text-gray-400">ผ่านแล้ว</p>
                      </div>
                      {summary.overdue > 0 && (
                        <div className="text-center">
                          <p className="font-semibold text-red-600">{summary.overdue}</p>
                          <p className="text-xs text-gray-400">Overdue</p>
                        </div>
                      )}
                      {summary.missing > 0 && (
                        <div className="text-center">
                          <p className="font-semibold text-red-500">{summary.missing}</p>
                          <p className="text-xs text-gray-400">ขาด</p>
                        </div>
                      )}
                      {summary.due_soon > 0 && (
                        <div className="text-center">
                          <p className="font-semibold text-yellow-600">{summary.due_soon}</p>
                          <p className="text-xs text-gray-400">Due Soon</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="font-semibold text-gray-600">{summary.total}</p>
                        <p className="text-xs text-gray-400">ทั้งหมด</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PROGRESS BAR */}
              {pct !== null && (
                <div className="mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* NO POSITION */}
            {!emp?.positionId && (
              <div className="bg-white border border-dashed border-gray-300 p-10 text-center text-gray-400 text-sm">
                พนักงานยังไม่ได้กำหนดตำแหน่ง — ไม่สามารถตรวจสอบ Training Matrix ได้
              </div>
            )}

            {/* NO REQUIREMENTS */}
            {emp?.positionId && requirements.length === 0 && (
              <div className="bg-white border border-dashed border-gray-300 p-10 text-center text-gray-400 text-sm">
                ตำแหน่ง <strong className="text-gray-600">{emp.position?.name}</strong> ยังไม่มีข้อมูลใน Training Matrix
              </div>
            )}

            {/* COMPLIANCE TABLE */}
            {requirements.length > 0 && (
              <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-8">#</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">หลักสูตร</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-16">ประเภท</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-20">Client</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-32">วันหมดอายุ</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-28">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requirements.map((r, idx) => {
                      const s   = STATUS_CFG[r.status] ?? STATUS_CFG.missing;
                      const req = REQ_CFG[r.requirementType];
                      const days = daysUntil(r.expiryDate);
                      return (
                        <tr key={r.trainingId} className={s.row}>
                          <td className="px-4 py-3 text-xs text-gray-300">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{r.trainingName}</td>
                          <td className="px-4 py-3">
                            {req && (
                              <span className={`text-xs w-5 h-5 inline-flex items-center justify-center rounded font-bold ${req.color}`}>
                                {req.letter}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{r.clientCode}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {fmt(r.expiryDate)}
                            {days !== null && days >= 0 && days <= 60 && (
                              <span className="ml-1 text-yellow-600 text-xs">({days}d)</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* EMPTY STATE */}
        {!selectedEmpId && !loading && (
          <div className="bg-white border border-dashed border-gray-300 p-16 text-center text-gray-400 text-sm">
            เลือกพนักงานด้านบนเพื่อดูสถานะ Training Compliance
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingCompliance;
