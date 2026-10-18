import { Router } from 'express';
import { productosGet, productoGet } from '../controllers/productoController.js';
const router = Router();
router.get('/', productosGet);
router.get('/:id', productoGet);
export default router;
