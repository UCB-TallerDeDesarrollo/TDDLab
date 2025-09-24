import Cookies from "js-cookie";

export const removeSessionCookie = async  () => {
  try {
    Cookies.remove("userSession");
    await axios.post(API_URL + "/user/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("Error removing session cookie:", error);
  }
};
