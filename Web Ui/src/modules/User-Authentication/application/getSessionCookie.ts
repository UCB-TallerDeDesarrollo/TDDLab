import axios from "axios"; 
import {VITE_API} from "../../../../config.ts";

const API_URL = VITE_API;

export const getSessionCookie = () => {
  return axios
    .get(API_URL + "/user/me", {
      withCredentials: true, 
    })
    .then((res) => {
      const userData = res.data;
      return userData;
    })
    .catch((error) => {
      console.error("Error retrieving session cookie:", error);
      return null;
    });
};
