import Cookies from "js-cookie";

export const removeSessionCookie = () => {
  try {
    Cookies.remove("userSession");
  } catch (error) {
    console.error("Error removing session cookie:", error);
  }
};
