import { create } from "zustand";
import { fireBaseAuthManager } from "../../../modules/User-Authentication/infraestructure/FirebaseAuthManager";
import AuthRepository from "../../../modules/User-Authentication/repository/LoginRepository";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import { UserDomain } from "../../../modules/User-Authentication/domain/User";
import { OAuthProvider } from "../../../modules/User-Authentication/domain/AuthManager";
import { LoggerFactory } from "../../../utils/Logs/infraestructure/LoggerFactory";
import { ILogger } from "../../../utils/Logs/domain/ILogger";

const authRepository = new AuthRepository();
const checkIfUserHasAccount = new CheckIfUserHasAccount(authRepository);

export interface AuthState {
  user: UserDomain | null;
  loading: boolean;
  error: string | null;

  initAuthListener: () => () => void;
  login: (provider?: OAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
}

const logger: ILogger = LoggerFactory.create("useAuthStore");

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,


  initAuthListener: () => {
    set({ loading: true });
    fireBaseAuthManager.handleRedirectResult();
    const unsubscribe = fireBaseAuthManager.onAuthStateChanged(async (domainUser) => {
      await fireBaseAuthManager.waitForAuthReady();
      if (!domainUser) {
        set({ user: null, loading: false });
        return;
      }
      try {
        const idToken = await fireBaseAuthManager.getIdToken(true);
        if (!idToken) {
          throw new Error("No se pudo obtener el ID Token.");
        }
        const userOnDb = await checkIfUserHasAccount.execute(idToken, OAuthProvider.Google);
        if (!userOnDb) {
          await fireBaseAuthManager.logout();
          set({
            user: null,
            loading: false,
            error: "Disculpa, tu usuario no está registrado. Por favor, regístrate primero.",
          });
          return;
        }
        const fullUser: UserDomain = {
          ...domainUser,
          id: userOnDb.id ? String(userOnDb.id) : domainUser.id,
          role: userOnDb.role,
          groupid: userOnDb.groupid,
        };
        set({ user: fullUser, loading: false, error: null });
      } catch (err: any) {
        logger.error(err?.message || "Error al validar la sesión.");
        await fireBaseAuthManager.logout();
        set({
          user: null,
          loading: false,
          error: err?.message || "Error al validar la sesión.",
        });
      }
    });

    return unsubscribe;
  },

  login: async (provider = OAuthProvider.Google) => {
    set({ loading: true, error: null });
    try {
      await fireBaseAuthManager.login(provider);
    } catch (err: any) {
      logger.error(err?.message || "Error al iniciar sesión.");
      set({
        loading: false,
        error: err?.message || "Error al iniciar sesión.",
      });
    }
  },

  logout: async () => {
    set({ loading: true });
    await fireBaseAuthManager.logout();
    set({ user: null, loading: false, error: null });
  },

  setError: (error) => set({ error }),
}));
