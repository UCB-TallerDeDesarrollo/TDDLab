import { useGlobalState } from "./modules/User-Authentication/domain/authStates";
import { Navigate } from "react-router-dom";
import React, { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRouteComponent({ children }: Readonly<ProtectedRouteProps>) {
  const authData = useGlobalState("authData")[0];

  if (authData.userEmail === "") {
    return <Navigate to="/login" replace />;
  }

  return <React.Fragment>{children}</React.Fragment>;
}

export default ProtectedRouteComponent;
