import { create } from "zustand";
import { User } from "firebase/auth";
import {
  AuthData,
  NULL_AUTH_DATA,
  UserRole,
  buildAuthDataFromFirebaseUser,
} from "./session.types";
import { getSessionCookie } from "../application/getSessionCookie";

interface AuthState {
  authData: AuthData;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (user: User, userCourse: { id: number; groupid: number; role: UserRole }) => void;
  clearSession: () => void;
  setUserGroupid: (groupid: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authData: NULL_AUTH_DATA,
  isHydrated: false,

  hydrate: async () => {
    const session = await getSessionCookie();
    if (session) {
      set({
        authData: {
          userid: session.id,
          userProfilePic: "",
          userEmail: session.email,
          usergroupid: session.groupid,
          userRole: session.role,
        },
        isHydrated: true,
      });
    } else {
      set({ authData: NULL_AUTH_DATA, isHydrated: true });
    }
  },

  setSession: (user, userCourse) => {
    set({ authData: buildAuthDataFromFirebaseUser(user, userCourse) });
  },

  clearSession: () => {
    set({ authData: NULL_AUTH_DATA });
  },

  setUserGroupid: (groupid) => {
    set((state) => ({ authData: { ...state.authData, usergroupid: groupid } }));
  },
}));
