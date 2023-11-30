import Cookies from "js-cookie";

export const setSessionCookie = (userData: any, role: string) => {
  try {
    const dataToStore = { userData, role };
    Cookies.set("userSession", JSON.stringify(dataToStore), { expires: 30 });
  } catch (error) {
    console.error("Error setting session cookie:", error);
  }
};
