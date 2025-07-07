import supabase from '../config/supabaseClient.js';

export const guardarRegistro = async (req, res) => {
  const { fecha, tipo_formulario, conductor, placa_vehiculo, cedula, tipo_cuenta, cuenta_bancaria, fecha_viaje, origen, sedes, valor_total, observacion } = req.body;

  try {
    const { data, error } = await supabase.from('transporte').insert([
      { 
        fecha, 
        tipo_formulario, 
        conductor,
        placa_vehiculo, 
        cedula,
        tipo_cuenta, 
        cuenta_bancaria,
        fecha_viaje, 
        origen,      
        sedes,       
        valor_total, 
        observacion 
      }
    ]).select();

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
    const { fechaInicio, fechaFin } = req.query;

    let query = supabase.from('transporte').select('*').order('id', { ascending: true });

    if (fechaInicio) {
      query = query.gte('fecha_viaje', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha_viaje', fechaFin);
    }

    const { data, error } = await query;

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
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error al actualizar en Supabase:", error);
      return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.status(200).json({ message: 'Registro actualizado correctamente', data: data[0] });
  } catch (err) {
    console.error("Error en actualizarRegistro:", err);
    res.status(500).json({ error: err.message });
  }
};

export const eliminarRegistro = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('transporte')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error al eliminar en Supabase:", error);
      return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.status(200).json({ message: 'Registro eliminado correctamente' });
  } catch (err) {
    console.error("Error en eliminarRegistro:", err);
    res.status(500).json({ error: err.message });
  }
};

export const obtenerResumen = async (req, res) => {
  try {
    const { data: registros, error } = await supabase
      .from('transporte')
      .select('estado, valor_total, conductor');

    if (error) {
      console.error("Error al obtener resumen desde Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    const totalRegistros = registros.length;
    const totalValor = registros.reduce((sum, reg) => sum + (reg.valor_total || 0), 0);
    const estados = registros.reduce((acc, reg) => {
      const estado = reg.estado || 'Pendiente';
      acc[estado] = (acc[estado] || 0) + 1; // Corregido: 'hypergigante' cambiado a 'estado'
      return acc;
    }, {});
    const viajesPorConductor = registros.reduce((acc, reg) => {
      acc[reg.conductor] = (acc[reg.conductor] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      totalRegistros,
      totalValor,
      estados,
      viajesPorConductor,
    });
  } catch (err) {
    console.error("Error en obtenerResumen:", err);
    res.status(500).json({ error: err.message });
  }
};