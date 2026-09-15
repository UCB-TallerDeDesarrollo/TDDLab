import { Response } from "express";
export const saveUserCookie =  async (
  token:string, res: Response
) => { 
  const isSecure = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";
  res.cookie("userSession", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  }
