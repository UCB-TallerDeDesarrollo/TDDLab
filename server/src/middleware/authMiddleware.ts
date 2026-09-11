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
    return;
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
}

export function authorizeRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "No tienes permisos para acceder a esta ruta" });
    }
    next();
    return;
  };
}
