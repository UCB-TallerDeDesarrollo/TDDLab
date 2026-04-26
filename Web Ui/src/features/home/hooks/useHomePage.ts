import { useHomeAuthData } from "../services/homeAuth.service";
import { buildHomeViewModel } from "../services/home.service";
import { HomeViewModel } from "../types/home.types";

export function useHomePage(): HomeViewModel {
  const authData = useHomeAuthData();

  return buildHomeViewModel(authData);
}
