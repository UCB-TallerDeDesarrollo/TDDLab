import { Request, Response } from "express";
import { registerUser } from "../../modules/Users/Application/registerUser";

export const registerUserController = (req: Request, res: Response): void => {
  const { email, course } = req.body;

  if (!email || !course) {
    res.status(400).json({
      error: "Debes proporcionar un corre y curso valido",
    });
    return;
  }

  registerUser({ email: email, course: course });

  res.status(201).json({ message: "Usuario registrado con éxito." });
};
