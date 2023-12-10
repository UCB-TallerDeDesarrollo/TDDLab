import { Request, Response } from "express";
import { registerUser } from "../../modules/Users/Application/registerUser";
import { getUser } from "../../modules/Users/Application/getUser";

export const registerUserController = (req: Request, res: Response): void => {
  const { email, course, role } = req.body;

  if (!email || !course || !role) {
    res.status(400).json({
      error: "Debes proporcionar un correo, curso y rol validos",
    });
    return;
  }

  registerUser({ email: email, course: course, role: role });

  res.status(201).json({ message: "Usuario registrado con éxito." });
};
export const getUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      error: "Debes proporcionar un correo valido",
    });
    return;
  }

  let userData = await getUser(email);
  if (userData == null)
    res.status(404).json({ message: "Usuario no encontrado" });
  else res.status(200).json(userData);
};

export const verifyPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { password } = req.body;
    // Ecnrypt password next time
    if (password === "contra") {
      res.status(200).json({ success: true, message: "Password is correct." });
    } else {
      res.status(401).json({ success: false, message: "Wrong password." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};
