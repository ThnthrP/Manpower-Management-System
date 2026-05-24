import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const REQ_TYPE_LABEL = {
  mandatory: { label: "M — Mandatory",    color: "bg-red-100 text-red-700" },
  relevant:  { label: "R — Relevant",     color: "bg-blue-100 text-blue-700" },
  required:  { label: "X — Required",     color: "bg-orange-100 text-orange-700" },
  assigned:  { label: "O — Assigned",     color: "bg-purple-100 text-purple-700" },
};

const CLIENT_BADGE = {
  CHEVRON: "bg-yellow-100 text-yellow-800",
  PTTEP:   "bg-blue-100 text-blue-800",
  ERAWAN:  "bg-green-100 text-green-800",
  PTT:     "bg-indigo-100 text-indigo-800",
  VALEURA: "bg-pink-100 text-pink-800",
};

const TrainingMatrix = () => {
  const { backendUrl } = useContext(AppContent);

  const [clients, setClients] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMatrix = async (clientCode = "") => {
    try {
      setLoading(true);
      const params = clientCode ? { clientCode } : {};
      const { data } = await axios.get(`${backendUrl}/api/employees/matrix`, {
        params,
        withCredentials: true,
      });
      if (data.success) {
        setClients(data.clients);
        setPositions(data.positions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix(selectedClient);
  }, [selectedClient]);

  const filtered = positions.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Training Matrix</h1>
        <p className="text-gray-500 text-sm mt-1">
          Required certifications per position — offshore eligibility per client
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Select Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[180px]"
          >
            <option value="">ทุก Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Search Position</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 e.g. Welder, Rigger, Scaffolder..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* SUMMARY */}
      {!loading && (
        <p className="text-xs text-gray-400 mb-4">
          แสดง {filtered.length} ตำแหน่ง
          {selectedClient && ` — ${clients.find((c) => c.code === selectedClient)?.name ?? selectedClient}`}
        </p>
      )}

      {/* CARDS */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-400">
          {positions.length === 0
            ? "ยังไม่มีข้อมูล Training Matrix — กรุณา import ข้อมูล Client Matrix ก่อน"
            : "ไม่พบตำแหน่งที่ค้นหา"}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((pos) => {
            // Deduplicate trainings by name
            const seen = new Set();
            const uniqueTrainings = pos.trainings.filter((t) => {
              if (seen.has(t.name)) return false;
              seen.add(t.name);
              return true;
            });

            // Collect unique clients for this position
            const clientCodes = [...new Set(pos.trainings.map((t) => t.clientCode))];

            return (
              <div
                key={pos.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* CARD HEADER */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{pos.name}</span>
                    {pos.category && (
                      <span className="text-xs text-gray-400">({pos.category})</span>
                    )}
                    {clientCodes.map((code) => (
                      <span
                        key={code}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${CLIENT_BADGE[code] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    {uniqueTrainings.length} required
                  </span>
                </div>

                {/* CARD BODY — 2-column list */}
                <div className="px-5 py-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    {uniqueTrainings.map((t, i) => {
                      const req = REQ_TYPE_LABEL[t.requirementType];
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2 py-1.5 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-gray-400 text-xs flex-shrink-0 w-5 text-right">
                            {i + 1}.
                          </span>
                          <span className="text-sm text-gray-700 flex-1">{t.name}</span>
                          {req && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${req.color}`}>
                              {t.requirementType.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEGEND */}
      {filtered.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-500">
          {Object.entries(REQ_TYPE_LABEL).map(([key, val]) => (
            <span key={key} className={`px-2 py-0.5 rounded font-medium ${val.color}`}>
              {val.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingMatrix;
