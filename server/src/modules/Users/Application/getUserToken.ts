import jwt from "jsonwebtoken";
import { User } from "../Domain/User";
export const getUserToken = (
  user: User
) => { 
    return jwt.sign(
      { id: user.id, role: user.role, groupid: user.groupid },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );
}