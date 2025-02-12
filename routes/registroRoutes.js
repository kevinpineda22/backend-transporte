
// backend/routes/registroRoutes.js
import express from 'express';
import { guardarRegistro } from '../controllers/registroController.js';

const router = express.Router();
router.post('/registro', guardarRegistro);

export default router;

