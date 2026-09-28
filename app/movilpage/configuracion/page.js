"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, Shield, Bell, Settings, ChevronRight, ChevronLeft,
  CheckCircle, XCircle, Save, Globe, Monitor, Clock, 
  Trash2, AlertTriangle, LogOut, Image as ImageIcon, Lock,
  Edit2
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { getAvatarSrc, getFrameSrc } from "@/utils/avatar";
import "./config-movil.css";

const MENU_ITEMS = [
  { id: "general",        label: "General",          icon: Settings  },
  { id: "skin",           label: "Mi Skin",          icon: User      },
  { id: "cosmeticos",     label: "Cosméticos",       icon: ImageIcon },
  { id: "cuenta",         label: "Mi Cuenta",        icon: Shield    },
  { id: "notificaciones", label: "Notificaciones",   icon: Bell      },
];

export default function MovilConfiguracionPage() {
  const [activeView, setActiveView] = useState("menu"); // "menu" or view ID
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States for sub-pages
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [allCosmetics, setAllCosmetics] = useState([]);
  const [activeCosmeticTab, setActiveCosmeticTab] = useState("PROFILE_PIC");

  useEffect(() => {
    async function loadData() {
      const stored = localStorage.getItem("anargic_user");
      if (!stored) { setLoading(false); return; }
      
      const { nick } = JSON.parse(stored);
      const { data: userData } = await supabase.from("users").select("*").eq("minecraft_username", nick).limit(1);
      
      if (userData && userData.length > 0) {
        setUser(userData[0]);
        setEditEmail(userData[0].email || "");
      }

      // Load cosmetics
      const { data: cosm } = await supabase.from("cosmetics").select("*").order("name");
      setAllCosmetics(cosm || []);
      
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSaveEmail = async () => {
    if (!editEmail) return;
    setSaving(true);
    setMsg("");
    
    try {
      const res = await fetch("/api/email/request-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newEmail: editEmail }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMsg("✅ Revisa tu nuevo correo para verificar el cambio.");
      } else {
        setMsg("❌ " + (data.error || "Error al solicitar el cambio."));
      }
    } catch (error) {
      setMsg("❌ Error de conexión al guardar.");
    }
    
    setSaving(false);
  };

  const handleEquipCosmetic = async (c) => {
    // Determine if owned
    const isOwned = (user?.cosmetics_unlocked || []).includes(String(c.token));
    if (!isOwned) {
      alert("No tienes este cosmético. Búscalo en la Tienda.");
      return;
    }

    // Determine current equip state
    const sToken = String(c.token);
    let updateObj = {};
    let isEquipped = false;

    if (c.type === "BANNER") isEquipped = user.equipped_banner === sToken;
    if (c.type === "PROFILE_PIC") isEquipped = user.equipped_profile_pic === sToken;
    if (c.type === "FRAME") isEquipped = user.equipped_frame === sToken;

    const imgUrl = c.image_url || (c.file_path ? `${process.env.NEXT_PUBLIC_COSMETICS_URL}${c.file_path}` : null);

    if (c.type === "BANNER") {
      updateObj = { equipped_banner: isEquipped ? null : sToken, equipped_banner_url: isEquipped ? null : imgUrl };
    } else if (c.type === "PROFILE_PIC") {
      updateObj = { equipped_profile_pic: isEquipped ? null : sToken, equipped_profile_pic_url: isEquipped ? null : imgUrl };
    } else if (c.type === "FRAME") {
      updateObj = { equipped_frame: isEquipped ? null : sToken, equipped_frame_url: isEquipped ? null : imgUrl };
    }

    const { error } = await supabase.from("users").update(updateObj).eq("id", user.id);
    if (!error) {
      setUser({ ...user, ...updateObj });
      alert(isEquipped ? "Desequipado correctamente" : "Equipado correctamente");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("anargic_user");
    window.location.href = "/";
  };

  if (loading) return <div className="m-config-container"><div className="m-loading">Cargando...</div></div>;

  if (!user) return (
    <div className="m-config-container m-unauth" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
      <Lock size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
      <h2 style={{ color: '#fff' }}>Inicia Sesión</h2>
      <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Debes ingresar para ver la configuración.</p>
      <Link href="/movilpage/login" className="m-btn-primary">Ir al Login</Link>
    </div>
  );

  return (
    <div className="m-config-container animate-fade-in">
      {/* HEADER */}
      <div className="m-config-header">
        {activeView !== "menu" ? (
          <button className="m-back-btn" onClick={() => setActiveView("menu")}>
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div style={{ width: 24 }}></div> // Spacer
        )}
        <h1>{activeView === "menu" ? "Ajustes" : MENU_ITEMS.find(i => i.id === activeView)?.label}</h1>
        <div style={{ width: 24 }}></div> // Spacer
      </div>

      {/* MAIN MENU */}
      {activeView === "menu" && (
        <div className="m-config-menu">
          <div className="m-profile-summary">
            <div className="m-ps-avatar-wrapper">
              <img src={getAvatarSrc(user)} alt="Avatar" className="m-ps-avatar" />
              {user.equipped_frame_url && <img src={getFrameSrc(user)} className="m-ps-frame" />}
            </div>
            <div className="m-ps-info">
              <h2>{user.minecraft_username}</h2>
              <p>{user.email || "Sin email configurado"}</p>
            </div>
          </div>

          <div className="m-menu-list">
            {MENU_ITEMS.map(item => (
              <button key={item.id} className="m-menu-item" onClick={() => setActiveView(item.id)}>
                <div className="m-mi-icon"><item.icon size={20} /></div>
                <span className="m-mi-label">{item.label}</span>
                <ChevronRight size={20} className="m-mi-arrow" />
              </button>
            ))}
          </div>

          <button className="m-menu-item m-logout-btn" onClick={handleLogout} style={{ marginTop: '2rem' }}>
            <div className="m-mi-icon"><LogOut size={20} color="#ef4444" /></div>
            <span className="m-mi-label" style={{ color: '#ef4444' }}>Cerrar Sesión</span>
          </button>
        </div>
      )}

      {/* GENERAL VIEW */}
      {activeView === "general" && (
        <div className="m-config-view">
          <div className="m-cv-card">
            <h3>Sesión Actual</h3>
            <div className="m-session-info">
              <Globe size={16} /> Navegador Web
            </div>
            <div className="m-session-info">
              <Clock size={16} /> {new Date().toLocaleString("es-ES")}
            </div>
          </div>
          
          <div className="m-cv-card">
            <h3>Estado de Seguridad</h3>
            <div className="m-security-row">
              <span>Email Vinculado</span>
              {user.email ? <CheckCircle size={18} color="#10b981"/> : <XCircle size={18} color="#ef4444"/>}
            </div>
            <div className="m-security-row">
              <span>Discord Vinculado</span>
              {user.discord_username ? <span style={{ color: '#5865F2' }}>{user.discord_username}</span> : <XCircle size={18} color="#ef4444"/>}
            </div>
          </div>
        </div>
      )}

      {/* SKIN VIEW */}
      {activeView === "skin" && (
        <div className="m-config-view text-center">
          <User size={48} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
          <h3>Subir Skin (Desde PC)</h3>
          <p style={{ color: '#a1a1aa', marginTop: '0.5rem', lineHeight: '1.5' }}>
            La subida y edición de Skins está optimizada para computadora debido al procesamiento de imágenes. 
            Ingresa desde tu PC a <strong>anargic.net/configuracion</strong> para actualizarla.
          </p>
        </div>
      )}

      {/* COSMETICS VIEW */}
      {activeView === "cosmeticos" && (
        <div className="m-config-view">
          <div className="m-cosm-tabs">
            <button className={activeCosmeticTab === "PROFILE_PIC" ? "active" : ""} onClick={() => setActiveCosmeticTab("PROFILE_PIC")}>Avatares</button>
            <button className={activeCosmeticTab === "FRAME" ? "active" : ""} onClick={() => setActiveCosmeticTab("FRAME")}>Marcos</button>
            <button className={activeCosmeticTab === "BANNER" ? "active" : ""} onClick={() => setActiveCosmeticTab("BANNER")}>Banners</button>
          </div>

          <div className="m-cosm-grid">
            {allCosmetics.filter(c => c.type === activeCosmeticTab).map(c => {
              const owned = (user?.cosmetics_unlocked || []).includes(String(c.token));
              const imgUrl = c.image_url || (c.file_path ? `${process.env.NEXT_PUBLIC_COSMETICS_URL}${c.file_path}` : null);
              
              let isEquipped = false;
              if (c.type === "BANNER") isEquipped = user.equipped_banner === String(c.token);
              if (c.type === "PROFILE_PIC") isEquipped = user.equipped_profile_pic === String(c.token);
              if (c.type === "FRAME") isEquipped = user.equipped_frame === String(c.token);

              return (
                <div key={c.id} className={`m-cosm-card ${owned ? 'owned' : 'locked'} ${isEquipped ? 'equipped' : ''}`} onClick={() => handleEquipCosmetic(c)}>
                  <div className="m-cosm-img-wrapper">
                    {imgUrl ? (
                      <img src={imgUrl} alt={c.name} style={{ objectFit: c.type === 'FRAME' ? 'contain' : 'cover' }} />
                    ) : (
                      <div className="m-cosm-placeholder">{c.type[0]}</div>
                    )}
                    {!owned && <div className="m-cosm-lock"><Lock size={16} /></div>}
                  </div>
                  <p>{c.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CUENTA VIEW */}
      {activeView === "cuenta" && (
        <div className="m-config-view">
          <div className="m-cv-card">
            <h3>Usuario de Minecraft</h3>
            <input type="text" value={user.minecraft_username} disabled className="m-input-disabled" />
          </div>

          <div className="m-cv-card">
            <h3>Correo Electrónico</h3>
            <p className="m-cv-desc">Se enviará un link de verificación al nuevo correo.</p>
            <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="m-input" />
            <button className="m-btn-primary" onClick={handleSaveEmail} disabled={saving} style={{ marginTop: '1rem' }}>
              {saving ? "Solicitando..." : "Cambiar Correo"}
            </button>
            {msg && <p className="m-msg-alert">{msg}</p>}
          </div>

          <div className="m-cv-card m-danger-zone">
            <h3>Eliminar Cuenta</h3>
            <p className="m-cv-desc">Esta acción es permanente e irreversible.</p>
            <button className="m-btn-danger" onClick={() => alert("Por seguridad, debes usar la versión de PC para eliminar tu cuenta.")}>
              Eliminar Definitivamente
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICACIONES VIEW */}
      {activeView === "notificaciones" && (
        <div className="m-config-view text-center">
          <Bell size={48} color="#a1a1aa" style={{ margin: '0 auto 1rem' }} />
          <h3>Todo al día</h3>
          <p style={{ color: '#a1a1aa' }}>No tienes notificaciones pendientes.</p>
        </div>
      )}

    </div>
  );
}
