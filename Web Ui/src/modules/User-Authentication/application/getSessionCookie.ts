import axios from "axios";
import { VITE_API } from "../../../../config.ts";

const API_URL = VITE_API;
const SESSION_REQUEST_TIMEOUT_MS = 2000;

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number) =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Session request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });

export const getSessionCookie = () => {
  return withTimeout(
    axios.get(API_URL + "/user/me", {
      withCredentials: true,
    }),
    SESSION_REQUEST_TIMEOUT_MS,
  )
    .then((res) => {
      const userData = res.data;
      return userData;
    })
    .catch((error) => {
      console.error("Error retrieving session cookie:", error);
      return null;
    });
};
