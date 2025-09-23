import jwt from "jsonwebtoken";

export class AuthenticateUser {
  constructor(private jwtSecret: string) {}
  verifyToken(token: string) {
      return jwt.verify(token, this.jwtSecret);
  }
}