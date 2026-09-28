"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, BookOpen, Settings, Gavel, LogOut, ChevronRight, LogIn, Package } from "lucide-react";
import "./mas.css";

export default function MasPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("anargic_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const menuItems = [
    { icon: <Package size={22} className="menu-icon inventory" />, label: "Inventario", href: "/movilpage/perfil" },
    { icon: <Shield size={22} className="menu-icon staff" />, label: "Staff", href: "/movilpage/staff" },
    { icon: <BookOpen size={22} className="menu-icon rules" />, label: "Reglas", href: "/movilpage/reglas" },
    { icon: <Gavel size={22} className="menu-icon bans" />, label: "Baneos", href: "/movilpage/baneos" },
    { icon: <Settings size={22} className="menu-icon settings" />, label: "Configuración", href: "/movilpage/configuracion" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("anargic_user");
    window.location.href = "/";
  };

  if (loading) return <div className="mas-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>Cargando...</div>;

  if (!user) {
    return (
      <div className="mas-container m-unauth" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
        <LogIn size={48} className="m-unauth-icon" style={{ color: '#3b82f6', marginBottom: '1rem' }} />
        <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Inicia Sesión</h2>
        <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Debes ingresar para ver este menú.</p>
        <Link href="/movilpage/login" style={{ padding: '0.8rem 2rem', background: '#3b82f6', color: '#fff', borderRadius: '20px', fontWeight: '700', textDecoration: 'none' }}>
          Ir al Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mas-container animate-fade-in">
      <div className="mas-header">
        <h1>Menú</h1>
      </div>

      <div className="menu-group">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href} className="menu-item">
            <div className="menu-item-left">
              <div className="icon-wrapper">
                {item.icon}
              </div>
              <span className="menu-label">{item.label}</span>
            </div>
            <ChevronRight size={20} className="menu-arrow" />
          </Link>
        ))}
      </div>

      <div className="menu-group logout-group">
        <button onClick={handleLogout} className="menu-item logout-btn">
          <div className="menu-item-left">
            <div className="icon-wrapper logout-wrapper">
              <LogOut size={22} className="menu-icon logout" />
            </div>
            <span className="menu-label">Cerrar Sesión</span>
          </div>
        </button>
      </div>
    </div>
  );
}
