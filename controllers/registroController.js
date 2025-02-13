import supabase from '../config/supabaseClient.js';

export const guardarRegistro = async (req, res) => {
  const { fecha, tipo_formulario, conductor, placa_vehiculo, fecha_viaje, origen, sedes, valor_total, observacion } = req.body;

  try {
    const { data, error } = await supabase.from('transporte').insert([
      { 
        fecha, 
        tipo_formulario, 
        conductor, 
        placa_vehiculo, 
        fecha_viaje, 
        origen,      // Se espera un array (ej.: ["Parque", "Plaza"] o ["Cedi"])
        sedes,       // Se espera un array (ej.: ["Cedi"] o ["Llano", "Vegas"])
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

export const actualizarRegistro = async (req, res) => {
  const { id } = req.params;
  const { estado, observacion_anny } = req.body;

  try {
    const { data, error } = await supabase
      .from('transporte')
      .update({ estado, observacion_anny })
      .eq('id', id);

    if (error) {
      console.error("Error al actualizar en Supabase:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ message: 'Registro actualizado correctamente', data });
  } catch (err) {
    console.error("Error en actualizarRegistro:", err);
    res.status(500).json({ error: err.message });
  }
};
