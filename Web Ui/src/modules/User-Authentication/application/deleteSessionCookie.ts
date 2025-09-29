import Cookies from "js-cookie";
import axios from "axios";
import { VITE_API } from "../../../../config";
const API_URL = VITE_API;

export const removeSessionCookie = async  () => {
  try {
    Cookies.remove("userSession");
    await axios.post(API_URL + "/user/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("Error removing session cookie:", error);
  }
};
