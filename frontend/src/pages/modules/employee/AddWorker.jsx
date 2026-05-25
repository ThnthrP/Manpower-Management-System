import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const DEPARTMENTS = ["Fabrication", "Mechanical", "Electrical", "Civil", "HSE", "Operations", "Administration"];

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-300 transition-colors"
  />
);

const SelectInput = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors text-gray-700"
  >
    {children}
  </select>
);

const CardSection = ({ number, title, children }) => (
  <div className="bg-white border border-gray-200 p-6 mb-4">
    <div className="flex items-center gap-3 mb-5">
      <span className="w-6 h-6 rounded bg-slate-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</h2>
    </div>
    {children}
  </div>
);

const SubLabel = ({ children }) => (
  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">{children}</p>
);

const AddWorker = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    empCode: "", fullName: "", fullNameTH: "", nationality: "",
    position: "", department: "", dateOfJoining: "", phone: "", email: "",
    notes: "", status: "pending",
  });
  const [passport, setPassport] = useState({ number: "", expiry: "" });
  const [certs, setCerts]       = useState([{ name: "", expiry: "" }]);
  const [medical, setMedical]   = useState({ hospital: "", examDate: "", expiryDate: "", status: "" });
  const [checks, setChecks]     = useState({ basicInfo: false, passport: false, certs: false, medical: false });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const set        = (k, v)    => setForm((f) => ({ ...f, [k]: v }));
  const addCert    = ()        => setCerts((c) => [...c, { name: "", expiry: "" }]);
  const setCert    = (i, k, v) => setCerts((c) => c.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const removeCert = (i)       => setCerts((c) => c.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.empCode || !form.fullName) {
      setError("กรุณากรอก Employee ID และชื่อ-นามสกุล");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await axios.post(`${backendUrl}/api/employees`,
        { ...form, passport, certifications: certs, medical, verificationChecks: checks },
        { withCredentials: true });
      navigate("/admin/workers");
    } catch (err) {
      setError(err.response?.data?.message ?? "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-full">

      {/* HEADER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <button
          onClick={() => navigate("/admin/workers")}
          className="text-xs text-gray-400 hover:text-blue-600 mb-3 flex items-center gap-1 transition-colors"
        >
          ← Workers
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add New Worker</h1>
      </div>

      <div className="p-6 max-w-4xl">

        {/* SECTION 1 — Basic Information */}
        <CardSection number="1" title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Employee ID" required>
              <Input value={form.empCode} onChange={(e) => set("empCode", e.target.value)} placeholder="e.g. EXP001" />
            </Field>
            <Field label="Full Name (as per Passport)" required>
              <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. John Smith" />
            </Field>
            <Field label="Full Name (Thai)">
              <Input value={form.fullNameTH} onChange={(e) => set("fullNameTH", e.target.value)} placeholder="ชื่อ-นามสกุล ภาษาไทย" />
            </Field>
            <Field label="Nationality">
              <Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} placeholder="e.g. Thai" />
            </Field>
            <Field label="Position / Trade">
              <Input value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="e.g. Welder, Rigger" />
            </Field>
            <Field label="Department">
              <SelectInput value={form.department} onChange={(e) => set("department", e.target.value)}>
                <option value="">— เลือกแผนก —</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </SelectInput>
            </Field>
            <Field label="Date of Joining">
              <Input type="date" value={form.dateOfJoining} onChange={(e) => set("dateOfJoining", e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. 081-234-5678" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="e.g. john@company.com" />
            </Field>
            <Field label="Notes">
              <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="หมายเหตุเพิ่มเติม..." />
            </Field>
          </div>
        </CardSection>

        {/* SECTION 2 — Documents */}
        <CardSection number="2" title="Documents">
          {/* Passport */}
          <SubLabel>Passport</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
            <Field label="Passport Number">
              <Input value={passport.number} onChange={(e) => setPassport((p) => ({ ...p, number: e.target.value }))} placeholder="e.g. AA123456" />
            </Field>
            <Field label="Expiry Date">
              <Input type="date" value={passport.expiry} onChange={(e) => setPassport((p) => ({ ...p, expiry: e.target.value }))} />
            </Field>
          </div>

          {/* Certifications */}
          <div className="flex items-center justify-between mb-3">
            <SubLabel>Certifications</SubLabel>
            <button onClick={addCert} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              + Add
            </button>
          </div>
          <div className="space-y-2 mb-6">
            {certs.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <Input value={c.name} onChange={(e) => setCert(i, "name", e.target.value)}
                    placeholder="e.g. T-BOSIET, Welding 6G, H2S..." />
                </div>
                <div className="w-36 flex-shrink-0">
                  <Input type="date" value={c.expiry} onChange={(e) => setCert(i, "expiry", e.target.value)} />
                </div>
                {certs.length > 1 && (
                  <button onClick={() => removeCert(i)} className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0">×</button>
                )}
              </div>
            ))}
          </div>

          {/* Medical */}
          <SubLabel>Medical Check-up</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Hospital / Clinic">
              <Input value={medical.hospital} onChange={(e) => setMedical((m) => ({ ...m, hospital: e.target.value }))} placeholder="e.g. Bangkok Hospital" />
            </Field>
            <Field label="Examination Date">
              <Input type="date" value={medical.examDate} onChange={(e) => setMedical((m) => ({ ...m, examDate: e.target.value }))} />
            </Field>
            <Field label="Expiry Date">
              <Input type="date" value={medical.expiryDate} onChange={(e) => setMedical((m) => ({ ...m, expiryDate: e.target.value }))} />
            </Field>
            <Field label="Result">
              <SelectInput value={medical.status} onChange={(e) => setMedical((m) => ({ ...m, status: e.target.value }))}>
                <option value="">— เลือกผล —</option>
                <option value="fit">Fit</option>
                <option value="fit_with_condition">Fit with Condition</option>
                <option value="unfit">Unfit</option>
                <option value="pending">Pending</option>
              </SelectInput>
            </Field>
          </div>
        </CardSection>

        {/* SECTION 3 — Verification & Status */}
        <CardSection number="3" title="Verification & Status">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {[
              ["basicInfo", "Basic information verified"],
              ["passport",  "Passport / ID verified"],
              ["certs",     "Certifications verified"],
              ["medical",   "Medical fit confirmed"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks[key]}
                  onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="w-48">
            <Field label="Worker Status">
              <SelectInput value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectInput>
            </Field>
          </div>
        </CardSection>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            onClick={() => navigate("/admin/workers")}
            className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded transition-colors"
          >
            {saving ? "Saving..." : "Save Worker"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWorker;
