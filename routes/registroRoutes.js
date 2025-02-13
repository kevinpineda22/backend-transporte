
// backend/routes/registroRoutes.js
import express from 'express';
import { guardarRegistro, obtenerHistorial } from '../controllers/registroController.js';

const router = express.Router();
router.post('/registro', guardarRegistro);
router.get('/historial', obtenerHistorial);

export default router;

