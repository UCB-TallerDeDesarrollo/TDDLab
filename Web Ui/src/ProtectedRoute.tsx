import { useGlobalState } from "./modules/Auth/domain/authStates";
import { useNavigate } from "react-router-dom";
import React, { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRouteComponent({ children }: ProtectedRouteProps) {
  const authData = useGlobalState("authData")[0];
  const navigate = useNavigate();
  useEffect(() => {
    if (authData.userEmail == "" && authData.userEmail != null) {
      navigate("/login");
    }
  }, [authData]);

  return <React.Fragment>{children}</React.Fragment>;
}

export default ProtectedRouteComponent;