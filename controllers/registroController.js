import supabase from '../config/supabaseClient.js';

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
    const { data, error } = await supabase
      .from('transporte')
      .insert([
        { 
          fecha, 
          tipo_formulario, 
          conductor, 
          placa_vehiculo, 
          fecha_viaje, 
          origen,      // Se espera un array (ejemplo: ["sede1", "sede3"] o ["Cedi"])
          sedes,       // Se espera un array (ejemplo: ["Cedi"] o ["sede2", "sede3"])
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
