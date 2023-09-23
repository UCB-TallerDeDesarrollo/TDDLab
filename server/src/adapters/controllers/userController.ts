import { Request, Response } from 'express';
import {User} from '../../domain/models/User'

const users: User[] = [];

// Controlador para la ruta de registro de usuario
export const registerUser = (req: Request, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Debes proporcionar un nombre de usuario y una contraseña.' });
    return;
  }

  // Simula el almacenamiento de usuarios
  users.push({ username, password });

  res.status(201).json({ message: 'Usuario registrado con éxito.' });
};

// Controlador para la ruta de inicio de sesión
export const loginUser = (req: Request, res: Response): void => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username && user.password === password);

  if (!user) {
    res.status(401).json({ error: 'Credenciales incorrectas.' });
    return;
  }

  res.json({ message: 'Inicio de sesión exitoso.' });
};
