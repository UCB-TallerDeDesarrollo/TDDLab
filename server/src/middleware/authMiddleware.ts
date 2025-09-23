import { Request, Response, NextFunction } from "express";
import { AuthenticateUser } from "../modules/Users/Application/authenticateUser";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";
const authUser = new AuthenticateUser(JWT_SECRET);

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.userSession;
  if (!token) {
    return res.status(401).json({ message: "No autorizado: falta token" });
  }
  try {
    const decoded = authUser.verifyToken(token);
    (req as any).user = decoded;
    next();
    return res.status(200);
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
}
