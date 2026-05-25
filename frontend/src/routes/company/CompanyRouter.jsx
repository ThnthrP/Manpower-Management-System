import { useContext } from "react";
import { AppContent } from "../../context/AppContext";

// import CesRoutes from "./company/CesRoutes";
// import ExpertRoutes from "./company/ExpertRoutes";
// import { cesRoutes } from "./CesRoutes";
// import { expertRoutes } from "./ExpertRoutes";
import CesRouter from "../../pages/ces";
import ExpertRouter from "../../pages/expert";
import Yard2Router from "../../pages/yard2";

const CompanyRouter = () => {
  const { userData } = useContext(AppContent);

  if (!userData) return <div>Loading...</div>;

  const company = userData?.company?.name;

  if (company === "CES") return <CesRouter />;
  if (company === "EXPERTEAM") return <ExpertRouter />;
  if (company === "YARD2") return <Yard2Router />;

  return <div>No company assigned</div>;
};

export default CompanyRouter;
