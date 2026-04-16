import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { buildHomeViewModel } from "../services/home.service";
import { HomeViewModel } from "../types/home.types";

export function useHomePage(): HomeViewModel {
  const [authData] = useGlobalState("authData");

  return buildHomeViewModel(authData.userEmail);
}
