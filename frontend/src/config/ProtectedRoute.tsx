import React from "react";
import { Navigate } from "react-router-dom";

export const ProtectedUser = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem("token");
  const nasabahId = localStorage.getItem("nasabahId");

  return token && nasabahId ? children : <Navigate to="/auth/login" replace />;
};

export const ProtectedCS = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem("cs_token");
  return token ? children : <Navigate to="/cs/login" replace />;
};
