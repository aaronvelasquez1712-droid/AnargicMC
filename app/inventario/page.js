"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, Gift, Sword, Shield, Clock, CheckCircle, Copy, Bell } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { getAvatarSrc, getFrameSrc } from "@/utils/avatar";
import "./inventario.css";

export default function Inventario() {
  return (
    <Suspense fallback={<div className="inv-page"><div className="inv-loading">Cargando inventario...</div></div>}>
      <InventarioContent />
    </Suspense>
  );
}

function InventarioContent() {
  const [activeTab, setActiveTab] = useState("kits");
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [claimCode, setClaimCode] = useState("");
  const [claimMsg, setClaimMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem("anargic_user");
        if (!stored) { setLoading(false); return; }
        const { nick } = JSON.parse(stored);
        const { data: users } = await supabase.from("users").select("*").eq("minecraft_username", nick).limit(1);
        if (!users?.length) { setLoading(false); return; }
        const u = users[0];
        setUser(u);

        const { data: inv } = await supabase.from("user_inventory").select("*").eq("user_id", u.id).order("created_at", { ascending: false });
        setInventory(inv || []);

        const { data: notifs } = await supabase.from("notifications").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(30);
        setNotifications(notifs || []);

        // Mark notifications as read
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", u.id).eq("is_read", false);
      } catch (error) {
        console.error("Error al cargar el inventario:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!claimCode.trim() || !user) return;
    const code = claimCode.trim().toUpperCase();
    const { data: item } = await supabase.from("user_inventory").select("*").eq("claim_code", code).eq("is_claimed", false).limit(1);
    if (!item?.length) {
      setClaimMsg("❌ Código inválido o ya fue canjeado.");
      setTimeout(() => setClaimMsg(""), 4000);
      return;
    }
    const reward = item[0];
    if (reward.user_id !== user.id) {
      setClaimMsg("❌ Este código no pertenece a tu cuenta.");
      setTimeout(() => setClaimMsg(""), 4000);
      return;
    }
    await supabase.from("user_inventory").update({ is_claimed: true, claimed_at: new Date().toISOString() }).eq("id", reward.id);
    await supabase.from("notifications").insert({ user_id: user.id, title: "¡Recompensa reclamada!", message: `Tu recompensa "${reward.item_name}" fue reclamada correctamente. El kit llegará a tu cuenta en un plazo de 24h.`, type: "SUCCESS" });
    setClaimCode("");
    setClaimMsg("✅ ¡Recompensa reclamada! Llegará a tu cuenta en 24h.");
    setInventory(prev => prev.map(i => i.id === reward.id ? { ...i, is_claimed: true } : i));
    setTimeout(() => setClaimMsg(""), 5000);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const tabItems = {
    kits: inventory.filter(i => i.item_type === "KIT"),
    premios: inventory.filter(i => i.item_type !== "KIT"),
    notificaciones: notifications,
  };

  const typeIcon = (type) => {
    if (type === "KIT") return <Sword size={18} color="#10b981" />;
    if (type === "COSMETIC_TEMP") return <Shield size={18} color="#8b5cf6" />;
    if (type === "ROLE_TEMP") return <Gift size={18} color="#f59e0b" />;
    return <Package size={18} color="#a1a1aa" />;
  };

  const notifColor = (type) => {
    if (type === "SUCCESS") return "#10b981";
    if (type === "WARNING") return "#f59e0b";
    if (type === "PRIZE") return "#f59e0b";
    return "#00bfff";
  };

  if (!user && !loading) return (
    <div className="inv-page">
      <div className="inv-empty-state">
        <Package size={64} color="#27272a" />
        <h2>Inicia sesión para ver tu inventario</h2>
        <a href="/login" className="btn btn-primary">Iniciar Sesión</a>
      </div>
    </div>
  );

  return (
    <div className="inv-page">
      <div className="inv-hero">
        <div className="inv-hero-glow"></div>
        <h1 className="inv-title">Inventario</h1>
        <p className="inv-subtitle">Gestiona tus recompensas, kits y notificaciones</p>
      </div>

      <div className="inv-layout container">
        {/* Sidebar */}
        <aside className="inv-sidebar glass-panel">
          <h3 className="inv-sidebar-title">Mi Cuenta</h3>
          {user && (
            <div className="inv-user-card">
              <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                <img
                  src={getAvatarSrc(user, 64)}
                  alt={user.minecraft_username}
                  className="inv-user-avatar"
                  style={{ imageRendering: "pixelated", width: "100%", height: "100%" }}
                  onError={(e) => { e.target.src = "https://minotar.net/helm/Steve/64.png"; }}
                />
                {getFrameSrc(user) && (
                  <img
                    src={getFrameSrc(user)}
                    alt="Frame"
                    style={{ position: "absolute", top: "-10%", left: "-10%", width: "120%", height: "120%", pointerEvents: "none" }}
                  />
                )}
              </div>
              <div>
                <p className="inv-user-name">{user.minecraft_username}</p>
                <p className="inv-user-rank">{user.rank || "Jugador"}</p>
              </div>
            </div>
          )}
          <nav className="inv-nav">
            {[
              { id: "kits", label: "Kits", icon: <Sword size={16} />, count: tabItems.kits.length },
              { id: "premios", label: "Premios", icon: <Gift size={16} />, count: tabItems.premios.length },
              { id: "notificaciones", label: "Notificaciones", icon: <Bell size={16} />, count: notifications.filter(n => !n.is_read).length },
              { id: "reclamar", label: "Reclamar Código", icon: <Gift size={16} /> },
            ].map(t => (
              <button
                key={t.id}
                className={`inv-nav-btn ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon} {t.label}
                {t.count > 0 && <span className="inv-nav-count">{t.count}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="inv-content">
          {loading && <div className="inv-loading">Cargando...</div>}

          {!loading && activeTab === "reclamar" && (
            <div className="glass-panel inv-panel">
              <h2 className="inv-panel-title"><Gift size={20} color="#10b981" /> Reclamar Recompensa</h2>
              <p className="inv-panel-desc">Introduce el código único de tu recompensa para canjearla. El kit o ítem llegará a tu cuenta de Minecraft en un plazo máximo de 24 horas.</p>
              <form onSubmit={handleClaim} className="claim-form">
                <input
                  type="text"
                  className="claim-input"
                  placeholder="Ej: ABC1-DE2F-GH3I"
                  value={claimCode}
                  onChange={e => setClaimCode(e.target.value.toUpperCase())}
                  maxLength={20}
                />
                <button type="submit" className="btn btn-primary">Canjear</button>
              </form>
              {claimMsg && (
                <p className={`claim-msg ${claimMsg.startsWith("✅") ? "success" : "error"}`}>{claimMsg}</p>
              )}
            </div>
          )}

          {!loading && activeTab === "notificaciones" && (
            <div className="glass-panel inv-panel">
              <h2 className="inv-panel-title"><Bell size={20} color="#00bfff" /> Notificaciones</h2>
              {notifications.length === 0 ? (
                <div className="inv-empty"><Bell size={48} color="#3f3f46" /><p>No tienes notificaciones</p></div>
              ) : (
                <div className="notif-list">
                  {notifications.map(n => {
                    const content = (
                      <div key={n.id} className={`notif-item ${n.is_read ? "read" : "unread"}`}>
                        <div className="notif-dot-side" style={{ background: notifColor(n.type) }}></div>
                        <div className="notif-body">
                          <p className="notif-title">{n.title}</p>
                          <p className="notif-msg">{n.message}</p>
                          <span className="notif-date">{new Date(n.created_at).toLocaleString("es-ES")}</span>
                        </div>
                      </div>
                    );
                    
                    if (n.type === "EVENT") {
                      return (
                        <Link href="/eventos" key={n.id} style={{ textDecoration: "none", color: "inherit", display: "block", marginBottom: "0.5rem" }}>
                          {content}
                        </Link>
                      );
                    }
                    return content;
                  })}
                </div>
              )}
            </div>
          )}

          {!loading && (activeTab === "kits" || activeTab === "premios") && (
            <div className="glass-panel inv-panel">
              <h2 className="inv-panel-title">
                {activeTab === "kits" ? <><Sword size={20} color="#10b981" /> Mis Kits</> : <><Gift size={20} color="#8b5cf6" /> Mis Premios</>}
              </h2>
              {tabItems[activeTab].length === 0 ? (
                <div className="inv-empty">
                  <Package size={48} color="#3f3f46" />
                  <p>No tienes {activeTab === "kits" ? "kits" : "premios"} aún.</p>
                </div>
              ) : (
                <div className="inv-items-grid">
                  {tabItems[activeTab].map(item => (
                    <div key={item.id} className={`inv-item-card ${item.is_claimed ? "claimed" : ""}`}>
                      <div className="inv-item-icon">{typeIcon(item.item_type)}</div>
                      <div className="inv-item-info">
                        <p className="inv-item-name">{item.item_name}</p>
                        <p className="inv-item-source">Obtenido en: {item.source}</p>
                        {item.expires_at && (
                          <p className="inv-item-expires"><Clock size={12} /> Expira: {new Date(item.expires_at).toLocaleDateString("es-ES")}</p>
                        )}
                      </div>
                      <div className="inv-item-actions">
                        {item.is_claimed ? (
                          <span className="inv-item-claimed"><CheckCircle size={14} /> Canjeado</span>
                        ) : (
                          item.claim_code && (
                            <div className="inv-item-code">
                              <code>{item.claim_code}</code>
                              <button onClick={() => copyCode(item.claim_code)} title="Copiar código"><Copy size={12} /></button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
