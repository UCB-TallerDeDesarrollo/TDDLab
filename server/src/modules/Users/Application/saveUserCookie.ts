import { Response } from "express";
import Environment from "../../../config/environment"

export const saveUserCookie =  async (
  token:string, res: Response
) => {
  const isSecure = Environment.nodeEnv === "production" || Environment.nodeEnv === "test";
  res.cookie("userSession", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  }
