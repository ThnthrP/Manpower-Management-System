import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../../../context/AppContext";

const fmtMonth = (d) =>
  d ? new Date(d).toLocaleDateString("th-TH", { month: "short", year: "numeric" }) : "ปัจจุบัน";

const toInputDate = (d) => {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-300 transition-colors"
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    rows={3}
    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-300 transition-colors resize-none"
  />
);

const SaveRow = ({ onSave, onCancel, saving, disabled }) => (
  <div className="flex gap-2 pt-3">
    <button onClick={onSave} disabled={saving || disabled}
      className="px-5 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded transition-colors">
      {saving ? "Saving..." : "Save"}
    </button>
    <button onClick={onCancel}
      className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors">
      Cancel
    </button>
  </div>
);

const EMPTY_EXP = { company: "", position: "", startDate: "", endDate: "", description: "" };

const WorkerCV = () => {
  const { backendUrl } = useContext(AppContent);
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [cv, setCV]             = useState(null);
  const [loading, setLoading]   = useState(true);

  const [profileEdit, setProfileEdit]     = useState(false);
  const [profileForm, setProfileForm]     = useState({ summary: "", totalYearsExp: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  const [addOpen, setAddOpen]   = useState(false);
  const [addForm, setAddForm]   = useState(EMPTY_EXP);
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EXP);
  const [expSaving, setExpSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/employees/${id}/cv`, { withCredentials: true });
        if (data.success) { setEmployee(data.employee); setCV(data.cv); }
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const openProfileEdit = () => {
    setProfileForm({ summary: cv?.summary ?? "", totalYearsExp: cv?.totalYearsExp ?? "" });
    setProfileEdit(true);
  };

  const saveProfile = async () => {
    try {
      setProfileSaving(true);
      const { data } = await axios.put(`${backendUrl}/api/employees/${id}/cv`, profileForm, { withCredentials: true });
      if (data.success) { setCV(data.cv); setProfileEdit(false); }
    } catch { /* silent */ } finally { setProfileSaving(false); }
  };

  const saveAddExp = async () => {
    if (!addForm.company || !addForm.position || !addForm.startDate) return;
    try {
      setExpSaving(true);
      const { data } = await axios.post(`${backendUrl}/api/employees/${id}/cv/experiences`, addForm, { withCredentials: true });
      if (data.success) {
        setCV((c) => ({ ...(c ?? {}), experiences: [data.experience, ...(c?.experiences ?? [])] }));
        setAddForm(EMPTY_EXP);
        setAddOpen(false);
      }
    } catch { /* silent */ } finally { setExpSaving(false); }
  };

  const openEditExp = (exp) => {
    setEditId(exp.id);
    setEditForm({ company: exp.company, position: exp.position, startDate: toInputDate(exp.startDate), endDate: toInputDate(exp.endDate), description: exp.description ?? "" });
  };

  const saveEditExp = async () => {
    try {
      setExpSaving(true);
      const { data } = await axios.put(`${backendUrl}/api/employees/${id}/cv/experiences/${editId}`, editForm, { withCredentials: true });
      if (data.success) {
        setCV((c) => ({ ...c, experiences: c.experiences.map((e) => e.id === editId ? data.experience : e) }));
        setEditId(null);
      }
    } catch { /* silent */ } finally { setExpSaving(false); }
  };

  const deleteExp = async (expId) => {
    try {
      await axios.delete(`${backendUrl}/api/employees/${id}/cv/experiences/${expId}`, { withCredentials: true });
      setCV((c) => ({ ...c, experiences: c.experiences.filter((e) => e.id !== expId) }));
    } catch { /* silent */ }
  };

  if (loading) return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-5" />
      <div className="p-6 text-center text-gray-400 text-sm">กำลังโหลด...</div>
    </div>
  );

  const experiences = cv?.experiences ?? [];

  return (
    <div className="bg-gray-50 min-h-full">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <button onClick={() => navigate(`/admin/workers/${id}`)}
          className="text-xs text-gray-400 hover:text-blue-600 mb-3 flex items-center gap-1 transition-colors">
          ← Worker
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 select-none">
            {initials(employee?.fullName ?? "")}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{employee?.fullName}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="font-mono">{employee?.empCode}</span>
              {employee?.position?.name && (
                <><span className="mx-1.5 text-gray-300">·</span><span>{employee.position.name}</span></>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-3xl space-y-5">

        {/* PROFILE SUMMARY */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Summary</h2>
            {!profileEdit && (
              <button onClick={openProfileEdit}
                className="text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors">
                Edit
              </button>
            )}
          </div>

          {profileEdit ? (
            <div className="space-y-4">
              <div className="w-40">
                <Field label="ประสบการณ์รวม (ปี)">
                  <Input type="number" min="0" value={profileForm.totalYearsExp}
                    onChange={(e) => setProfileForm((f) => ({ ...f, totalYearsExp: e.target.value }))}
                    placeholder="0" />
                </Field>
              </div>
              <Field label="Summary">
                <Textarea value={profileForm.summary}
                  onChange={(e) => setProfileForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="สรุปประสบการณ์และทักษะ..." />
              </Field>
              <SaveRow onSave={saveProfile} onCancel={() => setProfileEdit(false)} saving={profileSaving} />
            </div>
          ) : (
            <div>
              {cv?.totalYearsExp > 0 && (
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-2xl font-bold text-gray-900">{cv.totalYearsExp}</span>
                  <span className="text-sm text-gray-400">ปีประสบการณ์</span>
                </div>
              )}
              {cv?.summary ? (
                <p className="text-sm text-gray-700 leading-relaxed">{cv.summary}</p>
              ) : (
                <p className="text-sm text-gray-400">ยังไม่มี Summary — กด Edit เพื่อเพิ่ม</p>
              )}
            </div>
          )}
        </div>

        {/* WORK EXPERIENCE */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Work Experience</h2>
              {experiences.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{experiences.length}</span>
              )}
            </div>
            <button onClick={() => { setAddOpen(true); setEditId(null); }}
              className="text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors">
              + Add
            </button>
          </div>

          {/* Add form */}
          {addOpen && (
            <div className="border border-gray-200 p-5 mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">ประสบการณ์ใหม่</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <Field label="บริษัท *">
                  <Input value={addForm.company}
                    onChange={(e) => setAddForm((f) => ({ ...f, company: e.target.value }))}
                    placeholder="e.g. PTT Exploration and Production" autoFocus />
                </Field>
                <Field label="ตำแหน่ง *">
                  <Input value={addForm.position}
                    onChange={(e) => setAddForm((f) => ({ ...f, position: e.target.value }))}
                    placeholder="e.g. Rigger, Welder" />
                </Field>
                <Field label="เริ่มงาน *">
                  <Input type="date" value={addForm.startDate}
                    onChange={(e) => setAddForm((f) => ({ ...f, startDate: e.target.value }))} />
                </Field>
                <Field label="สิ้นสุด (ว่างถ้ายังทำงานอยู่)">
                  <Input type="date" value={addForm.endDate}
                    onChange={(e) => setAddForm((f) => ({ ...f, endDate: e.target.value }))} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="รายละเอียด">
                    <Textarea value={addForm.description}
                      onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="งานที่รับผิดชอบ / ทักษะที่ใช้..." />
                  </Field>
                </div>
              </div>
              <SaveRow onSave={saveAddExp} onCancel={() => { setAddOpen(false); setAddForm(EMPTY_EXP); }}
                saving={expSaving} disabled={!addForm.company || !addForm.position || !addForm.startDate} />
            </div>
          )}

          {/* Experience list */}
          {experiences.length === 0 && !addOpen ? (
            <div className="border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
              ยังไม่มีประสบการณ์ทำงาน — กด + Add เพื่อเพิ่ม
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {experiences.map((exp) => {
                if (editId === exp.id) {
                  return (
                    <div key={exp.id} className="py-5 first:pt-0">
                      <div className="border border-gray-200 p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          <Field label="บริษัท">
                            <Input value={editForm.company}
                              onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))} autoFocus />
                          </Field>
                          <Field label="ตำแหน่ง">
                            <Input value={editForm.position}
                              onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))} />
                          </Field>
                          <Field label="เริ่มงาน">
                            <Input type="date" value={editForm.startDate}
                              onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))} />
                          </Field>
                          <Field label="สิ้นสุด">
                            <Input type="date" value={editForm.endDate}
                              onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))} />
                          </Field>
                          <div className="sm:col-span-2">
                            <Field label="รายละเอียด">
                              <Textarea value={editForm.description}
                                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                            </Field>
                          </div>
                        </div>
                        <SaveRow onSave={saveEditExp} onCancel={() => setEditId(null)} saving={expSaving} />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={exp.id} className="py-4 first:pt-0 flex gap-4 group">
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{exp.position}</p>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fmtMonth(exp.startDate)} — {fmtMonth(exp.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => openEditExp(exp)}
                            className="text-gray-400 hover:text-gray-600 text-xs px-1.5 py-1 rounded hover:bg-gray-100 transition-colors">✎</button>
                          <button onClick={() => deleteExp(exp.id)}
                            className="text-gray-300 hover:text-red-400 text-base px-1.5 py-1 rounded hover:bg-gray-100 transition-colors leading-none">×</button>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default WorkerCV;
