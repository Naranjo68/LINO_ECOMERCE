import { Router } from 'express';
import { pedidoPost } from '../controllers/pedidoController.js';
const router = Router();
router.post('/', pedidoPost);
export default router;
