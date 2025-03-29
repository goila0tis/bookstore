import React from "react";
import { Navigate } from "react-router-dom";

const ProtectRoute = ({ isAdmin, children }) => {
  const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
  const isRoleAdmin = JSON.parse(localStorage.getItem("isAdmin"));
  if (!isAuthenticated) {
    alert("Please login to view this page");
    return <Navigate replace to="/login" />;
  }
  if (isAdmin && isRoleAdmin !== isAdmin) {
    alert("You do not have permission to view this page");
    return <Navigate replace to="/" />;
  }
  return children;
};

export default ProtectRoute;
