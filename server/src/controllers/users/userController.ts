import { Request, Response } from "express";
import { registerUser } from "../../modules/Users/Application/registerUser";
import { getUser } from "../../modules/Users/Application/getUser";

export const registerUserController = (req: Request, res: Response): void => {
  const { email, course } = req.body;

  if (!email || !course) {
    res.status(400).json({
      error: "Debes proporcionar un correo y curso valido",
    });
    return;
  }

  registerUser({ email: email, course: course });

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
