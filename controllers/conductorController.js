// backend/controllers/conductorController.js
import supabase from '../config/supabaseClient.js';

// 1. Obtener todos los conductores activos (ordenados alfabéticamente)
export const obtenerConductores = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conductores')
      .select('*')
      .eq('activo', true) // Solo traemos los activos
      .order('nombre_completo', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error("Error obteniendo conductores:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Crear un nuevo conductor
export const crearConductor = async (req, res) => {
  const { nombre_completo, placa_vehiculo, cedula, cuenta_bancaria, tipo_cuenta } = req.body;

  try {
    const { data, error } = await supabase
      .from('conductores')
      .insert([
        { nombre_completo, placa_vehiculo, cedula, cuenta_bancaria, tipo_cuenta }
      ])
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Conductor creado correctamente', data: data[0] });
  } catch (err) {
    console.error("Error creando conductor:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. Actualizar datos de un conductor
export const actualizarConductor = async (req, res) => {
  const { id } = req.params;
  const { nombre_completo, placa_vehiculo, cedula, cuenta_bancaria, tipo_cuenta } = req.body;

  try {
    const { data, error } = await supabase
      .from('conductores')
      .update({ nombre_completo, placa_vehiculo, cedula, cuenta_bancaria, tipo_cuenta })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Conductor actualizado correctamente', data: data[0] });
  } catch (err) {
    console.error("Error actualizando conductor:", err);
    res.status(500).json({ error: err.message });
  }
};

// 4. Eliminar conductor (Soft Delete: Lo marcamos como inactivo para no perder historial)
export const eliminarConductor = async (req, res) => {
  const { id } = req.params;

  try {
    // En lugar de borrar la fila, ponemos activo = false
    const { data, error } = await supabase
      .from('conductores')
      .update({ activo: false }) 
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Conductor eliminado correctamente' });
  } catch (err) {
    console.error("Error eliminando conductor:", err);
    res.status(500).json({ error: err.message });
  }
};