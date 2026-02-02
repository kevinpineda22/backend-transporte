import React, { useState, useEffect } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Transporte.css"; 
import es from "date-fns/locale/es";
import { 
  FaCalendarAlt, 
  FaUserTie, 
  FaMapMarkedAlt, 
  FaMoneyCheckAlt, 
  FaCheckCircle 
} from "react-icons/fa";

registerLocale("es", es);

// Componente visual para el input de fecha
const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <button type="button" className="custom-date-btn" onClick={onClick} ref={ref}>
    <span>{value || placeholder}</span>
    <FaCalendarAlt color="#210d65" />
  </button>
));

const sedesOptions = [
  { id: "sede1", name: "Parque", value: 200000 },
  { id: "sede2", name: "Llano", value: 100000 },
  { id: "sede3", name: "Plaza", value: 200000 },
  { id: "sede4", name: "Vegas", value: 100000 },
  { id: "sede5", name: "Barbosa", value: 250000 },
  { id: "sede6", name: "San Juan", value: 100000 },
];

const API_URL = "https://backend-transporte.vercel.app/api/registro";
const API_CONDUCTORES = "https://backend-transporte.vercel.app/api/conductores";

const Transporte = () => {
  const [fecha, setFecha] = useState(new Date());
  const [tipoServicio, setTipoServicio] = useState("transporte");
  const [conductor, setConductor] = useState("");
  const [otroConductor, setOtroConductor] = useState("");
  
  const [placa, setPlaca] = useState("");
  const [cedula, setCedula] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [cuentaBancaria, setCuentaBancaria] = useState("");
  
  const [fechaViaje, setFechaViaje] = useState(new Date());
  const [observacion, setObservacion] = useState("");
  
  const [selectedOrigen, setSelectedOrigen] = useState([]);
  const [selectedSedes, setSelectedSedes] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [listaConductores, setListaConductores] = useState([]);

  useEffect(() => {
    fetch(API_CONDUCTORES).then(res => res.json()).then(data => setListaConductores(data)).catch(console.error);
  }, []);

  useEffect(() => {
    const seleccionado = listaConductores.find(c => c.nombre_completo === conductor);
    if (seleccionado) {
      setPlaca(seleccionado.placa_vehiculo || "");
      setCedula(seleccionado.cedula || "");
      setCuentaBancaria(seleccionado.cuenta_bancaria || "");
      setTipoCuenta(seleccionado.tipo_cuenta || "");
    } else if (conductor !== "otro") {
      setPlaca(""); setCedula(""); setCuentaBancaria(""); setTipoCuenta("");
    }
  }, [conductor, listaConductores]);

  const handleSelection = (id, tipo) => {
    const setter = tipo === "origen" ? setSelectedOrigen : setSelectedSedes;
    const current = tipo === "origen" ? selectedOrigen : selectedSedes;
    
    if (current.includes(id)) {
      setter(current.filter(item => item !== id));
    } else {
      setter([...current, id]);
    }
  };

  const calcularTotal = () => {
    if (tipoServicio === "canastas") {
      return selectedOrigen.length > 0 ? 100000 : 0;
    } else {
      return selectedSedes.reduce((acc, id) => {
        const sede = sedesOptions.find(s => s.id === id);
        return sede ? acc + sede.value : acc;
      }, 0);
    }
  };

  const totalValor = calcularTotal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      fecha: fecha.toISOString().split("T")[0],
      tipo_formulario: tipoServicio,
      conductor: conductor === "otro" ? otroConductor : conductor,
      placa_vehiculo: placa,
      cedula,
      cuenta_bancaria,
      tipo_cuenta: tipoCuenta,
      fecha_viaje: fechaViaje ? fechaViaje.toISOString().split("T")[0] : null,
      origen: tipoServicio === "canastas" ? selectedOrigen : ["CEDI"],
      sedes: tipoServicio === "transporte" ? selectedSedes : ["CEDI"],
      valor_total: totalValor,
      observacion
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage({ type: "success", text: "¡Viaje registrado exitosamente!" });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: "error", text: "Hubo un problema al guardar el registro." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión con el servidor." });
    }
    setLoading(false);
  };

  return (
    <div className="transporte-container">
      {/* NOTA: Se eliminó el header interno para evitar redundancia con AdminTransporte.jsx.
         Ahora el formulario se integra perfectamente en el layout.
      */}

      <form onSubmit={handleSubmit} className="form-grid-layout">
        
        {/* COLUMNA IZQUIERDA: DETALLES */}
        <div className="form-left-column">
          
          {/* TARJETA 1: SERVICIO */}
          <div className="form-section-card">
            <div className="section-header">
              <div className="section-icon"><FaMapMarkedAlt /></div>
              <h3>Detalles del Servicio</h3>
            </div>
            
            <div className="form-row">
              <div className="input-group">
                <label>Fecha de Registro</label>
                <ReactDatePicker selected={fecha} onChange={date => setFecha(date)} customInput={<CustomDateInput />} disabled locale="es" />
              </div>
              <div className="input-group">
                <label>Tipo de Servicio</label>
                <select className="tp-select" value={tipoServicio} onChange={e => {setTipoServicio(e.target.value); setSelectedOrigen([]); setSelectedSedes([]);}}>
                  <option value="transporte">Transporte de Mercancía</option>
                  <option value="canastas">Retorno de Canastas</option>
                </select>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label>Fecha Real del Viaje</label>
              <ReactDatePicker selected={fechaViaje} onChange={date => setFechaViaje(date)} customInput={<CustomDateInput />} locale="es" />
            </div>

            <div className="input-group">
              <label>{tipoServicio === "canastas" ? "Sedes de Origen (Recogida)" : "Sedes de Destino (Entrega)"}</label>
              <div className="selection-grid">
                {sedesOptions.map(sede => (
                  <div 
                    key={sede.id} 
                    className={`option-card ${
                      (tipoServicio === "canastas" ? selectedOrigen : selectedSedes).includes(sede.id) ? "selected" : ""
                    }`}
                    onClick={() => handleSelection(sede.id, tipoServicio === "canastas" ? "origen" : "sede")}
                  >
                    <span className="option-name">{sede.name}</span>
                    {tipoServicio === "transporte" && (
                      <span className="option-price">
                        ${(sede.value / 1000)}k
                      </span>
                    )}
                    {(tipoServicio === "canastas" ? selectedOrigen : selectedSedes).includes(sede.id) && (
                      <FaCheckCircle style={{position: 'absolute', top: 10, right: 10, color: '#210d65'}} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TARJETA 2: CONDUCTOR */}
          <div className="form-section-card">
            <div className="section-header">
              <div className="section-icon"><FaUserTie /></div>
              <h3>Información del Conductor</h3>
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label>Seleccionar Conductor</label>
              <select className="tp-select" value={conductor} onChange={e => setConductor(e.target.value)} required>
                <option value="">-- Seleccione --</option>
                {listaConductores.map(c => (
                  <option key={c.id} value={c.nombre_completo}>{c.nombre_completo}</option>
                ))}
                <option value="otro">Conductor Externo / Nuevo</option>
              </select>
            </div>

            {conductor === "otro" && (
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label>Nombre Completo</label>
                <input className="tp-input" placeholder="Ingrese nombre" value={otroConductor} onChange={e => setOtroConductor(e.target.value)} required />
              </div>
            )}

            <div className="form-row">
              <div className="input-group">
                <label>Placa Vehículo</label>
                <input className="tp-input" value={placa} onChange={e => setPlaca(e.target.value)} readOnly={conductor !== "otro"} required />
              </div>
              <div className="input-group">
                <label>Cédula</label>
                <input type="number" className="tp-input" value={cedula} onChange={e => setCedula(e.target.value)} readOnly={conductor !== "otro"} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Banco / Tipo Cuenta</label>
                {conductor === "otro" ? (
                  <select className="tp-select" value={tipoCuenta} onChange={e => setTipoCuenta(e.target.value)}>
                    <option value="">Seleccione...</option><option>Ahorros</option><option>Nequi</option><option>Corriente</option>
                  </select>
                ) : (
                  <textarea 
                    className="tp-input-read" 
                    value={tipoCuenta} 
                    readOnly 
                    rows={2} 
                  />
                )}
              </div>
              <div className="input-group">
                <label>Nro. Cuenta</label>
                <input className="tp-input" value={cuentaBancaria} onChange={e => setCuentaBancaria(e.target.value)} readOnly={conductor !== "otro"} />
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: RESUMEN Y ACCIÓN */}
        <div className="form-right-column">
          <div className="summary-box">
            <div className="section-header" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>
              <FaMoneyCheckAlt style={{ fontSize: '1.5rem', color: '#89DC00' }} />
              <h3 style={{ color: 'white' }}>Resumen de Pago</h3>
            </div>

            <span className="total-label">Total a Pagar</span>
            <h2 className="total-amount">
              {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(totalValor)}
            </h2>

            <div className="divider"></div>

            <div className="input-group" style={{ textAlign: 'left', marginBottom: 20 }}>
              <label style={{ color: 'rgba(255,255,255,0.8)' }}>Observaciones</label>
              <textarea 
                className="tp-textarea" 
                rows={4} 
                value={observacion} 
                onChange={e => setObservacion(e.target.value)} 
                placeholder="Novedades del viaje..."
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
              />
            </div>

            <button type="submit" disabled={loading} className="tp-submit-btn">
              {loading ? 'Guardando...' : 'Registrar Viaje'}
            </button>

            {message && (
              <div className={`status-message ${message.type}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};

export { Transporte };