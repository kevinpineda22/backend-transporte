
// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import registroRoutes from './routes/registroRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use('/api', registroRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});


app.get('/', (req, res) => {
  res.send('♥activo el terreneitor♥');
});
