import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const DEPARTMENTS = ["Fabrication", "Mechanical", "Electrical", "Civil", "HSE", "Operations", "Administration"];

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full border-b border-gray-300 focus:border-[#1E3A5F] focus:outline-none py-1.5 text-sm bg-transparent transition-colors placeholder-gray-400"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full border-b border-gray-300 focus:border-[#1E3A5F] focus:outline-none py-1.5 text-sm bg-transparent transition-colors"
  >
    {children}
  </select>
);

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="w-7 h-7 rounded-full bg-[#1E3A5F] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {number}
    </span>
    <h2 className="text-base font-semibold text-gray-800">{title}</h2>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
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
  const [certs, setCerts] = useState([{ name: "", expiry: "" }]);
  const [medical, setMedical] = useState({ hospital: "", examDate: "", expiryDate: "", status: "" });
  const [checks, setChecks] = useState({ basicInfo: false, passport: false, certs: false, medical: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addCert = () => setCerts((c) => [...c, { name: "", expiry: "" }]);
  const setCert = (i, k, v) => setCerts((c) => c.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const removeCert = (i) => setCerts((c) => c.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.empCode || !form.fullName) {
      setError("กรุณากรอก Employee ID และชื่อ-นามสกุล");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await axios.post(`${backendUrl}/api/employees`, {
        ...form, passport, certifications: certs, medical, verificationChecks: checks,
      }, { withCredentials: true });
      navigate("/admin/workers");
    } catch (err) {
      setError(err.response?.data?.message ?? "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-2 px-2">
      {/* HEADER */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/workers")}
          className="text-sm text-[#1E3A5F] hover:text-[#16305A] flex items-center gap-1 mb-4"
        >
          ← Back to Workers
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Worker</h1>
      </div>

      {/* SECTION 1: Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <SectionHeader number="1" title="Basic Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
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
            <Input value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="e.g. Welder" />
          </Field>
          <Field label="Department">
            <Select value={form.department} onChange={(e) => set("department", e.target.value)}>
              <option value="">— เลือกแผนก —</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
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
      </div>

      {/* SECTION 2: Documents */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <SectionHeader number="2" title="Document Upload" />

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Passport</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 mb-8">
          <Field label="Passport Number">
            <Input value={passport.number} onChange={(e) => setPassport((p) => ({ ...p, number: e.target.value }))} placeholder="e.g. AA123456" />
          </Field>
          <Field label="Expiry Date">
            <Input type="date" value={passport.expiry} onChange={(e) => setPassport((p) => ({ ...p, expiry: e.target.value }))} />
          </Field>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Certifications</p>
          <button onClick={addCert} className="text-xs text-[#1E3A5F] hover:text-[#16305A] font-medium">
            + Add Certification
          </button>
        </div>
        <div className="space-y-3 mb-8">
          {certs.map((c, i) => (
            <div key={i} className="flex items-end gap-4">
              <div className="flex-1">
                <Input value={c.name} onChange={(e) => setCert(i, "name", e.target.value)} placeholder="e.g. T-BOSIET, Welding 6G, H2S..." />
              </div>
              <div className="w-36">
                <Input type="date" value={c.expiry} onChange={(e) => setCert(i, "expiry", e.target.value)} />
              </div>
              {certs.length > 1 && (
                <button onClick={() => removeCert(i)} className="text-gray-400 hover:text-red-500 pb-1.5 text-sm">✕</button>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Medical Check-up Record</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
          <Field label="Hospital / Clinic">
            <Input value={medical.hospital} onChange={(e) => setMedical((m) => ({ ...m, hospital: e.target.value }))} placeholder="e.g. Bangkok Hospital" />
          </Field>
          <Field label="Examination Date">
            <Input type="date" value={medical.examDate} onChange={(e) => setMedical((m) => ({ ...m, examDate: e.target.value }))} />
          </Field>
          <Field label="Expiry Date">
            <Input type="date" value={medical.expiryDate} onChange={(e) => setMedical((m) => ({ ...m, expiryDate: e.target.value }))} />
          </Field>
          <Field label="Status">
            <Select value={medical.status} onChange={(e) => setMedical((m) => ({ ...m, status: e.target.value }))}>
              <option value="">— เลือก —</option>
              <option value="fit">Fit</option>
              <option value="fit_with_condition">Fit with Condition</option>
              <option value="unfit">Unfit</option>
              <option value="pending">Pending</option>
            </Select>
          </Field>
        </div>
      </div>

      {/* SECTION 3: Verification & Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <SectionHeader number="3" title="Verification Checklist & Status" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {[
            ["basicInfo", "Basic information verified"],
            ["passport",  "Passport / ID verified"],
            ["certs",     "Certifications verified"],
            ["medical",   "Medical fit confirmed"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={checks[key]}
                onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-[#1E3A5F] focus:ring-[#1E3A5F]"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
            </label>
          ))}
        </div>

        <div className="w-48">
          <Field label="Worker Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>
      </div>

      {/* ERROR */}
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-3 py-4 pb-8">
        <button
          onClick={() => navigate("/admin/workers")}
          className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#16305A] disabled:opacity-50 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Worker"}
        </button>
      </div>
    </div>
  );
};

export default AddWorker;
