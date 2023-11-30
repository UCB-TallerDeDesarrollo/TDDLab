import Cookies from "js-cookie";

export const setSessionCookie = (userData: any) => {
  try {
    Cookies.set("userSession", JSON.stringify(userData), { expires: 30 });
  } catch (error) {
    console.error("Error setting session cookie:", error);
  }
};
