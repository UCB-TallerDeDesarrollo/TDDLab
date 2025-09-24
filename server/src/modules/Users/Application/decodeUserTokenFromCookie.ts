import jwt from "jsonwebtoken";
export const decodeUserTokenFromCookie = (
  token: string
): { id: number; role: string; groupid: number } => { 
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
      groupid: number;
    };
  }