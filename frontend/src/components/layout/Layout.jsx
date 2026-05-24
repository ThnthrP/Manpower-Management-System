import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useContext } from "react";
import { AppContent } from "../../context/AppContext";

const Layout = ({ children }) => {
  const { userData } = useContext(AppContent);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar — fixed height, scrolls independently */}
      <div className="h-screen overflow-y-auto flex-shrink-0">
        <Sidebar role={userData?.role?.name} />
      </div>

      {/* Right — navbar fixed top, content scrolls */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
