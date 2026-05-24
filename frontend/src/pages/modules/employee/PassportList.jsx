import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

const expiryConfig = (d) => {
  const days = daysUntil(d);
  if (days === null) return { badge: "bg-gray-100 text-gray-400", row: "",            label: "ไม่มีข้อมูล" };
  if (days < 0)      return { badge: "bg-red-100 text-red-700",   row: "bg-red-50",   label: "หมดอายุแล้ว" };
  if (days <= 90)    return { badge: "bg-yellow-100 text-yellow-700", row: "bg-yellow-50", label: "ใกล้หมดอายุ" };
  return               { badge: "bg-green-100 text-green-700",    row: "",            label: "ปกติ" };
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const PassportList = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  const [passports, setPassports] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [filter, setFilter]       = useState("all");

  const fetchPassports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/employees/passports`,
        { params: search ? { search } : {}, withCredentials: true });
      if (data.success) setPassports(data.passports);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPassports(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchPassports(), 400);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = passports.filter((p) => {
    const d = daysUntil(p.expiryDate);
    if (filter === "expired")  return d !== null && d < 0;
    if (filter === "expiring") return d !== null && d >= 0 && d <= 90;
    return true;
  });

  const expired  = passports.filter((p) => { const d = daysUntil(p.expiryDate); return d !== null && d < 0; }).length;
  const expiring = passports.filter((p) => { const d = daysUntil(p.expiryDate); return d !== null && d >= 0 && d <= 90; }).length;

  return (
    <div className="bg-gray-50 min-h-full">

      {/* HEADER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">Passports</h1>
        <p className="text-sm text-gray-400 mt-0.5">ข้อมูล Passport ของพนักงานทั้งหมด — {passports.length} คน</p>
      </div>

      <div className="p-6">
        {/* ALERT STRIP */}
        {(expired > 0 || expiring > 0) && (
          <div className="flex gap-3 mb-4">
            {expired > 0 && (
              <div className="bg-red-50 border border-red-200 rounded px-4 py-2.5 flex items-center gap-2">
                <span className="text-red-500 text-sm font-semibold">{expired}</span>
                <span className="text-red-700 text-sm">Passport หมดอายุแล้ว</span>
              </div>
            )}
            {expiring > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded px-4 py-2.5 flex items-center gap-2">
                <span className="text-yellow-600 text-sm font-semibold">{expiring}</span>
                <span className="text-yellow-800 text-sm">ใกล้หมดอายุ (&lt;90 วัน)</span>
              </div>
            )}
          </div>
        )}

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="ค้นหาชื่อ / รหัสพนักงาน / Passport No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-72 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="flex gap-1">
            {[
              { key: "all",      label: "ทั้งหมด" },
              { key: "expiring", label: "ใกล้หมด" },
              { key: "expired",  label: "หมดแล้ว" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-2 text-sm border rounded transition-colors ${
                  filter === key
                    ? "bg-slate-800 text-white border-slate-800"
                    : "border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-3">แสดง {filtered.length} รายการ</p>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">พนักงาน</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">ตำแหน่ง</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Passport No.</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">ออกที่</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">วันหมดอายุ</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-28">เหลือ</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-28">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">กำลังโหลด...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">ไม่พบข้อมูล Passport</td></tr>
              ) : (
                filtered.map((p) => {
                  const days = daysUntil(p.expiryDate);
                  const s = expiryConfig(p.expiryDate);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/admin/workers/${p.employee?.id}`)}
                      className={`cursor-pointer hover:brightness-95 transition-all ${s.row}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {initials(p.employee?.fullName ?? "")}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{p.employee?.fullName}</p>
                            {p.employee?.fullNameTH && <p className="text-xs text-gray-400">{p.employee.fullNameTH}</p>}
                            <p className="text-xs font-mono text-gray-400">{p.employee?.empCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{p.employee?.position?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800 tracking-widest">{p.passportNo}</td>
                      <td className="px-4 py-3 text-gray-500">{p.issuedCountry ?? "TH"}</td>
                      <td className="px-4 py-3 text-gray-500">{fmt(p.expiryDate)}</td>
                      <td className="px-4 py-3 text-sm">
                        {days !== null ? (
                          <span className={days < 0 ? "text-red-600 font-medium" : days <= 90 ? "text-yellow-600 font-medium" : "text-gray-400"}>
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
      </div>
    </div>
  );
};

export default PassportList;
