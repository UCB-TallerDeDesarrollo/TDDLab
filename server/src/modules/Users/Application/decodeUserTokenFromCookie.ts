import jwt from "jsonwebtoken";
export const decodeUserTokenFromCookie = (
  token: string
): { id: number; role: string; groupid: number } => { 
    const jwtSecret = process.env.JWT_SECRET || "supersecreto";
    return jwt.verify(token, jwtSecret) as {
      id: number;
      role: string;
      groupid: number;
    };
  }
