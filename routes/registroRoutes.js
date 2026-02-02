// backend/routes/registroRoutes.js
import express from 'express';
import { 
    guardarRegistro, 
    obtenerHistorial, 
    actualizarRegistro, 
    eliminarRegistro, 
    obtenerResumen 
} from '../controllers/registroController.js';

// Importamos el nuevo controlador de conductores
import { 
    obtenerConductores, 
    crearConductor, 
    actualizarConductor, 
    eliminarConductor 
} from '../controllers/conductorController.js';

import { obtenerDatosDashboard } from '../controllers/dashboardController.js';

const router = express.Router();

// --- Rutas de Registros (Viajes) ---
router.post('/registro', guardarRegistro);
router.get('/historial', obtenerHistorial);
router.put('/registro/:id', actualizarRegistro);
router.delete('/registro/:id', eliminarRegistro);
router.get('/resumen', obtenerResumen);

// --- NUEVAS Rutas de Conductores ---
router.get('/conductores', obtenerConductores);       // Obtener lista
router.post('/conductores', crearConductor);          // Crear nuevo
router.put('/conductores/:id', actualizarConductor);  // Editar existente
router.delete('/conductores/:id', eliminarConductor); // Eliminar
router.get('/dashboard-data', obtenerDatosDashboard);

export default router;