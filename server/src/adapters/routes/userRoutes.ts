import express from 'express';
import { registerUser, loginUser, updateUser } from '../../controllers/userController';

const router = express.Router();

// Ruta de registro de usuario
router.post('/register', registerUser);
// Ruta de inicio de sesión
router.post('/login', loginUser);
//Ruta para actualizar contraseñas de un usuario
router.put('/update', updateUser);

export default router;

