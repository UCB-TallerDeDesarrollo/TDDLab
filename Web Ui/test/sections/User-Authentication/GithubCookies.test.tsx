import Cookies from "js-cookie";
import "@testing-library/jest-dom";
import { setSessionCookie } from "../../../src/modules/User-Authentication/application/setSessionCookie";
import { getSessionCookie } from "../../../src/modules/User-Authentication/application/getSessionCookie";
import { removeSessionCookie } from "../../../src/modules/User-Authentication/application/deleteSessionCookie";
import { cookieUserData } from "./__mocks__/cookieData";
import axios from "axios";
jest.mock("axios");
import {VITE_API} from "../../../config.ts";
const API_URL = VITE_API; 

jest.mock("js-cookie", () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

describe("setSessionCookie", () => {
  it("sets the session cookie successfully", () => {
    const role = "admin"
    const userData = { cookieUserData, role };
    setSessionCookie(userData);

    expect(Cookies.set).toHaveBeenCalledWith(
      "userSession",
      JSON.stringify(userData),
      { expires: 30 }
    );
  });

  it("logs an error if setting the session cookie fails", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    (Cookies.set as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    setSessionCookie({});

    expect(Cookies.set).toHaveBeenCalledWith(
      "userSession",
      JSON.stringify({},),
      { expires: 30 }
    );
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("Error setting session cookie:"),
      expect.any(Error)
    );
  });
});

describe("getSessionCookie", () => {
    it("retrieves the session cookie successfully", async () => {
    const userData = { cookieUserData };
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: userData });

    const result = await getSessionCookie();

    expect(axios.get).toHaveBeenCalledWith(API_URL + "/user/me", { withCredentials: true });
    expect(result).toEqual(userData);
  });

  it("returns null if the session cookie is not present", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: null });

    const result = await getSessionCookie();

    expect(axios.get).toHaveBeenCalledWith(API_URL + "/user/me", { withCredentials: true });
    expect(result).toBeNull();
  });

  it("logs an error if retrieving the session cookie fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

    const result = await getSessionCookie();

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Error retrieving session cookie:",
      expect.any(Error)
    );
  });
});

describe("removeSessionCookie", () => {
  it("removes the session cookie successfully", () => {
    removeSessionCookie();

    expect(Cookies.remove).toHaveBeenCalledWith("userSession");
  });

  it("logs an error if removing the session cookie fails", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    (Cookies.remove as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    removeSessionCookie();

    expect(Cookies.remove).toHaveBeenCalledWith("userSession");
    expect(console.error).toHaveBeenCalledTimes(3);

    expect(console.error).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("Error setting session cookie:"),
      expect.any(Error)
    );
    expect(console.error).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("Error retrieving session cookie:"),
      expect.any(Error)
    );
    expect(console.error).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("Error removing session cookie:"),
      expect.any(Error)
    );
  });
});
