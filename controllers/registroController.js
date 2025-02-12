// backend/controllers/registroController.js
import supabase from '../config/supabaseClient.js';

export const guardarRegistro = async (req, res) => {
  const { fecha, tipo_formulario, conductor, placa_vehiculo, fecha_viaje, origen, sedes, valor_total, observacion } = req.body;

  try {
    const { data, error } = await supabase.from('transporte').insert([
      { fecha, tipo_formulario, conductor, placa_vehiculo, fecha_viaje, origen, sedes, valor_total, observacion }
    ]);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Registro guardado correctamente', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
