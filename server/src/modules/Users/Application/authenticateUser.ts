import jwt from "jsonwebtoken";

export class AuthenticateUser {
  constructor(private jwtSecret: string) {}
  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (err) {
      throw new Error("Token inválido");
    }
  }
}