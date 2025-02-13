import express from 'express';
import { guardarRegistro, obtenerHistorial, actualizarRegistro } from '../controllers/registroController.js';

const router = express.Router();

router.post('/registro', guardarRegistro);
router.get('/historial', obtenerHistorial);
router.put('/registro/:id', actualizarRegistro);

export default router;
