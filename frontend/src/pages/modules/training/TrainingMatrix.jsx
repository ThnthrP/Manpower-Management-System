import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const REQ_CFG = {
  mandatory: { letter: "M", label: "Mandatory", color: "bg-red-100 text-red-700" },
  relevant:  { letter: "R", label: "Relevant",  color: "bg-blue-100 text-blue-700" },
  required:  { letter: "X", label: "Required",  color: "bg-orange-100 text-orange-700" },
  assigned:  { letter: "O", label: "Assigned",  color: "bg-purple-100 text-purple-700" },
};

const CLIENT_BADGE = {
  CHEVRON: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PTTEP:   "bg-blue-100 text-blue-800 border-blue-200",
  ERAWAN:  "bg-green-100 text-green-800 border-green-200",
  PTT:     "bg-indigo-100 text-indigo-800 border-indigo-200",
  VALEURA: "bg-pink-100 text-pink-800 border-pink-200",
};

const TrainingMatrix = () => {
  const { backendUrl } = useContext(AppContent);

  const [clients, setClients]             = useState([]);
  const [positions, setPositions]         = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(false);

  const fetchMatrix = async (clientCode = "") => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/employees/matrix`,
        { params: clientCode ? { clientCode } : {}, withCredentials: true });
      if (data.success) { setClients(data.clients); setPositions(data.positions); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatrix(selectedClient); }, [selectedClient]);

  const filtered = positions.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-full">

      {/* HEADER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">Training Matrix</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          หลักสูตรที่ต้องการตามตำแหน่งงาน — eligibility per client
        </p>
      </div>

      <div className="p-6">
        {/* LEGEND */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-xs text-gray-400 self-center mr-1">Legend:</span>
          {Object.entries(REQ_CFG).map(([key, v]) => (
            <span key={key} className={`text-xs px-2.5 py-1 rounded font-medium border ${v.color} border-current border-opacity-30`}>
              {v.letter} — {v.label}
            </span>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[180px]"
          >
            <option value="">ทุก Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาตำแหน่ง เช่น Welder, Rigger..."
            className="border border-gray-300 rounded px-3 py-2 text-sm w-72 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {!loading && (
          <p className="text-xs text-gray-400 mb-4">
            {filtered.length} ตำแหน่ง
            {selectedClient && ` — ${clients.find((c) => c.code === selectedClient)?.name ?? selectedClient}`}
          </p>
        )}

        {/* POSITION CARDS */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-gray-300 bg-white p-12 text-center text-gray-400 text-sm">
            {positions.length === 0
              ? "ยังไม่มีข้อมูล Training Matrix"
              : "ไม่พบตำแหน่งที่ค้นหา"}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((pos) => {
              const seen = new Set();
              const uniqueTrainings = pos.trainings.filter((t) => {
                if (seen.has(t.name)) return false;
                seen.add(t.name);
                return true;
              });
              const clientCodes = [...new Set(pos.trainings.map((t) => t.clientCode))];

              return (
                <div key={pos.id} className="bg-white border border-gray-200 overflow-hidden">
                  {/* CARD HEADER */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{pos.name}</span>
                      {pos.category && (
                        <span className="text-xs text-gray-400 font-normal">({pos.category})</span>
                      )}
                      {clientCodes.map((code) => (
                        <span key={code}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${CLIENT_BADGE[code] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {code}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                      {uniqueTrainings.length} รายการ
                    </span>
                  </div>

                  {/* TRAINING LIST */}
                  <div className="px-5 py-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                      {uniqueTrainings.map((t, i) => {
                        const req = REQ_CFG[t.requirementType];
                        return (
                          <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                            <span className="text-gray-300 text-xs w-5 text-right flex-shrink-0">{i + 1}.</span>
                            <span className="text-sm text-gray-700 flex-1 leading-snug">{t.name}</span>
                            {req && (
                              <span className={`text-xs w-5 h-5 flex items-center justify-center rounded font-bold flex-shrink-0 ${req.color}`}>
                                {req.letter}
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
      </div>
    </div>
  );
};

export default TrainingMatrix;
