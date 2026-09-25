import { Navigate } from "react-router-dom";
import React, { ReactNode } from "react";
import useAuth from "./presentation/auth/hooks/useAuth";


interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRouteComponent({ children }: Readonly<ProtectedRouteProps>) {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <React.Fragment>{children}</React.Fragment>;
}

export default ProtectedRouteComponent;
