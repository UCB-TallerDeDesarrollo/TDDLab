import { useAuthStore } from "../../../modules/User-Authentication/domain/authStore";
import { HomeAuthData } from "../types/home.types";

export function useHomeAuthData(): HomeAuthData {
  const authData = useAuthStore((s) => s.authData);

  return {
    email: authData.userEmail,
    userId: authData.userid,
  };
}
