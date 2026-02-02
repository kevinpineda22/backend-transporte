import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaCar,
  FaUniversity,
} from "react-icons/fa";
import "./GestionConductores.css";

const API_URL = "https://backend-transporte.vercel.app/api";

const GestionConductores = () => {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre_completo: "",
    placa_vehiculo: "",
    cedula: "",
    cuenta_bancaria: "",
    tipo_cuenta: "Ahorros",
  });

  const fetchConductores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/conductores`);
      if (!response.ok) throw new Error("Error de red");
      const data = await response.json();
      setConductores(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConductores();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openNewModal = () => {
    setFormData({
      id: null,
      nombre_completo: "",
      placa_vehiculo: "",
      cedula: "",
      cuenta_bancaria: "",
      tipo_cuenta: "Ahorros",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (conductor) => {
    setFormData(conductor);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_completo || !formData.placa_vehiculo) {
      return Swal.fire(
        "Campos requeridos",
        "Nombre y Placa son obligatorios",
        "warning",
      );
    }
    const endpoint = isEditing
      ? `${API_URL}/conductores/${formData.id}`
      : `${API_URL}/conductores`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: isEditing ? "Actualizado" : "Creado",
          timer: 1500,
          showConfirmButton: false,
        });
        setShowModal(false);
        fetchConductores();
      }
    } catch (error) {
      Swal.fire("Error", "Error al guardar", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar Conductor?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Eliminar",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/conductores/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          Swal.fire("Eliminado", "El conductor ha sido eliminado.", "success");
          fetchConductores();
        }
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar", "error");
      }
    }
  };

  const filteredItems = conductores.filter(
    (item) =>
      item.nombre_completo &&
      item.nombre_completo.toLowerCase().includes(filterText.toLowerCase()),
  );

  const columns = [
    {
      name: "Conductor",
      selector: (row) => row.nombre_completo,
      sortable: true,
      wrap: true,
      style: { flexGrow: 2 },
      headerStyle: { flexGrow: 2 },
      cell: (row) => (
        <div
          style={{ fontWeight: "700", color: "#2B3674", fontSize: "0.95rem" }}
        >
          {row.nombre_completo}
        </div>
      ),
    },
    {
      name: "Placa",
      selector: (row) => row.placa_vehiculo,
      width: "140px",
      style: { justifyContent: "center" },
      headerStyle: { justifyContent: "center" },
      cell: (row) => (
        <div className="atp-badge-plate">
          <FaCar /> {row.placa_vehiculo}
        </div>
      ),
    },
    {
      name: "Cédula",
      selector: (row) => row.cedula,
      width: "120px",
      style: { color: "#A3AED0", fontWeight: "600" },
    },
    {
      name: "Información Bancaria",
      wrap: true,
      style: { flexGrow: 3 },
      headerStyle: { flexGrow: 3 },
      cell: (row) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            padding: "8px 0",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              color: "#A3AED0",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaUniversity style={{ color: "#05CD99" }} />
            <span style={{ fontWeight: "600", textTransform: "uppercase" }}>
              {row.tipo_cuenta}
            </span>
          </div>
          <div
            style={{ fontSize: "0.9rem", color: "#2B3674", fontWeight: "600" }}
          >
            {row.cuenta_bancaria || "Sin cuenta registrada"}
          </div>
        </div>
      ),
    },
    {
      name: "Acciones",
      width: "120px",
      style: { justifyContent: "center" },
      headerStyle: { justifyContent: "center" },
      cell: (row) => (
        <div className="atp-action-group">
          <button
            className="atp-action-icon atp-edit"
            onClick={() => openEditModal(row)}
            title="Editar Conductor"
          >
            <FaEdit />
          </button>
          <button
            className="atp-action-icon atp-delete"
            onClick={() => handleDelete(row.id)}
            title="Eliminar Conductor"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#F4F7FE",
        borderBottom: "none",
        minHeight: "56px",
        borderRadius: "12px 12px 0 0",
      },
    },
    headCells: {
      style: {
        color: "#8F9BBA",
        fontSize: "0.85rem",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        paddingLeft: "24px",
      },
    },
    rows: {
      style: {
        minHeight: "80px", // Más altura para evitar que se vea apretado
        borderBottom: "1px solid #EBEFF8",
        fontSize: "0.95rem",
        "&:hover": {
          backgroundColor: "#F8F9FA",
          transition: "all 0.2s",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "24px",
        paddingRight: "24px",
      },
    },
    pagination: {
      style: {
        borderTop: "none",
        padding: "16px",
      },
    },
  };

  return (
    <div className="atp-card">
      {" "}
      {/* Envuelta en Tarjeta Corporativa */}
      <div className="atp-drivers-header">
        <input
          type="text"
          placeholder="Buscar conductor..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="atp-input-search"
        />
        <button className="atp-btn-primary" onClick={openNewModal}>
          <FaUserPlus /> Nuevo Conductor
        </button>
      </div>
      <div className="atp-table-wrapper">
        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          progressPending={loading}
          customStyles={customStyles}
          highlightOnHover
        />
      </div>
      {showModal && (
        <div className="atp-modal-overlay">
          <div className="atp-modal-content">
            <div className="atp-modal-header">
              <h3>{isEditing ? "Editar Conductor" : "Nuevo Conductor"}</h3>
              <button
                className="atp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="atp-modal-form">
              <div className="atp-form-group">
                <label>Nombre Completo</label>
                <input
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 15 }}>
                <div className="atp-form-group" style={{ flex: 1 }}>
                  <label>Placa</label>
                  <input
                    name="placa_vehiculo"
                    value={formData.placa_vehiculo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        placa_vehiculo: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>
                <div className="atp-form-group" style={{ flex: 1 }}>
                  <label>Cédula</label>
                  <input
                    type="number"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 15 }}>
                <div className="atp-form-group" style={{ flex: 1 }}>
                  <label>Tipo Cuenta</label>
                  <select
                    name="tipo_cuenta"
                    value={formData.tipo_cuenta}
                    onChange={handleInputChange}
                  >
                    <option>Ahorros</option>
                    <option>Corriente</option>
                    <option>Nequi</option>
                    <option>Daviplata</option>
                  </select>
                </div>
                <div className="atp-form-group" style={{ flex: 1 }}>
                  <label>Número Cuenta</label>
                  <input
                    name="cuenta_bancaria"
                    value={formData.cuenta_bancaria}
                    onChange={handleInputChange}
                    placeholder="Ej: 123456789 (a nombre de Juan Pérez)"
                  />
                  <small style={{ color: "#A3AED0", fontSize: "0.75rem" }}>
                    Puede incluir el nombre del titular entre paréntesis si es
                    diferente.
                  </small>
                </div>
              </div>
              <div className="atp-modal-footer">
                <button
                  type="button"
                  className="atp-btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="atp-btn-primary">
                  Guardar Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionConductores;
