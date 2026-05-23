import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../../context/AppContext";

// ─── colour tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#f9fafb",
  white: "#ffffff",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  text: "#111827",
  textSub: "#6b7280",
  textMuted: "#9ca3af",
  blue: "#3b82f6",
  blueBg: "#eff6ff",
  blueBorder: "#bfdbfe",
  green: "#16a34a",
  greenBg: "#f0fdf4",
  greenBorder: "#bbf7d0",
  amber: "#d97706",
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",
  red: "#dc2626",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
};

// ─── Client config ─────────────────────────────────────────────────────────
const CLIENTS = [
  {
    id: "chevron",
    name: "Chevron",
    short: "CHV",
    color: "#0062a3",
    bg: "#e6f2ff",
    version: "Rev07",
    border: "#93c5fd",
  },
  {
    id: "erawan",
    name: "Erawan (PTTEP)",
    short: "ER",
    color: "#15803d",
    bg: "#f0fdf4",
    version: "V15",
    border: "#86efac",
  },
  {
    id: "ptt",
    name: "PTT",
    short: "PTT",
    color: "#b45309",
    bg: "#fffbeb",
    version: "Rev02",
    border: "#fcd34d",
  },
  {
    id: "valeura",
    name: "Valeura",
    short: "VAL",
    color: "#7c3aed",
    bg: "#f5f3ff",
    version: "Rev01",
    border: "#c4b5fd",
  },
];

// ─── Requirement types ─────────────────────────────────────────────────────
// Erawan ใช้ M/R, Chevron/Valeura ใช้ X, PTT = company-wide ไม่ระบุ type
const REQ_TYPES = {
  mandatory: {
    label: "M",
    title: "Mandatory — บังคับทุกคน",
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fecaca",
  },
  relevant: {
    label: "R",
    title: "Relevant — เฉพาะผู้เกี่ยวข้อง",
    bg: "#fffbeb",
    color: "#d97706",
    border: "#fde68a",
  },
  required: {
    label: "X",
    title: "Required — Chevron/Valeura",
    bg: "#eff6ff",
    color: "#3b82f6",
    border: "#bfdbfe",
  },
  optional: {
    label: "O",
    title: "Optional",
    bg: "#f3f4f6",
    color: "#6b7280",
    border: "#e5e7eb",
  },
};

// ─── Training categories ───────────────────────────────────────────────────
const CAT = {
  safety: {
    label: "Safety",
    bg: "#fef3c7",
    color: "#92400e",
    border: "#fde68a",
  },
  technical: {
    label: "Technical",
    bg: "#dbeafe",
    color: "#1e40af",
    border: "#bfdbfe",
  },
  offshore: {
    label: "Offshore",
    bg: "#e0f2fe",
    color: "#075985",
    border: "#bae6fd",
  },
  medical: {
    label: "Medical",
    bg: "#fce7f3",
    color: "#9d174d",
    border: "#fbcfe8",
  },
  legal: { label: "Legal", bg: "#ede9fe", color: "#4c1d95", border: "#ddd6fe" },
  client_specific: {
    label: "Client",
    bg: "#ecfdf5",
    color: "#064e3b",
    border: "#a7f3d0",
  },
  administrative: {
    label: "Admin",
    bg: "#f3f4f6",
    color: "#374151",
    border: "#d1d5db",
  },
  other: { label: "Other", bg: "#fafafa", color: "#6b7280", border: "#e5e7eb" },
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
// TODO: เปลี่ยนเป็น API จริง — GET /api/position, /api/training/global, /api/training/matrix?clientId=

// Positions แยกตาม client (จาก Excel จริง)
const MOCK_POSITIONS = {
  chevron: [
    {
      id: "cp1",
      name: "Rigger / Scaffolder",
      category: "Technical",
      isOffshore: true,
    },
    {
      id: "cp2",
      name: "Crane Operator A",
      category: "Technical",
      isOffshore: true,
    },
    {
      id: "cp3",
      name: "Construction Supervisor",
      category: "Supervisory",
      isOffshore: true,
    },
    {
      id: "cp4",
      name: "Safety Officer",
      category: "Supervisory",
      isOffshore: true,
    },
  ],
  erawan: [
    { id: "ep1", name: "Rigger", category: "Technical", isOffshore: true },
    { id: "ep2", name: "Scaffolder", category: "Technical", isOffshore: true },
    {
      id: "ep3",
      name: "Crane Operator",
      category: "Technical",
      isOffshore: true,
    },
    {
      id: "ep4",
      name: "Construction Supervisor",
      category: "Supervisory",
      isOffshore: true,
    },
    {
      id: "ep5",
      name: "Safety Officer",
      category: "Supervisory",
      isOffshore: true,
    },
  ],
  ptt: [
    {
      id: "pp1",
      name: "All Positions (Company-wide)",
      category: "General",
      isOffshore: true,
    },
  ],
  valeura: [
    {
      id: "vp1",
      name: "Scaffold & Paint",
      category: "Technical",
      isOffshore: true,
    },
    { id: "vp2", name: "Mechanical", category: "Technical", isOffshore: true },
    { id: "vp3", name: "Safety", category: "Supervisory", isOffshore: true },
  ],
};

const MOCK_TRAININGS = [
  { id: "t1", name: "Basic Rigging", category: "technical", validityYears: 2 },
  {
    id: "t2",
    name: "Advanced Rigging",
    category: "technical",
    validityYears: 2,
  },
  {
    id: "t3",
    name: "Basic Scaffolding",
    category: "technical",
    validityYears: 2,
  },
  { id: "t4", name: "Safety Induction", category: "safety", validityYears: 1 },
  { id: "t5", name: "H2S Awareness", category: "safety", validityYears: 1 },
  {
    id: "t6",
    name: "PTW (Permit to Work)",
    category: "safety",
    validityYears: 1,
  },
  { id: "t7", name: "BOSIET", category: "offshore", validityYears: 4 },
  { id: "t8", name: "HUET", category: "offshore", validityYears: 4 },
  { id: "t9", name: "Medical Fit", category: "medical", validityYears: 1 },
  {
    id: "t10",
    name: "Chevron SSHE",
    category: "client_specific",
    validityYears: 1,
  },
  {
    id: "t11",
    name: "PTTEP Site Induction",
    category: "client_specific",
    validityYears: 1,
  },
  { id: "t12", name: "First Aid", category: "medical", validityYears: 2 },
  {
    id: "t13",
    name: "Working at Height",
    category: "safety",
    validityYears: 2,
  },
  {
    id: "t14",
    name: "Confined Space Entry",
    category: "safety",
    validityYears: 1,
  },
  {
    id: "t15",
    name: "PTT Safety Passport",
    category: "client_specific",
    validityYears: 1,
  },
];

// Matrix แยก clientId → positionId → [{trainingId, requirementType}]
// Chevron ใช้ X, Erawan ใช้ M/R, PTT company-wide mandatory, Valeura ใช้ X
const MOCK_MATRIX = {
  chevron: {
    cp1: [
      { trainingId: "t1", requirementType: "required" },
      { trainingId: "t4", requirementType: "required" },
      { trainingId: "t5", requirementType: "required" },
      { trainingId: "t7", requirementType: "required" },
      { trainingId: "t8", requirementType: "required" },
      { trainingId: "t9", requirementType: "required" },
      { trainingId: "t10", requirementType: "required" },
    ],
    cp2: [
      { trainingId: "t1", requirementType: "required" },
      { trainingId: "t4", requirementType: "required" },
      { trainingId: "t5", requirementType: "required" },
      { trainingId: "t6", requirementType: "required" },
      { trainingId: "t7", requirementType: "required" },
      { trainingId: "t8", requirementType: "required" },
      { trainingId: "t9", requirementType: "required" },
      { trainingId: "t10", requirementType: "required" },
    ],
    cp3: [
      { trainingId: "t4", requirementType: "required" },
      { trainingId: "t5", requirementType: "required" },
      { trainingId: "t6", requirementType: "required" },
      { trainingId: "t9", requirementType: "required" },
      { trainingId: "t10", requirementType: "required" },
    ],
    cp4: [
      { trainingId: "t4", requirementType: "required" },
      { trainingId: "t5", requirementType: "required" },
      { trainingId: "t6", requirementType: "required" },
      { trainingId: "t7", requirementType: "required" },
      { trainingId: "t9", requirementType: "required" },
      { trainingId: "t10", requirementType: "required" },
      { trainingId: "t12", requirementType: "required" },
    ],
  },
  erawan: {
    ep1: [
      { trainingId: "t1", requirementType: "mandatory" },
      { trainingId: "t4", requirementType: "mandatory" },
      { trainingId: "t5", requirementType: "mandatory" },
      { trainingId: "t7", requirementType: "mandatory" },
      { trainingId: "t9", requirementType: "mandatory" },
      { trainingId: "t11", requirementType: "mandatory" },
      { trainingId: "t13", requirementType: "relevant" },
    ],
    ep2: [
      { trainingId: "t3", requirementType: "mandatory" },
      { trainingId: "t4", requirementType: "mandatory" },
      { trainingId: "t5", requirementType: "mandatory" },
      { trainingId: "t7", requirementType: "mandatory" },
      { trainingId: "t9", requirementType: "mandatory" },
      { trainingId: "t11", requirementType: "mandatory" },
    ],
    ep3: [
      { trainingId: "t1", requirementType: "mandatory" },
      { trainingId: "t4", requirementType: "mandatory" },
      { trainingId: "t5", requirementType: "mandatory" },
      { trainingId: "t6", requirementType: "mandatory" },
      { trainingId: "t7", requirementType: "mandatory" },
      { trainingId: "t9", requirementType: "mandatory" },
      { trainingId: "t11", requirementType: "mandatory" },
    ],
    ep4: [
      { trainingId: "t4", requirementType: "mandatory" },
      { trainingId: "t5", requirementType: "mandatory" },
      { trainingId: "t6", requirementType: "mandatory" },
      { trainingId: "t9", requirementType: "mandatory" },
      { trainingId: "t11", requirementType: "mandatory" },
      { trainingId: "t12", requirementType: "relevant" },
    ],
    ep5: [
      { trainingId: "t4", requirementType: "mandatory" },
      { trainingId: "t5", requirementType: "mandatory" },
      { trainingId: "t6", requirementType: "mandatory" },
      { trainingId: "t9", requirementType: "mandatory" },
      { trainingId: "t11", requirementType: "mandatory" },
      { trainingId: "t12", requirementType: "mandatory" },
      { trainingId: "t14", requirementType: "relevant" },
    ],
  },
  ptt: {
    pp1: [
      { trainingId: "t4", requirementType: "mandatory" },
      { trainingId: "t5", requirementType: "mandatory" },
      { trainingId: "t6", requirementType: "mandatory" },
      { trainingId: "t7", requirementType: "mandatory" },
      { trainingId: "t9", requirementType: "mandatory" },
      { trainingId: "t12", requirementType: "mandatory" },
      { trainingId: "t15", requirementType: "mandatory" },
    ],
  },
  valeura: {
    vp1: [
      { trainingId: "t3", requirementType: "required" },
      { trainingId: "t4", requirementType: "required" },
      { trainingId: "t5", requirementType: "required" },
      { trainingId: "t7", requirementType: "required" },
      { trainingId: "t9", requirementType: "required" },
    ],
    vp2: [
      { trainingId: "t4", requirementType: "required" },
      { trainingId: "t5", requirementType: "required" },
      { trainingId: "t7", requirementType: "required" },
      { trainingId: "t9", requirementType: "required" },
      { trainingId: "t13", requirementType: "required" },
    ],
    vp3: [
      { trainingId: "t4", requirementType: "required" },
      { trainingId: "t5", requirementType: "required" },
      { trainingId: "t6", requirementType: "required" },
      { trainingId: "t7", requirementType: "required" },
      { trainingId: "t9", requirementType: "required" },
      { trainingId: "t12", requirementType: "required" },
      { trainingId: "t14", requirementType: "required" },
    ],
  },
};

// ─── sub-components ────────────────────────────────────────────────────────
const ReqBadge = ({ type = "mandatory" }) => {
  const r = REQ_TYPES[type] || REQ_TYPES.mandatory;
  return (
    <span
      title={r.title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: 6,
        background: r.bg,
        color: r.color,
        border: `1px solid ${r.border}`,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {r.label}
    </span>
  );
};

const CatBadge = ({ cat }) => {
  const c = CAT[cat] || CAT.other;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 20,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {c.label}
    </span>
  );
};

// ─── MAIN ──────────────────────────────────────────────────────────────────
const TrainingMatrixExpert = () => {
  const { backendUrl } = useContext(AppContent);

  const [activeClient, setActiveClient] = useState("chevron");
  const [positions, setPositions] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [matrix, setMatrix] = useState({}); // clientId → posId → [{trainingId, requirementType}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedPos, setSelectedPos] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // TODO: เปลี่ยนเป็น API จริง
        // const [posRes, trainRes, matrixRes] = await Promise.all([
        //   axios.get(backendUrl + `/api/position?clientId=${activeClient}`),
        //   axios.get(backendUrl + "/api/training/global"),
        //   axios.get(backendUrl + `/api/training/matrix?clientId=${activeClient}`),
        // ]);
        await new Promise((r) => setTimeout(r, 300));
        setTrainings(MOCK_TRAININGS);
        setMatrix(MOCK_MATRIX);
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [backendUrl]);

  // เปลี่ยน client → reset selected position
  useEffect(() => {
    const pos = MOCK_POSITIONS[activeClient] || [];
    setPositions(pos);
    setSelectedPos(pos[0] || null);
    setSearchQ("");
    setFilterCat("all");
  }, [activeClient]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getReqs = (posId) => matrix[activeClient]?.[posId] || [];

  const isChecked = (posId, tid) =>
    getReqs(posId).some((r) => r.trainingId === tid);

  const getReqType = (posId, tid) =>
    getReqs(posId).find((r) => r.trainingId === tid)?.requirementType ||
    "mandatory";

  const toggleTraining = (tid) => {
    if (!selectedPos) return;
    const posId = selectedPos.id;
    const current = getReqs(posId);
    const exists = current.find((r) => r.trainingId === tid);
    setMatrix((prev) => ({
      ...prev,
      [activeClient]: {
        ...(prev[activeClient] || {}),
        [posId]: exists
          ? current.filter((r) => r.trainingId !== tid)
          : [...current, { trainingId: tid, requirementType: "mandatory" }],
      },
    }));
  };

  const setReqType = (tid, type) => {
    if (!selectedPos) return;
    const posId = selectedPos.id;
    setMatrix((prev) => ({
      ...prev,
      [activeClient]: {
        ...(prev[activeClient] || {}),
        [posId]: (prev[activeClient]?.[posId] || []).map((r) =>
          r.trainingId === tid ? { ...r, requirementType: type } : r,
        ),
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedPos) return;
    setSaving(true);
    try {
      // TODO: เปลี่ยนเป็น API จริง
      // await axios.put(backendUrl + "/api/training/matrix", {
      //   clientId: activeClient,
      //   positionId: selectedPos.id,
      //   requirements: getReqs(selectedPos.id),
      // });
      await new Promise((r) => setTimeout(r, 600));
      toast.success(
        `บันทึก Matrix: ${selectedPos.name} (${CLIENTS.find((c) => c.id === activeClient)?.name}) เรียบร้อย`,
      );
    } catch {
      toast.error("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────
  const filtered = trainings.filter((t) => {
    const catOk = filterCat === "all" || t.category === filterCat;
    const qOk = t.name.toLowerCase().includes(searchQ.toLowerCase());
    return catOk && qOk;
  });

  const selectedReqs = selectedPos ? getReqs(selectedPos.id) : [];
  const clientCfg = CLIENTS.find((c) => c.id === activeClient);

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
          color: C.textMuted,
          fontSize: 14,
        }}
      >
        กำลังโหลด Training Matrix...
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Noto Sans Thai', sans-serif",
        color: C.text,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Training Matrix
        </h1>
        <p style={{ fontSize: 13, color: C.textSub, margin: "4px 0 0" }}>
          กำหนด Certificate ที่แต่ละตำแหน่งต้องการ — แยกตาม Client และ Matrix
          Version
        </p>
      </div>

      {/* ── Client tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 0,
        }}
      >
        {CLIENTS.map((cl) => {
          const isActive = activeClient === cl.id;
          const totalReqs = Object.values(MOCK_MATRIX[cl.id] || {}).reduce(
            (s, arr) => s + arr.length,
            0,
          );
          return (
            <button
              key={cl.id}
              onClick={() => setActiveClient(cl.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                background: "transparent",
                transition: "all .15s",
                color: isActive ? cl.color : C.textSub,
                borderBottom: `2px solid ${isActive ? cl.color : "transparent"}`,
                marginBottom: -1,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: isActive ? cl.bg : C.borderLight,
                  color: isActive ? cl.color : C.textMuted,
                  fontSize: 10,
                  fontWeight: 700,
                  border: `1px solid ${isActive ? cl.border : C.border}`,
                }}
              >
                {cl.short}
              </span>
              {cl.name}
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 10,
                  background: isActive ? cl.bg : C.borderLight,
                  color: isActive ? cl.color : C.textMuted,
                  border: `1px solid ${isActive ? cl.border : C.border}`,
                  fontWeight: 600,
                }}
              >
                v{cl.version}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main layout ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* LEFT: Positions */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: C.shadowSm,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: `1px solid ${C.borderLight}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.textMuted,
              }}
            >
              Positions
            </span>
            <span
              style={{
                fontSize: 11,
                padding: "1px 7px",
                borderRadius: 10,
                background: clientCfg?.bg,
                color: clientCfg?.color,
                border: `1px solid ${clientCfg?.border}`,
                fontWeight: 700,
              }}
            >
              {positions.length}
            </span>
          </div>

          {positions.map((pos) => {
            const reqCount = getReqs(pos.id).length;
            const isActive = selectedPos?.id === pos.id;
            return (
              <button
                key={pos.id}
                onClick={() => setSelectedPos(pos)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background .12s",
                  background: isActive
                    ? clientCfg?.bg || C.blueBg
                    : "transparent",
                  borderLeft: `3px solid ${isActive ? clientCfg?.color : "transparent"}`,
                  borderBottom: `1px solid ${C.borderLight}`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? clientCfg?.color : C.text,
                    }}
                  >
                    {pos.name}
                  </div>
                  <div
                    style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}
                  >
                    {pos.category}
                    {pos.isOffshore ? " · Offshore" : ""}
                  </div>
                </div>
                {reqCount > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 10,
                      background: isActive ? clientCfg?.color : C.border,
                      color: isActive ? "#fff" : C.textSub,
                    }}
                  >
                    {reqCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT: Training list */}
        {selectedPos ? (
          <div>
            {/* Header */}
            <div
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 12,
                boxShadow: C.shadowSm,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                    {selectedPos.name}
                  </h2>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: clientCfg?.bg,
                      color: clientCfg?.color,
                      border: `1px solid ${clientCfg?.border}`,
                      fontWeight: 600,
                    }}
                  >
                    {clientCfg?.name} {clientCfg?.version}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.textSub,
                    marginTop: 4,
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <span>
                    📋 Total: <strong>{selectedReqs.length}</strong>
                  </span>
                  {activeClient === "erawan" && (
                    <>
                      <span>
                        M:{" "}
                        <strong>
                          {
                            selectedReqs.filter(
                              (r) => r.requirementType === "mandatory",
                            ).length
                          }
                        </strong>
                      </span>
                      <span>
                        R:{" "}
                        <strong>
                          {
                            selectedReqs.filter(
                              (r) => r.requirementType === "relevant",
                            ).length
                          }
                        </strong>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  borderRadius: 8,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  background: saving ? C.border : clientCfg?.color || C.blue,
                  color: saving ? C.textMuted : "#fff",
                  opacity: saving ? 0.7 : 1,
                  transition: "all .15s",
                }}
              >
                {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
              </button>
            </div>

            {/* Hint banner สำหรับ Erawan (M/R) */}
            {activeClient === "erawan" && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 10,
                  padding: "8px 14px",
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#065f46",
                  display: "flex",
                  gap: 16,
                }}
              >
                <span>
                  🟢 <strong>M</strong> = Mandatory บังคับทุกคน
                </span>
                <span>
                  🟡 <strong>R</strong> = Relevant เฉพาะผู้เกี่ยวข้อง
                </span>
              </div>
            )}
            {(activeClient === "chevron" || activeClient === "valeura") && (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 10,
                  padding: "8px 14px",
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#1e40af",
                }}
              >
                🔵 <strong>X</strong> = Required — training
                ทุกรายการที่เลือกถือเป็น Required สำหรับ {clientCfg?.name}
              </div>
            )}

            {/* Filter */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <input
                placeholder="ค้นหา training..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  minWidth: 200,
                  background: C.white,
                }}
              />
              {[
                "all",
                "safety",
                "technical",
                "offshore",
                "medical",
                "client_specific",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "inherit",
                    transition: "all .12s",
                    background:
                      filterCat === cat ? clientCfg?.color || C.blue : C.border,
                    color: filterCat === cat ? "#fff" : C.textSub,
                  }}
                >
                  {cat === "all" ? "ทั้งหมด" : CAT[cat]?.label || cat}
                </button>
              ))}
            </div>

            {/* Training cards */}
            <div style={{ display: "grid", gap: 8 }}>
              {filtered.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: C.textMuted,
                    fontSize: 13,
                  }}
                >
                  ไม่พบ training ที่ค้นหา
                </div>
              )}
              {filtered.map((t) => {
                const checked = isChecked(selectedPos.id, t.id);
                const reqType = getReqType(selectedPos.id, t.id);
                return (
                  <div
                    key={t.id}
                    style={{
                      background: checked ? clientCfg?.bg || C.blueBg : C.white,
                      border: `1px solid ${checked ? clientCfg?.border || C.blueBorder : C.border}`,
                      borderRadius: 10,
                      padding: "11px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "all .15s",
                      boxShadow: C.shadowSm,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTraining(t.id)}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: clientCfg?.color || C.blue,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: checked ? 600 : 400,
                            color: checked ? C.text : C.textSub,
                          }}
                        >
                          {t.name}
                        </span>
                        <CatBadge cat={t.category} />
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.textMuted,
                          marginTop: 3,
                        }}
                      >
                        {t.validityYears
                          ? `อายุ ${t.validityYears} ปี`
                          : "ไม่หมดอายุ"}
                      </div>
                    </div>

                    {/* Req type buttons — เฉพาะ Erawan ที่มี M/R */}
                    {checked && (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {activeClient === "erawan"
                          ? ["mandatory", "relevant"].map((key) => {
                              const val = REQ_TYPES[key];
                              return (
                                <button
                                  key={key}
                                  title={val.title}
                                  onClick={() => setReqType(t.id, key)}
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 6,
                                    border: `1px solid ${reqType === key ? val.border : C.border}`,
                                    background:
                                      reqType === key ? val.bg : "transparent",
                                    color:
                                      reqType === key ? val.color : C.textMuted,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "all .12s",
                                  }}
                                >
                                  {val.label}
                                </button>
                              );
                            })
                          : null}
                        <ReqBadge
                          type={
                            activeClient === "erawan"
                              ? reqType
                              : activeClient === "ptt"
                                ? "mandatory"
                                : "required"
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            {selectedReqs.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: C.textSub,
                    fontWeight: 600,
                    marginRight: 4,
                  }}
                >
                  Selected:
                </span>
                {selectedReqs.map((r) => {
                  const t = trainings.find((x) => x.id === r.trainingId);
                  return t ? (
                    <span
                      key={r.trainingId}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        borderRadius: 20,
                        background: clientCfg?.bg || C.blueBg,
                        color: clientCfg?.color || C.blue,
                        border: `1px solid ${clientCfg?.border || C.blueBorder}`,
                        fontSize: 11,
                      }}
                    >
                      <ReqBadge type={r.requirementType} />
                      {t.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 48,
              textAlign: "center",
              color: C.textMuted,
              fontSize: 14,
            }}
          >
            เลือก Position ทางซ้ายเพื่อกำหนด Training Matrix
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingMatrixExpert;
