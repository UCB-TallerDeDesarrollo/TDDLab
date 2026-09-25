
import { useAuthStore } from "../../auth/store/useAuthStore";
import { HomeAuthData } from "../types/home.types";

export function useHomeAuthData(): HomeAuthData {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  if (loading) {
    return {
      email: undefined,
      userId: undefined,
    };
  }

  return {
			email: user?.email ?? "",
			userId: Number(user?.id),
		};
}
