import Cookies from "js-cookie";
import axios from "axios";
import { VITE_API } from "../../../../config.ts";
import { SessionCookieName } from "../domain/session.types";

const API_URL = VITE_API;

export const removeSessionCookie = async () => {
  try {
    Cookies.remove(SessionCookieName.UserSession);
    await axios.post(API_URL + "/user/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("Error removing session cookie:", error);
  }
};
