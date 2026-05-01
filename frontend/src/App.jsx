import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppContent } from "./context/AppContext";
import { sharedRoutes } from "./routes/shared/SharedRoutes";
import CompanyRouter from "./routes/company/CompanyRouter";

const App = () => {
  const { isLoggedin, loading, userData } = useContext(AppContent);

  useEffect(() => {
    console.log("userData:", userData);
    console.log("isLoggedin:", isLoggedin);
    console.log("role:", userData?.role);
    console.log("loading:", loading);
  }, [userData, isLoggedin, loading]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <ToastContainer />

      <Routes>
        {/* root */}
        {/* <Route
          path="/"
          element={
            isLoggedin ? (
              !userData ? (
                <div>Loading...</div>
              ) : userData.role?.name === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/profile" />
              )
            ) : (
              <Navigate to="/company-select" />
            )
          }
        /> */}
        <Route
          path="/"
          element={
            isLoggedin ? (
              !userData ? (
                <div>Loading...</div>
              ) : (
                <Navigate to="/admin" /> // ทุก role ไป admin
              )
            ) : (
              <Navigate to="/company-select" />
            )
          }
        />

        {/* shared */}
        {sharedRoutes()}

        <Route path="/admin/*" element={<CompanyRouter />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
