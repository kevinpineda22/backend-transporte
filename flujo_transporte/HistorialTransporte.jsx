import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  FaSearchPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaFileExcel,
  FaFilter,
  FaSync,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./HistorialTransporte.css";

const API_URL = "https://backend-transporte.vercel.app/api";

const HistorialTransporte = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    estado: "Pendiente",
    observacion_anny: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Filtros
  const [filters, setFilters] = useState({
    conductor: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "",
    placa_vehiculo: "",
    tipo_formulario: "",
  });

  const [listaConductores, setListaConductores] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/conductores`)
      .then((res) => setListaConductores(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [filters]);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const res = await axios.get(`${API_URL}/historial?${params.toString()}`);
      setRegistros(res.data);
    } catch (err) {
      console.error("Error cargando historial", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (row) => {
    setEditingId(row.id);
    setEditValues({
      estado: row.estado || "Pendiente",
      observacion_anny: row.observacion_anny || "",
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${API_URL}/registro/${id}`, editValues);
      setRegistros((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...editValues } : r)),
      );
      setEditingId(null);
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const handleDeleteClick = async (id) => {
    const res = await Swal.fire({
      title: "¿Eliminar registro?",
      text: "Se borrará del historial.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e63946",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, eliminar",
    });

    if (res.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/registro/${id}`);
        setRegistros((prev) => prev.filter((r) => r.id !== id));
        Swal.fire("Eliminado", "Registro eliminado correctamente.", "success");
      } catch (err) {
        Swal.fire("Error", "No se pudo eliminar el registro", "error");
      }
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(registros);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
    XLSX.writeFile(
      wb,
      `Reporte_Transporte_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const columns = [
    {
      name: "Fecha",
      selector: (r) => r.fecha?.slice(0, 10),
      sortable: true,
      width: "110px",
    },
    {
      name: "Conductor",
      selector: (r) => r.conductor,
      sortable: true,
      style: { flexGrow: 2, fontWeight: 600, color: "#2b3674" },
      headerStyle: { flexGrow: 2 },
    },
    {
      name: "Placa",
      selector: (r) => r.placa_vehiculo,
      width: "100px",
      style: { justifyContent: "center" },
      headerStyle: { justifyContent: "center" },
    },
    {
      name: "Tipo",
      selector: (r) => r.tipo_formulario,
      width: "130px",
      sortable: true,
    },
    {
      name: "Valor",
      selector: (r) =>
        new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(r.valor_total),
      width: "130px",
      style: { justifyContent: "flex-end", textAlign: "right" },
      headerStyle: { justifyContent: "flex-end" },
    },
    {
      name: "Estado",
      cell: (row) =>
        editingId === row.id ? (
          <select
            value={editValues.estado}
            onChange={(e) =>
              setEditValues({ ...editValues, estado: e.target.value })
            }
            className="ht-select-edit"
          >
            <option>Pendiente</option>
            <option>Completado</option>
            <option>Rechazado</option>
          </select>
        ) : (
          <span className={`ht-status-badge ${row.estado?.toLowerCase()}`}>
            {row.estado || "Pendiente"}
          </span>
        ),
      width: "140px",
      style: { justifyContent: "center" },
      headerStyle: { justifyContent: "center" },
    },
    {
      name: "Observación Admin",
      cell: (row) =>
        editingId === row.id ? (
          <input
            type="text"
            className="ht-input-edit"
            value={editValues.observacion_anny}
            onChange={(e) =>
              setEditValues({ ...editValues, observacion_anny: e.target.value })
            }
            placeholder="Escribe una observación..."
          />
        ) : (
          <span title={row.observacion_anny} className="ht-obs-text">
            {row.observacion_anny || "-"}
          </span>
        ),
      style: { flexGrow: 2 },
      headerStyle: { flexGrow: 2 },
    },
    {
      name: "Acciones",
      cell: (row) =>
        editingId === row.id ? (
          <div className="ht-actions">
            <button
              className="btn-icon save"
              onClick={() => handleSaveEdit(row.id)}
              title="Guardar"
            >
              <FaSave />
            </button>
            <button
              className="btn-icon cancel"
              onClick={() => setEditingId(null)}
              title="Cancelar"
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <div className="ht-actions">
            <button
              className="btn-icon edit"
              onClick={() => handleEditClick(row)}
              title="Editar"
            >
              <FaEdit />
            </button>
            <button
              className="btn-icon delete"
              onClick={() => handleDeleteClick(row.id)}
              title="Eliminar"
            >
              <FaTrash />
            </button>
          </div>
        ),
      width: "120px",
      style: { justifyContent: "center" },
      headerStyle: { justifyContent: "center" },
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#F4F7FE",
        borderBottom: "1px solid #E0E5F2",
        minHeight: "50px",
      },
    },
    headCells: {
      style: {
        color: "#8F9BBA",
        fontSize: "12px",
        fontWeight: "700",
        textTransform: "uppercase",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#2B3674",
        minHeight: "60px",
        "&:hover": { backgroundColor: "#F4F7FE" },
      },
    },
    pagination: { style: { borderTop: "1px solid #E0E5F2" } },
  };

  return (
    <div className="ht-container">
      <div className="ht-header">
        <h2 className="ht-title-text">Historial de Transporte</h2>
        <div className="ht-header-actions">
          <button
            className="ht-btn-filter"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FaFilter /> {isFilterOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
          <button className="ht-btn-export" onClick={handleExport}>
            <FaFileExcel /> Exportar Excel
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="ht-filter-panel">
          <div className="ht-filter-group">
            <label>Conductor</label>
            <select
              value={filters.conductor}
              onChange={(e) =>
                setFilters({ ...filters, conductor: e.target.value })
              }
            >
              <option value="">Todos los conductores</option>
              {listaConductores.map((c) => (
                <option key={c.id} value={c.nombre_completo}>
                  {c.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          <div className="ht-filter-group">
            <label>Placa Vehículo</label>
            <input
              type="text"
              placeholder="Ej: ABC-123"
              value={filters.placa_vehiculo}
              onChange={(e) =>
                setFilters({ ...filters, placa_vehiculo: e.target.value })
              }
            />
          </div>

          <div className="ht-filter-group">
            <label>Tipo Formulario</label>
            <select
              value={filters.tipo_formulario}
              onChange={(e) =>
                setFilters({ ...filters, tipo_formulario: e.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="Transporte">Transporte</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="ht-filter-group">
            <label>Estado</label>
            <select
              value={filters.estado}
              onChange={(e) =>
                setFilters({ ...filters, estado: e.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Completado">Completado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          <div className="ht-filter-group">
            <label>Desde</label>
            <input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) =>
                setFilters({ ...filters, fechaInicio: e.target.value })
              }
            />
          </div>

          <div className="ht-filter-group">
            <label>Hasta</label>
            <input
              type="date"
              value={filters.fechaFin}
              onChange={(e) =>
                setFilters({ ...filters, fechaFin: e.target.value })
              }
            />
          </div>

          <div className="ht-filter-actions">
            <button
              className="ht-btn-reset"
              onClick={() =>
                setFilters({
                  conductor: "",
                  fechaInicio: "",
                  fechaFin: "",
                  estado: "",
                  placa_vehiculo: "",
                  tipo_formulario: "",
                })
              }
            >
              <FaSync /> Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      <div className="ht-table-wrapper">
        <DataTable
          columns={columns}
          data={registros}
          pagination
          progressPending={loading}
          customStyles={customStyles}
          highlightOnHover
          noDataComponent={
            <div style={{ padding: 24 }}>No hay registros disponibles</div>
          }
        />
      </div>
    </div>
  );
};

export { HistorialTransporte };
