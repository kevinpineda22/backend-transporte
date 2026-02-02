import React, { useState, useRef, useEffect } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const MultiSelectConductor = ({ conductoresUnicos, filtroConductores, toggleConductorFiltro, removeConductorFiltro }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [wrapperRef]);

  return (
    <div className="filter-group" ref={wrapperRef} style={{ position: 'relative' }}> {/* IMPORTANTE: relative */}
      <label>Filtrar por Conductor</label>
      
      <div 
        className="dashboard-input" 
        style={{
          height: 'auto', 
          minHeight: '45px', 
          display: 'flex', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '5px', 
          cursor: 'pointer',
          background: menuOpen ? '#FFF' : '#F4F7FE'
        }}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {filtroConductores.length === 0 ? (
          <span style={{color: '#A3AED0', fontSize: '0.9rem'}}>Todos los conductores...</span>
        ) : (
          filtroConductores.map((c) => (
            <span key={c} style={{
              background: '#210d65', 
              color: 'white', 
              padding: '4px 8px', 
              borderRadius: '6px', 
              fontSize: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px',
              boxShadow: '0 2px 5px rgba(33, 13, 101, 0.2)'
            }}>
              {c.split(" ")[0]} {c.split(" ")[1] || ""} {/* Muestra solo Primer Nombre y Apellido para ahorrar espacio */}
              <XMarkIcon width={14} onClick={(e) => { e.stopPropagation(); removeConductorFiltro(c); }} style={{cursor: 'pointer', strokeWidth: 2}} />
            </span>
          ))
        )}
        <ChevronDownIcon width={16} style={{marginLeft: 'auto', color: '#210d65', strokeWidth: 2}} />
      </div>

      {menuOpen && (
        <div style={{
          position: 'absolute', 
          top: '105%', 
          left: 0, 
          right: 0, 
          background: 'white', 
          border: '1px solid #E0E5F2', 
          borderRadius: '10px', 
          maxHeight: '280px', 
          overflowY: 'auto', 
          zIndex: 1000, 
          boxShadow: '0 20px 50px rgba(112, 144, 176, 0.2)'
        }}>
          {conductoresUnicos.map((c) => (
            <div 
              key={c} 
              onClick={(e) => { e.stopPropagation(); toggleConductorFiltro(c); }} 
              style={{
                padding: '12px 15px', 
                cursor: 'pointer', 
                display: 'flex', 
                gap: '10px', 
                alignItems: 'center', 
                borderBottom: '1px solid #F4F7FE',
                backgroundColor: filtroConductores.includes(c) ? '#F4F7FE' : 'white',
                color: filtroConductores.includes(c) ? '#210d65' : '#1B2559',
                fontWeight: filtroConductores.includes(c) ? '600' : '400',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F7FE'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = filtroConductores.includes(c) ? '#F4F7FE' : 'white'}
            >
              <input 
                type="checkbox" 
                checked={filtroConductores.includes(c)} 
                readOnly 
                style={{accentColor: '#210d65', width: 16, height: 16, cursor: 'pointer'}} 
              /> 
              <span style={{fontSize: '0.9rem'}}>{c}</span>
            </div>
          ))}
          {conductoresUnicos.length === 0 && (
            <div style={{padding: '15px', color: '#A3AED0', textAlign: 'center', fontSize: '0.9rem'}}>
              No hay conductores registrados
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectConductor;