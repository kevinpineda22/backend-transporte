// backend/routes/registroRoutes.js
import express from 'express';
import { guardarRegistro, obtenerHistorial, actualizarRegistro, obtenerResumen } from '../controllers/registroController.js';

const router = express.Router();

router.post('/registro', guardarRegistro);
router.get('/historial', obtenerHistorial);
router.put('/registro/:id', actualizarRegistro);
router.get('/resumen', obtenerResumen); // Nueva ruta para el dashboard

export default router;