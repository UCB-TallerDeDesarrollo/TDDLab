import { Response } from "express";
export const saveUserCookie =  async (
  token:string, res: Response
) => { 
  const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test";
  res.cookie("userSession", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  }
