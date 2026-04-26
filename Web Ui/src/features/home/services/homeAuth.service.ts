import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { HomeAuthData } from "../types/home.types";

export function useHomeAuthData(): HomeAuthData {
  const [authData] = useGlobalState("authData");

  return {
    email: authData.userEmail,
    userId: authData.userid,
  };
}
