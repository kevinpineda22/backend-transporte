import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler 
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { FaFilter, FaSync, FaMoneyBillWave, FaExclamationCircle, FaChartLine, FaTruck } from "react-icons/fa";
import "./DashboardTransporte.css";
import MultiSelectConductor from "./MultiSelectConductor";

// Registro de componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const API_URL = "https://backend-transporte.vercel.app/api";

const DashboardTransporte = () => {
  // --- ESTADOS ---
  const [rawData, setRawData] = useState([]);
  const [conductoresList, setConductoresList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [rangoFecha, setRangoFecha] = useState({ 
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Primer día del mes actual
    fin: new Date().toISOString().split('T')[0] // Hoy
  });
  const [filtroConductor, setFiltroConductor] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // --- CARGA DE DATOS (Backend) ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Pedimos al backend data filtrada por fecha (lo más pesado)
      const params = new URLSearchParams({
        fechaInicio: rangoFecha.inicio,
        fechaFin: rangoFecha.fin
      });
      
      const res = await axios.get(`${API_URL}/dashboard-data?${params.toString()}`);
      setRawData(res.data.viajes || []);
      setConductoresList(res.data.listaConductores || []);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Carga inicial

  // --- LÓGICA DE PROCESAMIENTO (Frontend) ---
  // Filtramos la data cruda según los selectores de Conductor y Tipo
  const datosProcesados = useMemo(() => {
    return rawData.filter(item => {
      // Filtro Conductor
      if (filtroConductor.length > 0 && !filtroConductor.includes(item.conductor)) return false;
      // Filtro Tipo
      if (filtroTipo !== "todos" && item.tipo_formulario !== filtroTipo) return false;
      return true;
    });
  }, [rawData, filtroConductor, filtroTipo]);

  // --- CÁLCULO DE KPIs ---
  const kpis = useMemo(() => {
    const totalGasto = datosProcesados.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);
    const totalViajes = datosProcesados.length;
    const deudaPendiente = datosProcesados
      .filter(i => i.estado === "Pendiente")
      .reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);
    const promedioTicket = totalViajes > 0 ? totalGasto / totalViajes : 0;

    return { totalGasto, totalViajes, deudaPendiente, promedioTicket };
  }, [datosProcesados]);

  // --- PREPARACIÓN DE GRÁFICAS ---

  // 1. Tendencia de Gasto (Línea)
  const dataTendencia = useMemo(() => {
    const agrupado = {};
    datosProcesados.forEach(d => {
      const fecha = d.fecha_viaje ? d.fecha_viaje.split('T')[0] : 'N/A';
      agrupado[fecha] = (agrupado[fecha] || 0) + Number(d.valor_total);
    });
    
    const labels = Object.keys(agrupado).sort();
    const data = labels.map(l => agrupado[l]);

    return {
      labels,
      datasets: [{
        label: 'Gasto Diario',
        data,
        borderColor: '#210d65',
        backgroundColor: 'rgba(33, 13, 101, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3
      }]
    };
  }, [datosProcesados]);

  // 2. Top Conductores (Barras)
  const dataTopConductores = useMemo(() => {
    const map = {};
    datosProcesados.forEach(d => {
      const c = d.conductor || "Desconocido";
      map[c] = (map[c] || 0) + Number(d.valor_total);
    });
    // Top 5
    const sorted = Object.entries(map).sort(([,a], [,b]) => b - a).slice(0, 5);
    
    return {
      labels: sorted.map(([name]) => name.split(" ")[0] + " " + (name.split(" ")[1]?.charAt(0) || "") + "."),
      datasets: [{
        label: 'Facturación ($)',
        data: sorted.map(([, val]) => val),
        backgroundColor: '#210d65',
        borderRadius: 5
      }]
    };
  }, [datosProcesados]);

  // 3. Distribución Sedes (Barras Verticales - Lógica de Arrays)
  const dataSedes = useMemo(() => {
    const map = {};
    datosProcesados.forEach(d => {
      // Manejo robusto de sedes (puede ser array o string dependiendo de la BD)
      let sedesArray = [];
      if (Array.isArray(d.sedes)) sedesArray = d.sedes;
      else if (typeof d.sedes === 'string') sedesArray = d.sedes.replace(/{|}|"/g, '').split(','); // Limpiar formato PostgreSQL
      
      sedesArray.forEach(sede => {
        const s = sede.trim();
        if (s) map[s] = (map[s] || 0) + 1;
      });
    });

    const sorted = Object.entries(map).sort(([,a], [,b]) => b - a).slice(0, 8); // Top 8 sedes

    return {
      labels: sorted.map(([k]) => k),
      datasets: [{
        label: 'Visitas',
        data: sorted.map(([, v]) => v),
        backgroundColor: '#89DC00',
        borderRadius: 5
      }]
    };
  }, [datosProcesados]);

  // 4. Estado de Pago (Dona)
  const dataEstado = useMemo(() => {
    const map = { Pendiente: 0, Completado: 0, Rechazado: 0 };
    datosProcesados.forEach(d => {
      const estado = d.estado || "Pendiente";
      if (map[estado] !== undefined) map[estado]++;
    });

    return {
      labels: Object.keys(map),
      datasets: [{
        data: Object.values(map),
        backgroundColor: ['#FFB547', '#05CD99', '#EE5D50'],
        borderWidth: 0
      }]
    };
  }, [datosProcesados]);

  // --- CONFIG GRÁFICOS ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: "'DM Sans', sans-serif" }, usePointStyle: true } },
      tooltip: { backgroundColor: '#1B2559', titleFont: { family: "'DM Sans'" }, bodyFont: { family: "'DM Sans'" }, padding: 10, cornerRadius: 8 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "'DM Sans'" } } },
      y: { grid: { borderDash: [5, 5] }, ticks: { font: { family: "'DM Sans'" } } }
    }
  };

  // --- INTERFAZ ---
  return (
    <div className="dashboard-container">
      
      {/* 1. BARRA DE FILTROS */}
      <div className="dashboard-filters">
        <div className="filter-item" style={{flex: 2}}>
          <MultiSelectConductor 
            conductoresUnicos={conductoresList} 
            filtroConductores={filtroConductor}
            toggleConductorFiltro={(c) => setFiltroConductor(prev => prev.includes(c) ? prev.filter(i=>i!==c) : [...prev, c])}
            removeConductorFiltro={(c) => setFiltroConductor(prev => prev.filter(i=>i!==c))}
          />
        </div>
        
        <div className="filter-item">
          <label>Desde</label>
          <input type="date" className="dash-input" value={rangoFecha.inicio} onChange={e => setRangoFecha({...rangoFecha, inicio: e.target.value})} />
        </div>
        <div className="filter-item">
          <label>Hasta</label>
          <input type="date" className="dash-input" value={rangoFecha.fin} onChange={e => setRangoFecha({...rangoFecha, fin: e.target.value})} />
        </div>
        
        <div className="filter-item">
          <label>Servicio</label>
          <select className="dash-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="transporte">Transporte</option>
            <option value="canastas">Canastas</option>
          </select>
        </div>

        <button className="btn-filter-action btn-apply" onClick={fetchDashboardData}>
          <FaFilter /> Filtrar
        </button>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner-blue"></div> Cargando datos...
        </div>
      ) : (
        <>
          {/* 2. KPI CARDS */}
          <section className="kpi-section">
            <div className="kpi-card blue">
              <div className="kpi-icon-wrapper"><FaMoneyBillWave /></div>
              <span className="kpi-title">Gasto Total</span>
              <h3 className="kpi-value">
                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(kpis.totalGasto)}
              </h3>
              <span className="kpi-desc">En el periodo seleccionado</span>
            </div>

            <div className="kpi-card green">
              <div className="kpi-icon-wrapper"><FaChartLine /></div>
              <span className="kpi-title">Total Viajes</span>
              <h3 className="kpi-value">{kpis.totalViajes}</h3>
              <span className="kpi-desc">Servicios realizados</span>
            </div>

            <div className="kpi-card orange">
              <div className="kpi-icon-wrapper"><FaExclamationCircle /></div>
              <span className="kpi-title">Deuda Pendiente</span>
              <h3 className="kpi-value" style={{color: '#FFB547'}}>
                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(kpis.deudaPendiente)}
              </h3>
              <span className="kpi-desc">Viajes en estado "Pendiente"</span>
            </div>

            <div className="kpi-card red">
              <div className="kpi-icon-wrapper"><FaTruck /></div>
              <span className="kpi-title">Ticket Promedio</span>
              <h3 className="kpi-value" style={{color: '#1B2559'}}>
                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(kpis.promedioTicket)}
              </h3>
              <span className="kpi-desc">Costo medio por servicio</span>
            </div>
          </section>

          {/* 3. GRÁFICOS */}
          <section className="charts-section">
            
            {/* Tendencia Temporal */}
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3>Tendencia de Gasto Diario</h3>
                <p>Evolución del costo operativo día a día en el rango seleccionado.</p>
              </div>
              <div className="chart-body">
                <Line data={dataTendencia} options={chartOptions} />
              </div>
            </div>

            {/* Top Conductores */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Top 5 Conductores (Facturación)</h3>
                <p>Conductores con mayor volumen de cobro.</p>
              </div>
              <div className="chart-body">
                <Bar data={dataTopConductores} options={{...chartOptions, indexAxis: 'y'}} />
              </div>
            </div>

            {/* Distribución Sedes */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Sedes más Visitadas</h3>
                <p>Frecuencia de destinos/origen operativos.</p>
              </div>
              <div className="chart-body">
                <Bar data={dataSedes} options={chartOptions} />
              </div>
            </div>

            {/* Estado de Pagos */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Estado de los Pagos</h3>
                <p>Proporción de viajes pagados vs pendientes.</p>
              </div>
              <div className="chart-body" style={{padding: '0 40px'}}>
                <Doughnut data={dataEstado} options={{...chartOptions, cutout: '70%'}} />
              </div>
            </div>

          </section>
        </>
      )}
    </div>
  );
};

export { DashboardTransporte };