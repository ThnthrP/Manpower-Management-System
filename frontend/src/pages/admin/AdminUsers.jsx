import { useEffect, useState } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [roleList, setRoleList] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [companies, setCompanies] = useState([]);
  const [companyMap, setCompanyMap] = useState({});

  // 🔹 โหลด users + roles
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, roleRes, companyRes] = await Promise.all([
          axios.get(backendUrl + "/api/user/all", { withCredentials: true }),
          axios.get(backendUrl + "/api/user/roles", { withCredentials: true }),
          axios.get(backendUrl + "/api/user/companies", {
            withCredentials: true,
          }),
        ]);

        if (userRes.data.success) {
          setUsers(userRes.data.users);

          // เก็บ roleId ของแต่ละ user
          const initialRoles = {};
          userRes.data.users.forEach((u) => {
            initialRoles[u.id] = u.role?.id;
          });
          setRoles(initialRoles);

          const initialCompanies = {};
          userRes.data.users.forEach((u) => {
            initialCompanies[u.id] = u.company?.id || "";
          });
          setCompanyMap(initialCompanies);
        }

        if (roleRes.data.success) {
          setRoleList(roleRes.data.roles);
        }
        if (companyRes.data.success) {
          setCompanies(companyRes.data.companies);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  // 🔹 เปลี่ยนค่า dropdown
  const handleChange = (userId, roleId) => {
    setRoles((prev) => ({
      ...prev,
      [userId]: roleId,
    }));
  };

  // 🔹 save role
  const handleSave = async (userId) => {
    try {
      const roleId = roles[userId];
      const companyId = companyMap[userId];

      // 🔥 ยิงพร้อมกัน (เร็วกว่า)
      const [roleRes, companyRes] = await Promise.all([
        axios.put(
          backendUrl + "/api/user/role",
          { userId, roleId },
          { withCredentials: true },
        ),
        axios.put(
          backendUrl + "/api/user/company",
          { userId, companyId },
          { withCredentials: true },
        ),
      ]);

      // 🔥 check success
      if (roleRes.data.success && companyRes.data.success) {
        alert("Updated successfully");

        // 🔥 refresh users
        const res = await axios.get(backendUrl + "/api/user/all", {
          withCredentials: true,
        });

        if (res.data.success) {
          setUsers(res.data.users);

          // reset dropdown state ใหม่ด้วย
          const updatedRoles = {};
          const updatedCompanies = {};

          res.data.users.forEach((u) => {
            updatedRoles[u.id] = u.role?.id;
            updatedCompanies[u.id] = u.company?.id || "";
          });

          setRoles(updatedRoles);
          setCompanyMap(updatedCompanies);
        }
      } else {
        alert("Update failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">User Management</h1>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Company</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.name}</td>
              <td>{u.email}</td>

              {/* 🔥 Dropdown */}
              <td>
                <select
                  value={roles[u.id] || ""}
                  onChange={(e) => handleChange(u.id, e.target.value)}
                  className="border p-1 rounded"
                >
                  {roleList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <select
                  value={companyMap[u.id] || ""}
                  onChange={(e) =>
                    setCompanyMap((prev) => ({
                      ...prev,
                      [u.id]: e.target.value,
                    }))
                  }
                  className="border p-1 rounded"
                >
                  <option value="">No Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </td>

              {/* 🔥 Save */}
              <td>
                <button
                  onClick={() => handleSave(u.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
