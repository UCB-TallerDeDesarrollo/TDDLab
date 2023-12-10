import Cookies from "js-cookie";

export const getSessionCookie = () => {
  try {
    const cookie = Cookies.get("userSession");
    const parsedCookie = cookie ? JSON.parse(cookie) : null;
    return parsedCookie;
  } catch (error) {
    console.error("Error retrieving session cookie:", error);
    return null;
  }
};
