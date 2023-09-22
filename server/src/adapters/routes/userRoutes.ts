import express from 'express';
import { registerUser, loginUser } from '../controllers/userController';

const router = express.Router();

// Ruta de registro de usuario
router.post('/register', registerUser);
// Ruta de inicio de sesión
router.post('/login', loginUser);

export default router;
