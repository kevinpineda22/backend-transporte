// backend/controllers/dashboardController.js
import supabase from '../config/supabaseClient.js';

export const obtenerDatosDashboard = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  try {
    // 1. Consulta base: Traemos registros dentro del rango de fechas
    let query = supabase
      .from('transporte')
      .select('*')
      .order('fecha_viaje', { ascending: true });

    if (fechaInicio && fechaFin) {
      query = query.gte('fecha_viaje', fechaInicio).lte('fecha_viaje', fechaFin);
    }

    const { data: viajes, error } = await query;

    if (error) throw error;

    // 2. Traer lista de conductores activos para los filtros
    const { data: conductores, error: errorCond } = await supabase
      .from('conductores')
      .select('nombre_completo')
      .eq('activo', true)
      .order('nombre_completo', { ascending: true });

    if (errorCond) throw errorCond;

    // Enviamos la data cruda al frontend para que React haga la magia interactiva
    res.status(200).json({
      viajes,
      listaConductores: conductores.map(c => c.nombre_completo)
    });

  } catch (err) {
    console.error("Error en dashboard:", err);
    res.status(500).json({ error: err.message });
  }
};