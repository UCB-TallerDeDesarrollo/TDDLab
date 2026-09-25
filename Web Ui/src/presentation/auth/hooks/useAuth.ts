import { OAuthProvider } from "../../../modules/User-Authentication/domain/AuthManager";
import { useAuthStore } from "../store/useAuthStore";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const setError = useAuthStore((state) => state.setError);
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);

  const login = async (provider: OAuthProvider = OAuthProvider.Google) => {
    await loginStore(provider);
  };

  const logout = async () => {
    await logoutStore();
  };

  return {
    user,
    loading,
    error,
    setError,
    login,
    logout,
    isAuthenticated: Boolean(user),
  };
};

export default useAuth;
