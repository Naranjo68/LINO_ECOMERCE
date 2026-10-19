import { Router } from 'express';
import { registroPost, loginPost, yoGet, logoutPost } from '../controllers/usuarioController.js';
const router = Router();
router.post('/registro', registroPost);
router.post('/login', loginPost);
router.get('/yo', yoGet);
router.post('/logout', logoutPost);
export default router;