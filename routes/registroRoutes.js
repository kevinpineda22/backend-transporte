import express from 'express';
import { guardarRegistro, obtenerHistorial, actualizarRegistro, eliminarRegistro, obtenerResumen } from '../controllers/registroController.js';

const router = express.Router();

router.post('/registro', guardarRegistro);
router.get('/historial', obtenerHistorial);
router.put('/registro/:id', actualizarRegistro);
router.delete('/registro/:id', eliminarRegistro);
router.get('/resumen', obtenerResumen);

export default router;