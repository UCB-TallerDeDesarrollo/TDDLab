import Cookies from "js-cookie";
import { SessionCookieName, SessionData } from "../domain/session.types";

export const setSessionCookie = (userData: SessionData) => {
  try {
    Cookies.set(SessionCookieName.UserSession, JSON.stringify(userData), { expires: 30 });
  } catch (error) {
    console.error("Error setting session cookie:", error);
  }
};
