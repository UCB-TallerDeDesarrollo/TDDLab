import jwt from "jsonwebtoken";
export const decodeUserTokenFromCookie =  async (
  token:string
) => { 
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
      groupid: number;
    };
  }