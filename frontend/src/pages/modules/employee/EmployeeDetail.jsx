import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const toInputDate = (d) => {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
};

const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

const STATUS_BADGE = {
  active:   { bg: "bg-green-100 text-green-700",  dot: "bg-green-500",  label: "Active" },
  inactive: { bg: "bg-red-100 text-red-700",      dot: "bg-red-500",    label: "Inactive" },
  onleave:  { bg: "bg-yellow-100 text-yellow-700",dot: "bg-yellow-500", label: "On Leave" },
  pending:  { bg: "bg-gray-100 text-gray-600",    dot: "bg-gray-400",   label: "Pending" },
};

const TRAINING_STATUS = {
  completed: { bg: "bg-green-50",  badge: "bg-green-100 text-green-700",  label: "Completed" },
  due_soon:  { bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-700",label: "Due Soon" },
  overdue:   { bg: "bg-red-50",    badge: "bg-red-100 text-red-700",      label: "Overdue" },
  pending:   { bg: "bg-gray-50",   badge: "bg-gray-100 text-gray-500",    label: "Pending" },
  missing:   { bg: "bg-red-50",    badge: "bg-red-100 text-red-600",      label: "Missing" },
};

const MEDICAL_STATUS = {
  passed:   { badge: "bg-green-100 text-green-700",  label: "Passed" },
  failed:   { badge: "bg-red-100 text-red-700",      label: "Failed" },
  pending:  { badge: "bg-gray-100 text-gray-500",    label: "Pending" },
  overdue:  { badge: "bg-red-100 text-red-700",      label: "Overdue" },
  due_soon: { badge: "bg-yellow-100 text-yellow-700",label: "Due Soon" },
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const PassportStatus = ({ expiryDate }) => {
  const days = daysUntil(expiryDate);
  if (days === null) return <span className="text-gray-400 text-xs">—</span>;
  if (days < 0) return <span className="text-xs font-medium text-red-600">หมดอายุแล้ว ({Math.abs(days)} วันที่แล้ว)</span>;
  if (days <= 90) return <span className="text-xs font-medium text-yellow-600">เหลือ {days} วัน ⚠️</span>;
  return <span className="text-xs text-green-600">เหลือ {days} วัน</span>;
};

const SectionTitle = ({ children, count, action }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{children}</h2>
      {count !== undefined && (
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{count}</span>
      )}
    </div>
    {action}
  </div>
);

const InfoRow = ({ label, value, mono }) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <span className="w-36 text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</span>
    <span className={`text-sm text-gray-800 ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
  </div>
);

const FieldInput = (props) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-300 transition-colors"
  />
);

const SaveRow = ({ onSave, onCancel, saving, disabled }) => (
  <div className="flex gap-2 pt-3">
    <button onClick={onSave} disabled={saving || disabled}
      className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded transition-colors">
      {saving ? "Saving..." : "Save"}
    </button>
    <button onClick={onCancel}
      className="px-4 py-1.5 text-xs text-gray-600 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors">
      Cancel
    </button>
  </div>
);

const EmployeeDetail = () => {
  const { backendUrl } = useContext(AppContent);
  const { id } = useParams();
  const navigate = useNavigate();

  const [emp, setEmp]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // [ใหม่] state สำหรับ inline edit passport
  const [passportEdit, setPassportEdit]   = useState(false);
  const [passportForm, setPassportForm]   = useState({ passportNo: "", expiryDate: "", issuedDate: "", issuedCountry: "TH", visaType: "", visaExpiryDate: "" });
  const [passportSaving, setPassportSaving] = useState(false);

  // [ใหม่] state สำหรับ add/edit/delete certification
  const [certEditId, setCertEditId]     = useState(null);
  const [certEditForm, setCertEditForm] = useState({ name: "", expiry: "" });
  const [certAddOpen, setCertAddOpen]   = useState(false);
  const [certNewForm, setCertNewForm]   = useState({ name: "", expiry: "" });
  const [certSaving, setCertSaving]     = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/employees/${id}`, { withCredentials: true });
        if (data.success) setEmp(data.employee);
        else setError("ไม่พบข้อมูลพนักงาน");
      } catch {
        setError("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // ── Passport ────────────────────────────────────────────

  const openPassportEdit = () => {
    setPassportForm({
      passportNo:     emp.passport?.passportNo     ?? "",
      expiryDate:     toInputDate(emp.passport?.expiryDate),
      issuedDate:     toInputDate(emp.passport?.issuedDate),
      issuedCountry:  emp.passport?.issuedCountry  ?? "TH",
      visaType:       emp.passport?.visaType        ?? "",
      visaExpiryDate: toInputDate(emp.passport?.visaExpiryDate),
    });
    setPassportEdit(true);
  };

  const savePassport = async () => {
    if (!passportForm.passportNo) return;
    try {
      setPassportSaving(true);
      const { data } = await axios.put(`${backendUrl}/api/employees/${id}/passport`, passportForm, { withCredentials: true });
      if (data.success) { setEmp((e) => ({ ...e, passport: data.passport })); setPassportEdit(false); }
    } catch { /* silent */ } finally { setPassportSaving(false); }
  };

  // ── Cert ────────────────────────────────────────────────

  const openCertEdit = (cert) => {
    setCertEditId(cert.id);
    setCertEditForm({ name: cert.globalTraining?.name ?? cert.rawTrainingName, expiry: toInputDate(cert.expiryDate) });
  };

  const saveCertEdit = async () => {
    try {
      setCertSaving(true);
      const { data } = await axios.put(`${backendUrl}/api/employees/${id}/certifications/${certEditId}`, { name: certEditForm.name, expiry: certEditForm.expiry }, { withCredentials: true });
      if (data.success) { setEmp((e) => ({ ...e, trainings: e.trainings.map((t) => t.id === certEditId ? data.certification : t) })); setCertEditId(null); }
    } catch { /* silent */ } finally { setCertSaving(false); }
  };

  const deleteCert = async (certId) => {
    try {
      await axios.delete(`${backendUrl}/api/employees/${id}/certifications/${certId}`, { withCredentials: true });
      setEmp((e) => ({ ...e, trainings: e.trainings.filter((t) => t.id !== certId) }));
    } catch { /* silent */ }
  };

  const saveNewCert = async () => {
    if (!certNewForm.name) return;
    try {
      setCertSaving(true);
      const { data } = await axios.post(`${backendUrl}/api/employees/${id}/certifications`, { name: certNewForm.name, expiry: certNewForm.expiry }, { withCredentials: true });
      if (data.success) { setEmp((e) => ({ ...e, trainings: [...(e.trainings ?? []), data.certification] })); setCertNewForm({ name: "", expiry: "" }); setCertAddOpen(false); }
    } catch { /* silent */ } finally { setCertSaving(false); }
  };

  if (loading) return <div className="p-8 text-gray-400 text-sm">กำลังโหลด...</div>;
  if (error)   return <div className="p-8 text-red-500 text-sm">{error}</div>;
  if (!emp)    return null;

  const statusCfg = STATUS_BADGE[emp.status] ?? STATUS_BADGE.pending;

  return (
    <div className="bg-gray-50 min-h-full">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <button onClick={() => navigate("/admin/workers")}
          className="text-xs text-gray-400 hover:text-blue-600 mb-4 flex items-center gap-1 transition-colors">
          ← Workers
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center text-lg font-bold flex-shrink-0 select-none">
              {initials(emp.fullName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{emp.fullName}</h1>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${statusCfg.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
                {emp.isOffshore && (
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">⚓ Offshore</span>
                )}
              </div>
              {emp.fullNameTH && <p className="text-sm text-gray-500 mt-0.5">{emp.fullNameTH}</p>}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono text-gray-400">{emp.empCode}</span>
                {emp.position?.name && (<><span className="text-gray-300">·</span><span className="text-xs text-gray-500">{emp.position.name}</span></>)}
                {(emp.department?.name ?? emp.division) && (<><span className="text-gray-300">·</span><span className="text-xs text-gray-500">{emp.department?.name ?? emp.division}</span></>)}
              </div>
            </div>
          </div>
          {/* [ใหม่] ปุ่ม CV และ Edit Worker */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate(`/admin/workers/${emp.id}/cv`)}
              className="text-sm px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors">
              CV
            </button>
            <button onClick={() => navigate(`/admin/workers/${emp.id}/edit`)}
              className="text-sm px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors">
              Edit Worker
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-5">

          {/* BASIC INFO */}
          <div className="bg-white border border-gray-200 p-5">
            <SectionTitle>Basic Information</SectionTitle>
            <InfoRow label="Position"        value={emp.position?.name} />
            <InfoRow label="Department"      value={emp.department?.name ?? emp.division} />
            <InfoRow label="Nationality"     value={emp.nationality} />
            <InfoRow label="Phone"           value={emp.phone} />
            <InfoRow label="Email"           value={emp.email} />
            <InfoRow label="Date of Joining" value={fmt(emp.dateOfJoining)} />
            {emp.notes && <InfoRow label="Notes" value={emp.notes} />}
          </div>

          {/* PASSPORT */}
          <div className="bg-white border border-gray-200 p-5">
            <SectionTitle
              action={
                !passportEdit && (
                  <button onClick={openPassportEdit}
                    className="text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors">
                    {emp.passport ? "Edit" : "+ Add"}
                  </button>
                )
              }
            >
              Passport
            </SectionTitle>

            {passportEdit ? (
              <div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Passport No. *</p>
                    <FieldInput value={passportForm.passportNo}
                      onChange={(e) => setPassportForm((f) => ({ ...f, passportNo: e.target.value }))}
                      placeholder="e.g. AA123456" autoFocus />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">ออกที่</p>
                    <FieldInput value={passportForm.issuedCountry}
                      onChange={(e) => setPassportForm((f) => ({ ...f, issuedCountry: e.target.value }))}
                      placeholder="TH" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">วันออก</p>
                    <FieldInput type="date" value={passportForm.issuedDate}
                      onChange={(e) => setPassportForm((f) => ({ ...f, issuedDate: e.target.value }))} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">วันหมดอายุ</p>
                    <FieldInput type="date" value={passportForm.expiryDate}
                      onChange={(e) => setPassportForm((f) => ({ ...f, expiryDate: e.target.value }))} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Visa Type</p>
                    <FieldInput value={passportForm.visaType}
                      onChange={(e) => setPassportForm((f) => ({ ...f, visaType: e.target.value }))}
                      placeholder="e.g. Work" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Visa หมดอายุ</p>
                    <FieldInput type="date" value={passportForm.visaExpiryDate}
                      onChange={(e) => setPassportForm((f) => ({ ...f, visaExpiryDate: e.target.value }))} />
                  </div>
                </div>
                <SaveRow onSave={savePassport} onCancel={() => setPassportEdit(false)}
                  saving={passportSaving} disabled={!passportForm.passportNo} />
              </div>
            ) : emp.passport ? (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-base font-mono font-semibold text-gray-800 tracking-widest">{emp.passport.passportNo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ออกที่: {emp.passport.issuedCountry ?? "TH"}</p>
                  </div>
                  <PassportStatus expiryDate={emp.passport.expiryDate} />
                </div>
                <InfoRow label="วันหมดอายุ" value={fmt(emp.passport.expiryDate)} />
                {emp.passport.visaType && <InfoRow label="Visa Type" value={emp.passport.visaType} />}
              </>
            ) : (
              <p className="text-sm text-gray-400">ไม่มีข้อมูล Passport</p>
            )}
          </div>

          {/* MEDICAL */}
          <div className="bg-white border border-gray-200 p-5">
            <SectionTitle count={emp.medicalChecks?.length ?? 0}>Medical Checks</SectionTitle>
            {!emp.medicalChecks?.length ? (
              <p className="text-sm text-gray-400">ไม่มีข้อมูลผลตรวจสุขภาพ</p>
            ) : (
              <div className="space-y-2">
                {emp.medicalChecks.map((m) => {
                  const s = MEDICAL_STATUS[m.status] ?? MEDICAL_STATUS.pending;
                  const days = daysUntil(m.expiryDate);
                  return (
                    <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm text-gray-800">{m.checkType}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          หมดอายุ: {fmt(m.expiryDate)}
                          {days !== null && days >= 0 && days <= 90 && <span className="ml-1 text-yellow-600">({days} วัน)</span>}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${s.badge}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">

          {/* CERTIFICATIONS */}
          <div className="bg-white border border-gray-200 p-5">
            <SectionTitle
              count={emp.trainings?.length ?? 0}
              action={
                <button onClick={() => { setCertAddOpen(true); setCertEditId(null); }}
                  className="text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors">
                  + Add
                </button>
              }
            >
              Certifications & Trainings
            </SectionTitle>

            {/* Add row */}
            {certAddOpen && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <FieldInput value={certNewForm.name}
                      onChange={(e) => setCertNewForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="ชื่อหลักสูตร / ใบรับรอง" autoFocus />
                  </div>
                  <div className="w-36 flex-shrink-0">
                    <FieldInput type="date" value={certNewForm.expiry}
                      onChange={(e) => setCertNewForm((f) => ({ ...f, expiry: e.target.value }))} />
                  </div>
                </div>
                <SaveRow
                  onSave={saveNewCert}
                  onCancel={() => { setCertAddOpen(false); setCertNewForm({ name: "", expiry: "" }); }}
                  saving={certSaving} disabled={!certNewForm.name}
                />
              </div>
            )}

            {!emp.trainings?.length && !certAddOpen ? (
              <p className="text-sm text-gray-400">ไม่มีข้อมูลการอบรม</p>
            ) : (
              <div className="space-y-1">
                {(emp.trainings ?? []).map((t) => {
                  const s = TRAINING_STATUS[t.status] ?? TRAINING_STATUS.pending;
                  const days = daysUntil(t.expiryDate);
                  const isEditing = certEditId === t.id;

                  if (isEditing) {
                    return (
                      <div key={t.id} className="px-3 py-3 rounded border border-gray-200 bg-white mb-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1">
                            <FieldInput value={certEditForm.name}
                              onChange={(e) => setCertEditForm((f) => ({ ...f, name: e.target.value }))}
                              autoFocus />
                          </div>
                          <div className="w-36 flex-shrink-0">
                            <FieldInput type="date" value={certEditForm.expiry}
                              onChange={(e) => setCertEditForm((f) => ({ ...f, expiry: e.target.value }))} />
                          </div>
                        </div>
                        <SaveRow onSave={saveCertEdit} onCancel={() => setCertEditId(null)} saving={certSaving} />
                      </div>
                    );
                  }

                  return (
                    <div key={t.id} className={`flex items-center justify-between px-3 py-2.5 rounded group ${s.bg}`}>
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm text-gray-800 truncate">{t.globalTraining?.name ?? t.rawTrainingName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t.expiryDate ? (
                            <>
                              หมดอายุ {fmt(t.expiryDate)}
                              {days !== null && (
                                <span className={`ml-1 ${days < 0 ? "text-red-500" : days <= 60 ? "text-yellow-600" : "text-gray-400"}`}>
                                  {days < 0 ? `(${Math.abs(days)} วันที่แล้ว)` : `(${days} วัน)`}
                                </span>
                              )}
                            </>
                          ) : "ไม่มีวันหมดอายุ"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>{s.label}</span>
                        <button onClick={() => openCertEdit(t)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 text-xs px-1 transition-opacity">✎</button>
                        <button onClick={() => deleteCert(t.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-base px-1 transition-opacity leading-none">×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* LEAVE HISTORY */}
          {emp.leaves?.length > 0 && (
            <div className="bg-white border border-gray-200 p-5">
              <SectionTitle count={emp.leaves.length}>Leave History</SectionTitle>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-xs text-gray-400 font-medium">ประเภท</th>
                    <th className="text-left py-2 text-xs text-gray-400 font-medium w-28">เริ่ม</th>
                    <th className="text-left py-2 text-xs text-gray-400 font-medium w-28">สิ้นสุด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {emp.leaves.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2 text-gray-700 capitalize">{l.leaveType}</td>
                      <td className="py-2 text-gray-500">{fmt(l.startDate)}</td>
                      <td className="py-2 text-gray-500">{fmt(l.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
