
// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import registroRoutes from './routes/registroRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configurar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: '*',  // Permite todas las solicitudes de cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],  // Cabeceras permitidas
}));

app.use(express.json());
app.use('/api', registroRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});


app.get('/', (req, res) => {
  res.send('♥activo el terreneitor♥');
});
