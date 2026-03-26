import jwt from "jsonwebtoken";
import { User } from "../Domain/User";
export const getUserToken =  async (
  user: User
) => { 
    const jwtSecret = process.env.JWT_SECRET || "supersecreto";
    return jwt.sign(
      { id: user.id, role: user.role, groupid: user.groupid },
      jwtSecret,
      { expiresIn: "30d" }
    );
}
