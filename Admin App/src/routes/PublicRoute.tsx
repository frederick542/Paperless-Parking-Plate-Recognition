import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../utils/context/authContext";

const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
