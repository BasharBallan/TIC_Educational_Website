import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allowedRoles }) {
  const { user } = useContext(AuthContext);

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user's role is not allowed, redirect to main page
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/main" replace />;
  }

  // If role is allowed, render the protected component
  return children;
}
