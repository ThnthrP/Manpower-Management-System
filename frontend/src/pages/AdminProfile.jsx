import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import AdminLayout from "../components/admin/AdminLayout";

const AdminProfile = () => {
  const { userData, backendUrl, getUserData } = useContext(AppContent);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    department: "",
  });

  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || "",
        phone: userData.phone || "",
        department: userData.department || "",
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const { data } = await axios.put(`${backendUrl}/api/user/update`, form);

      if (data.success) {
        toast.success("อัปเดตโปรไฟล์สำเร็จ");
        setEditingField(null);
        await getUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-xl font-bold text-center">My Profile</h1>

        {/* NAME */}
        <div>
          <label className="text-sm text-gray-500">Name</label>

          {editingField === "name" ? (
            <div className="flex gap-2 mt-1">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="flex-1 border px-3 py-1 rounded text-sm"
              />
              {/* <button onClick={handleSave} className="text-blue-500 text-sm">
                Save
              </button> */}
              <button
                onClick={handleSave}
                disabled={loading}
                className="text-blue-500 text-sm"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between mt-1">
              <span>{form.name}</span>
              <button
                onClick={() => setEditingField("name")}
                className="text-blue-500 text-sm"
              >
                แก้ไข
              </button>
            </div>
          )}
        </div>

        {/* EMAIL (readonly) */}
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <div className="mt-1 text-gray-700">{userData?.email || "-"}</div>
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm text-gray-500">Phone</label>

          {editingField === "phone" ? (
            <div className="flex gap-2 mt-1">
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="flex-1 border px-3 py-1 rounded text-sm"
              />
              {/* <button onClick={handleSave} className="text-blue-500 text-sm">
                Save
              </button> */}
              <button
                onClick={handleSave}
                disabled={loading}
                className="text-blue-500 text-sm"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between mt-1">
              <span>{form.phone || "ยังไม่ได้เพิ่ม"}</span>
              <button
                onClick={() => setEditingField("phone")}
                className="text-blue-500 text-sm"
              >
                {form.phone ? "แก้ไข" : "เพิ่ม"}
              </button>
            </div>
          )}
        </div>

        {/* DEPARTMENT */}
        <div>
          <label className="text-sm text-gray-500">Department</label>

          {editingField === "department" ? (
            <div className="flex gap-2 mt-1">
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="flex-1 border px-3 py-1 rounded text-sm"
              >
                <option value="">เลือกแผนก</option>
                <option>HR</option>
                <option>QAQC</option>
                <option>CISS</option>
                <option>CES</option>
                <option>MANPOWER</option>
              </select>

              {/* <button onClick={handleSave} className="text-blue-500 text-sm">
                Save
              </button> */}
              <button
                onClick={handleSave}
                disabled={loading}
                className="text-blue-500 text-sm"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between mt-1">
              <span>{form.department || "ยังไม่ได้เลือก"}</span>
              <button
                onClick={() => setEditingField("department")}
                className="text-blue-500 text-sm"
              >
                {form.department ? "แก้ไข" : "เพิ่ม"}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
