import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useContext } from "react";
import { AppContent } from "../../context/AppContext";

const Layout = ({ children }) => {
  const { userData } = useContext(AppContent);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar role={userData?.role?.name} />

      {/* Right */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
