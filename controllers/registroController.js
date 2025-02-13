import supabase from '../config/supabaseClient.js';

// Función para guardar un registro en la tabla "transporte"
export const guardarRegistro = async (req, res) => {
  // Extraemos los campos enviados desde el frontend
  const { 
    fecha, 
    tipo_formulario, 
    conductor, 
    placa_vehiculo, 
    fecha_viaje, 
    origen, 
    sedes, 
    valor_total, 
    observacion 
  } = req.body;

  try {
    // Insertamos los datos en la tabla "transporte"
    const { data, error } = await supabase.from('transporte').insert([
      { 
        fecha, 
        tipo_formulario, 
        conductor, 
        placa_vehiculo, 
        fecha_viaje, 
        origen,      // Se espera un array (ej.: ["sede1", "sede3"] o ["Cedi"])
        sedes,       // Se espera un array (ej.: ["Cedi"] o ["sede2", "sede3"])
        valor_total, 
        observacion 
      }
    ]);

    if (error) {
      console.error("Error al insertar en Supabase:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ message: 'Registro guardado correctamente', data });
  } catch (err) {
    console.error("Error en el controlador:", err);
    res.status(500).json({ error: err.message });
  }
};

// Función para obtener el historial de registros
export const obtenerHistorial = async (req, res) => {
  try {
    const { data, error } = await supabase.from('transporte').select('*');
    if (error) {
      console.error("Error al obtener historial desde Supabase:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error("Error en el controlador:", err);
    res.status(500).json({ error: err.message });
  }
};
