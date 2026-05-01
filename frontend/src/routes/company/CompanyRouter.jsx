import { useContext } from "react";
import { AppContent } from "../../context/AppContext";

// import CesRoutes from "./company/CesRoutes";
// import ExpertRoutes from "./company/ExpertRoutes";
// import { cesRoutes } from "./CesRoutes";
// import { expertRoutes } from "./ExpertRoutes";
import CesRouter from "../../pages/ces";
import ExpertRouter from "../../pages/expert";

const CompanyRouter = () => {
  const { userData } = useContext(AppContent);

  if (!userData) return <div>Loading...</div>;

  const company = userData?.company?.name;

  // if (company === "CES") return cesRoutes();
  // if (company === "EXPERTEAM") return expertRoutes();
  if (company === "CES") return <CesRouter />;
  if (company === "EXPERTEAM") return <ExpertRouter />;

  return <div>No company assigned</div>;
};

export default CompanyRouter;
