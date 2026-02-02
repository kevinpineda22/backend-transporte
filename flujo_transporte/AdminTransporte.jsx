import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTruck, 
  FaHistory, 
  FaUserFriends, 
  FaChartPie,
  FaArrowLeft,
  FaFileInvoiceDollar // Nuevo icono para el formulario
} from "react-icons/fa";
import { Link } from "react-router-dom"; 

// Estilos
import "./AdminTransporte.css";

// Componentes Vistas
import { Transporte } from "./Transporte"; 
import { HistorialTransporte } from "./HistorialTransporte";
import GestionConductores from "./GestionConductores";
import { DashboardTransporte } from "./DSH-transporte/DashboardTransporte";

const VIEWS = {
  DASHBOARD: 'dashboard',
  FORMULARIO: 'formulario',
  HISTORIAL: 'historial',
  CONDUCTORES: 'conductores'
};

// Configuración centralizada de Títulos e Iconos
const PAGE_CONFIG = {
  [VIEWS.DASHBOARD]: { 
    title: 'Dashboard Operativo', 
    icon: FaChartPie 
  },
  [VIEWS.FORMULARIO]: { 
    title: 'Nuevo Registro de Viaje', 
    icon: FaFileInvoiceDollar 
  },
  [VIEWS.HISTORIAL]: { 
    title: 'Historial de Transportes', 
    icon: FaHistory 
  },
  [VIEWS.CONDUCTORES]: { 
    title: 'Gestión de Conductores', 
    icon: FaUserFriends 
  }
};

const AdminTransporte = () => {
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case VIEWS.DASHBOARD: return <DashboardTransporte />;
      case VIEWS.FORMULARIO: return <Transporte />;
      case VIEWS.HISTORIAL: return <HistorialTransporte />;
      case VIEWS.CONDUCTORES: return <GestionConductores />;
      default: return <DashboardTransporte />;
    }
  };

  const BotonSidebar = ({ id, texto }) => {
    const config = PAGE_CONFIG[id];
    const Icono = config.icon;
    const isActive = currentView === id;
    
    return (
      <button 
        className={`atp-nav-item ${isActive ? "active" : ""}`} 
        onClick={() => setCurrentView(id)}
      >
        <Icono size={20} />
        <span>{texto}</span>
      </button>
    );
  };

  // Obtenemos configuración actual para el Header
  const currentPage = PAGE_CONFIG[currentView];

  return (
    <div className="atp-layout">
      {/* Sidebar */}
      <aside className="atp-sidebar">
        <div className="atp-sidebar-header">
          <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', alignSelf: 'flex-start', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, paddingLeft: 5 }}>
             <FaArrowLeft /> Volver
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: '50%', backdropFilter: 'blur(5px)' }}>
              <FaTruck size={28} color="#89DC00" />
            </div>
            <h2 className="atp-logo-text" style={{margin:0, color: 'white', fontSize: '1.3rem'}}>Transporte</h2>
          </div>
        </div>

        <nav className="atp-nav">
          <BotonSidebar id={VIEWS.DASHBOARD} texto="Dashboard" />
          <BotonSidebar id={VIEWS.FORMULARIO} texto="Nuevo Viaje" />
          <BotonSidebar id={VIEWS.HISTORIAL} texto="Historial" />
          <BotonSidebar id={VIEWS.CONDUCTORES} texto="Conductores" />
        </nav>

        <div className="atp-sidebar-footer">
          <p style={{margin:0, fontWeight:600, color:'white'}}>Panel Administrativo</p>
          <p style={{margin:0, opacity: 0.6, fontSize: '0.75rem'}}>Merkahorro © 2026</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="atp-main">
        {/* Header Dinámico sin botón salir */}
        <header className="atp-header">
          <h1 className="atp-page-title" style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            {/* Renderizamos el icono dinámicamente aquí */}
            <currentPage.icon style={{ color: '#210d65', opacity: 0.8 }} />
            {currentPage.title}
          </h1>
        </header>

        <div className="atp-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="atp-fade-wrapper"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminTransporte;