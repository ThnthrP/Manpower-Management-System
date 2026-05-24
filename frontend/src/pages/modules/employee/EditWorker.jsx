import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

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

const EditWorker = () => {
  const { backendUrl } = useContext(AppContent);
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm]           = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, posRes] = await Promise.all([
          axios.get(`${backendUrl}/api/employees/${id}`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/employees/positions`, { withCredentials: true }),
        ]);
        if (empRes.data.success) {
          const e = empRes.data.employee;
          setForm({
            fullName:   e.fullName   ?? "",
            fullNameTH: e.fullNameTH ?? "",
            status:     e.status     ?? "active",
            division:   e.division   ?? "",
            isOffshore: e.isOffshore ?? false,
            position:   e.position?.name ?? "",
          });
        }
        if (posRes.data.success) setPositions(posRes.data.positions);
      } catch {
        setError("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!form.fullName) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const { data } = await axios.put(`${backendUrl}/api/employees/${id}`, form, { withCredentials: true });
      if (data.success) {
        navigate(`/admin/workers/${id}`);
      } else {
        setError(data.message ?? "บันทึกไม่สำเร็จ");
      }
    } catch (err) {
      setError(err.response?.data?.message ?? "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="p-6 text-center text-gray-400 text-sm">กำลังโหลด...</div>
    </div>
  );

  if (!form) return (
    <div className="bg-gray-50 min-h-full p-6 text-red-500 text-sm">{error || "ไม่พบข้อมูลพนักงาน"}</div>
  );

  return (
    <div className="bg-gray-50 min-h-full">

      {/* HEADER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <button
          onClick={() => navigate(`/admin/workers/${id}`)}
          className="text-xs text-gray-400 hover:text-blue-600 mb-3 flex items-center gap-1 transition-colors"
        >
          ← Worker
        </button>
        <h1 className="text-xl font-bold text-gray-900">Edit Worker</h1>
      </div>

      <div className="p-6 max-w-4xl">

        {/* SECTION 1 — Basic Information */}
        <CardSection number="1" title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Full Name (English)" required>
              <Input
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="e.g. John Smith"
              />
            </Field>
            <Field label="Full Name (Thai)">
              <Input
                value={form.fullNameTH}
                onChange={(e) => set("fullNameTH", e.target.value)}
                placeholder="ชื่อ-นามสกุล ภาษาไทย"
              />
            </Field>
            <Field label="Position / Trade">
              <SelectInput value={form.position} onChange={(e) => set("position", e.target.value)}>
                <option value="">— เลือกตำแหน่ง —</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Division / แผนก">
              <Input
                value={form.division}
                onChange={(e) => set("division", e.target.value)}
                placeholder="e.g. Mechanical, Scaffold&Paint"
              />
            </Field>
          </div>
        </CardSection>

        {/* SECTION 2 — Status */}
        <CardSection number="2" title="Status & Offshore">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Worker Status">
              <SelectInput value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="onleave">On Leave</option>
                <option value="pending">Pending</option>
              </SelectInput>
            </Field>
            <Field label="Offshore Worker">
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isOffshore}
                    onChange={(e) => set("isOffshore", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700">Offshore Worker</span>
                </label>
              </div>
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
            onClick={() => navigate(`/admin/workers/${id}`)}
            className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditWorker;
