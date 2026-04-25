import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Right */}
      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <div className="p-6 flex-1">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
