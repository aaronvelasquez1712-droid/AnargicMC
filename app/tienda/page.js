"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Star, Crown, Gem, ChevronRight, Sword, Shield, Package, Zap, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import CheckoutModal from "@/components/CheckoutModal";
import "./tienda.css";

/* ── Minecraft Pixel Art SVGs ── */
const StoneSVG = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" imageRendering="pixelated" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" fill="#8b8b8b"/>
    <rect x="0" y="0" width="3" height="3" fill="#6e6e6e"/><rect x="4" y="0" width="3" height="1" fill="#9e9e9e"/>
    <rect x="8" y="0" width="2" height="3" fill="#6e6e6e"/><rect x="11" y="1" width="3" height="2" fill="#9e9e9e"/>
    <rect x="1" y="4" width="4" height="3" fill="#9e9e9e"/><rect x="6" y="3" width="3" height="4" fill="#6e6e6e"/>
    <rect x="10" y="4" width="5" height="3" fill="#9e9e9e"/><rect x="0" y="7" width="2" height="3" fill="#6e6e6e"/>
    <rect x="3" y="7" width="4" height="2" fill="#7a7a7a"/><rect x="8" y="7" width="3" height="4" fill="#9e9e9e"/>
    <rect x="12" y="7" width="4" height="3" fill="#6e6e6e"/><rect x="1" y="11" width="5" height="4" fill="#9e9e9e"/>
    <rect x="7" y="12" width="3" height="3" fill="#6e6e6e"/><rect x="11" y="11" width="4" height="4" fill="#9e9e9e"/>
    <rect x="0" y="0" width="16" height="1" fill="rgba(255,255,255,0.15)"/>
    <rect x="0" y="0" width="1" height="16" fill="rgba(255,255,255,0.1)"/>
    <rect x="0" y="15" width="16" height="1" fill="rgba(0,0,0,0.25)"/>
  </svg>
);

const IronSVG = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" imageRendering="pixelated" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="12" height="8" fill="#9da4aa"/>
    <rect x="2" y="5" width="12" height="1" fill="#c8cdd2"/>
    <rect x="2" y="5" width="1" height="8" fill="#c8cdd2"/>
    <rect x="2" y="12" width="12" height="1" fill="#6e7880"/>
    <rect x="13" y="5" width="1" height="8" fill="#6e7880"/>
    <rect x="4" y="3" width="3" height="3" fill="#9da4aa"/>
    <rect x="9" y="3" width="3" height="3" fill="#9da4aa"/>
    <rect x="4" y="3" width="3" height="1" fill="#c8cdd2"/>
    <rect x="9" y="3" width="3" height="1" fill="#c8cdd2"/>
    <rect x="5" y="7" width="6" height="1" fill="rgba(255,255,255,0.4)"/>
    <rect x="5" y="9" width="4" height="1" fill="rgba(255,255,255,0.2)"/>
  </svg>
);

const GoldSVG = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" imageRendering="pixelated" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="12" height="8" fill="#f5c518"/>
    <rect x="2" y="5" width="12" height="1" fill="#fde68a"/>
    <rect x="2" y="5" width="1" height="8" fill="#fde68a"/>
    <rect x="2" y="12" width="12" height="1" fill="#b7870a"/>
    <rect x="13" y="5" width="1" height="8" fill="#b7870a"/>
    <rect x="4" y="3" width="3" height="3" fill="#f5c518"/>
    <rect x="9" y="3" width="3" height="3" fill="#f5c518"/>
    <rect x="4" y="3" width="3" height="1" fill="#fde68a"/>
    <rect x="9" y="3" width="3" height="1" fill="#fde68a"/>
    <rect x="5" y="7" width="6" height="1" fill="rgba(255,255,255,0.5)"/>
    <rect x="5" y="9" width="4" height="1" fill="rgba(255,255,255,0.3)"/>
    <rect x="9" y="9" width="2" height="1" fill="rgba(255,255,255,0.2)"/>
  </svg>
);

const DiamondSVG = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" imageRendering="pixelated" xmlns="http://www.w3.org/2000/svg">
    <polygon points="8,1 15,6 8,15 1,6" fill="#4dd0e1"/>
    <polygon points="8,1 15,6 8,8 1,6" fill="#80deea"/>
    <polygon points="8,8 15,6 8,15" fill="#26c6da"/>
    <polygon points="8,8 1,6 8,15" fill="#00acc1"/>
    <polygon points="8,1 12,6 8,4 4,6" fill="#b2ebf2"/>
    <rect x="7" y="3" width="2" height="1" fill="rgba(255,255,255,0.7)"/>
    <rect x="5" y="5" width="1" height="1" fill="rgba(255,255,255,0.5)"/>
  </svg>
);

const NetheriteSVG = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" imageRendering="pixelated" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="14" height="9" fill="#1a1a1a"/>
    <rect x="1" y="4" width="14" height="1" fill="#3d2a4a"/>
    <rect x="1" y="4" width="1" height="9" fill="#3d2a4a"/>
    <rect x="1" y="12" width="14" height="1" fill="#0a0a0a"/>
    <rect x="14" y="4" width="1" height="9" fill="#0a0a0a"/>
    <rect x="3" y="2" width="3" height="3" fill="#1a1a1a"/>
    <rect x="10" y="2" width="3" height="3" fill="#1a1a1a"/>
    <rect x="3" y="2" width="3" height="1" fill="#3d2a4a"/>
    <rect x="10" y="2" width="3" height="1" fill="#3d2a4a"/>
    <rect x="4" y="6" width="8" height="1" fill="#c084fc"/>
    <rect x="4" y="8" width="6" height="1" fill="#a855f7"/>
    <rect x="4" y="10" width="8" height="1" fill="#7c3aed"/>
    <rect x="6" y="5" width="1" height="1" fill="#e9d5ff"/>
    <rect x="10" y="7" width="1" height="1" fill="#e9d5ff"/>
    <rect x="4" y="9" width="1" height="1" fill="#e9d5ff"/>
  </svg>
);

const KIT_ICONS = { piedra: StoneSVG, hierro: IronSVG, oro: GoldSVG, diamante: DiamondSVG, netherite: NetheriteSVG };

/* ── KITS ── */
const KITS = [
  { id: "piedra",    name: "Kit Piedra",    tier: "Básico",      color: "#8b8b8b",  glowColor: "rgba(139,139,139,0.3)", description: "El starter pack perfecto para recién llegados.",           contents: ["Pico de Piedra", "Hacha de Piedra", "Espada de Piedra", "Armadura Cuero completa", "Comida x16"],                                                                                   priceUSD: 5  },
  { id: "hierro",    name: "Kit Hierro",    tier: "Intermedio",  color: "#9ca3af",  glowColor: "rgba(156,163,175,0.3)", description: "Herramientas de hierro duraderas para sobrevivir.",         contents: ["Pico de Hierro Eficiencia II", "Hacha de Hierro", "Espada de Hierro", "Armadura Hierro completa", "Escudo"],                                                                        priceUSD: 10 },
  { id: "oro",       name: "Kit Oro",       tier: "Especial",    color: "#f5c518",  glowColor: "rgba(245,197,24,0.3)",  description: "Herramientas de oro ultrarrápidas para minar.",             contents: ["Pico Oro Eficiencia III", "Hacha Oro", "Armadura Oro completa", "Manzanas Doradas x10", "Antorchas x64"],                                                                           priceUSD: 7  },
  { id: "diamante",  name: "Kit Diamante",  tier: "Avanzado",    color: "#4dd0e1",  glowColor: "rgba(77,208,225,0.3)",  description: "Equipamiento de diamante con encantamientos.",              contents: ["Pico Diamante Eficiencia IV", "Armadura Diamante Protección III", "Espada Diamante Afileza III", "Arco Poder II", "Flechas x64"],                                                   priceUSD: 24, popular: true },
  { id: "netherite", name: "Kit Netherite", tier: "Élite",       color: "#c084fc",  glowColor: "rgba(192,132,252,0.4)", description: "El kit supremo. Encantamientos máximos del servidor.",      contents: ["Pico Netherite Eficiencia V + Fortuna III", "Armadura Netherite Protección IV completa", "Espada Netherite Afileza V + Aspecto Ígneo II", "Tridente Lealtad III + Canalización", "Arco Poder V + Infinidad I"],   priceUSD: 30, premium: true },
];

/* Función auxiliar: elige icono según nombre del rol */
function getRoleIcon(name) {
  const n = name?.toLowerCase() || "";
  if (n.includes("admin") || n.includes("director")) return <Crown size={28} />;
  if (n.includes("staff") || n.includes("mod"))   return <Shield size={28} />;
  if (n.includes("vip"))                            return <Gem size={28} />;
  return <Star size={28} />;
}

const TABS = [
  { id: "roles",      label: "Roles",      icon: <Shield size={15} /> },
  { id: "cosmeticos", label: "Cosméticos", icon: <Star size={15} /> },
  { id: "kits",       label: "Kits",       icon: <Sword size={15} /> },
];

export default function Tienda() {
  return (
    <Suspense fallback={<div className="store-page"><div style={{ textAlign: "center", padding: "8rem", color: "#71717a" }}>Cargando tienda...</div></div>}>
      <TiendaContent />
    </Suspense>
  );
}

function TiendaContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "roles";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleBuy = (item) => {
    setSelectedItem(item);
  };
  const [cosmetics, setCosmetics] = useState([]);
  const [roles, setRoles] = useState([]);          // Roles cargados desde Supabase
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCosmetic, setSelectedCosmetic] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [processing, setProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => { const tab = searchParams.get("tab"); if (tab) setActiveTab(tab); }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        const storedUser = localStorage.getItem("anargic_user");
        if (storedUser) {
          const { nick } = JSON.parse(storedUser);
          const { data: users } = await supabase.from("users").select("*").eq("minecraft_username", nick).limit(1);
          if (users?.length) setUser(users[0]);
        }
        // Cosméticos
        const { data } = await supabase.from("cosmetics").select("*").order("price_usd", { ascending: true });
        setCosmetics((data || []).filter(c => !c.source || c.source === "TIENDA"));
        // Roles dinámicos desde Supabase
        const { data: rolesData } = await supabase
          .from("server_roles")
          .select("*")
          .eq("is_active", true)
          .order("priority", { ascending: true });
        setRoles(rolesData || []);
      } catch (error) {
        console.error("Error al cargar la tienda:", error);
      } finally {
        setLoading(false);
        setRolesLoading(false);
      }
    }
    loadData();
  }, []);

  const isOwned = (token) => (user?.cosmetics_unlocked || []).includes(String(token));

  const handleCosmeticAction = async () => {
    if (!user) { alert("Debes iniciar sesión."); return; }
    setProcessing(true);
    setTimeout(async () => {
      const newUnlocked = [...(user.cosmetics_unlocked || []), String(selectedCosmetic.token)];
      const { error } = await supabase.from("users").update({ cosmetics_unlocked: newUnlocked }).eq("id", user.id);
      if (!error) { setUser({ ...user, cosmetics_unlocked: newUnlocked }); setPurchaseSuccess(true); }
      setProcessing(false);
    }, 1500);
  };

  const closeModal = () => { setSelectedCosmetic(null); setPurchaseSuccess(false); setProcessing(false); setPaymentMethod("paypal"); };

  return (
    <div className="store-page">
      {/* Cosmetic Modal */}
      {selectedCosmetic && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box store-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            {purchaseSuccess ? (
              <div className="modal-success-state">
                <div className="success-icon-anim"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <h2>¡Transacción Exitosa!</h2>
                <p style={{ color: "#a1a1aa" }}>Has obtenido <strong>{selectedCosmetic.name}</strong>.</p>
                <button className="btn btn-secondary" onClick={closeModal} style={{ marginTop: "1rem" }}>Cerrar</button>
              </div>
            ) : (
              <>
                <div className="store-modal-preview">
                  {(() => { const src = selectedCosmetic.image_url || (selectedCosmetic.file_path ? `${process.env.NEXT_PUBLIC_COSMETICS_URL}${selectedCosmetic.file_path}` : null); return src ? <img src={src} alt={selectedCosmetic.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ color:"#71717a" }}>{selectedCosmetic.type}</span>; })()}
                </div>
                <div className="store-modal-info">
                  <p className="store-modal-type">{selectedCosmetic.type}</p>
                  <h2 className="store-modal-name">{selectedCosmetic.name}</h2>
                  <p className="store-modal-desc">{selectedCosmetic.description || "Cosmético exclusivo de Anargic MC."}</p>
                  <div className="store-modal-divider"></div>
                  {isOwned(selectedCosmetic.token) ? (
                    <div style={{ textAlign:"center", padding:"1rem 0" }}><p style={{ color:"#10b981", fontWeight:"700" }}>✓ Ya posees este cosmético</p><button className="btn btn-secondary" onClick={closeModal}>Cerrar</button></div>
                  ) : selectedCosmetic.price_usd === 0 ? (
                    <div><p style={{ color:"#10b981", fontWeight:"700", fontSize:"1.2rem", marginBottom:"1rem" }}>Gratis</p><button className="btn-success" onClick={handleCosmeticAction} disabled={processing}>{processing ? "Reclamando..." : "Reclamar a mi cuenta"}</button></div>
                  ) : (
                    <div>
                      <p style={{ fontWeight:"700", fontSize:"1.2rem", marginBottom:"0.5rem" }}>${selectedCosmetic.price_usd} USD</p>
                      <p style={{ fontWeight:"700", fontSize:"1.2rem", marginBottom:"0.5rem" }}>${selectedCosmetic.price_usd} USD</p>
                      <button className="btn-buy" onClick={() => { handleBuy(selectedCosmetic); setSelectedCosmetic(null); }} style={{ marginTop:"1rem" }}>{`Pagar $${selectedCosmetic.price_usd}`}</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Kit Modal */}
      {selectedKit && (
        <div className="modal-overlay" onClick={() => setSelectedKit(null)}>
          <div className="modal-box store-modal kit-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedKit(null)}>✕</button>
            <div className="kit-modal-header" style={{ "--kit-color": selectedKit.color }}>
              <div className="kit-modal-icon"><KitIconRenderer id={selectedKit.id} /></div>
              <div className="kit-tier">{selectedKit.tier}</div>
              <h2>{selectedKit.name}</h2>
              <p style={{ color: "#a1a1aa", fontSize: "0.9rem" }}>{selectedKit.description}</p>
            </div>
            <div className="kit-modal-contents">
              <p className="kit-modal-contents-title">Contenido del kit</p>
              <ul>
                {selectedKit.contents.map((item, i) => (
                  <li key={i}><Check size={14} color={selectedKit.color} /> {item}</li>
                ))}
              </ul>
            </div>
            <div className="kit-modal-footer">
              <div className="kit-modal-price">${selectedKit.priceUSD} <span>USD</span></div>
              <div className="kit-modal-actions">
                <a href="/juegos/drops" className="btn btn-secondary">Obtener en Drops</a>
                <button className="btn btn-primary" onClick={() => { handleBuy(selectedKit); setSelectedKit(null); }}>Comprar Kit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {selectedRole && (
        <div className="modal-overlay" onClick={() => setSelectedRole(null)}>
          <div className="modal-box store-modal" onClick={e => e.stopPropagation()} style={{ borderColor: selectedRole.borderColor, boxShadow: `0 0 60px ${selectedRole.color}22` }}>
            <button className="modal-close" onClick={() => setSelectedRole(null)}>✕</button>
            <div style={{ textAlign: "center", padding: "1rem 0 1.5rem" }}>
              <div style={{ color: selectedRole.color, marginBottom: "0.75rem" }}>{selectedRole.icon}</div>
              <h2 style={{ color: selectedRole.color, margin: "0 0 0.5rem" }}>[{selectedRole.name}]</h2>
              <p style={{ color: "#a1a1aa", fontSize: "0.9rem", lineHeight: "1.5" }}>{selectedRole.description}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
              {selectedRole.features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "6px 0", borderBottom: i < selectedRole.features.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <Check size={15} color={selectedRole.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ color: "#e4e4e7", fontSize: "0.9rem" }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "2rem", fontWeight: "900", color: "#fff", marginBottom: "1rem" }}>${selectedRole.price} <span style={{ fontSize: "1rem", color: "#71717a", fontWeight: "400" }}>USD/mes</span></p>
              <p style={{ fontSize: "2rem", fontWeight: "900", color: "#fff", marginBottom: "1rem" }}>${selectedRole.price} <span style={{ fontSize: "1rem", color: "#71717a", fontWeight: "400" }}>USD/mes</span></p>
              <button className="btn-buy" style={{ background: selectedRole.color, color: "#000" }} onClick={() => { handleBuy(selectedRole); setSelectedRole(null); }}>Obtener {selectedRole.name}</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="store-hero">
        <h1 className="store-logo-title">
          <span className="store-logo-white">ANARGIC</span>
          <span className="store-logo-blue">MC</span>
        </h1>
        <p className="store-logo-sub">STORE</p>
        <p className="store-subtitle">Mejora tu experiencia con <span className="highlight-yellow">beneficios exclusivos</span> en nuestro servidor</p>
      </div>

      <div className="container">
        {user?.is_banned ? (
          <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem", margin: "2rem auto", maxWidth: "600px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
            <AlertCircle size={64} color="#ef4444" style={{ margin: "0 auto 1rem", display: "block" }} />
            <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Cuenta Suspendida</h2>
            <p style={{ color: "#a1a1aa", marginBottom: "1.5rem" }}>No puedes acceder a la tienda porque tu cuenta ha sido sancionada.</p>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", color: "#e4e4e7" }}>
              <strong>Motivo del baneo:</strong><br/>
              {user.ban_reason || "Infracción de las normativas del servidor."}
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="store-main-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`store-main-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── ROLES ── */}
        {activeTab === "roles" && (
          <div className="roles-section">
            <div className="section-divider">
              <h2 className="section-title">Roles del Servidor</h2>
              <p className="section-subtitle">Desbloquea privilegios exclusivos, economía mejorada y acceso a zonas VIP.</p>
            </div>
            <div className="roles-free-banner">
              <span>👤 Sin rol</span>
              <p>Los jugadores sin rol deben conseguir dinero vendiendo minerales, bloques y recursos. ¡Es el desafío del servidor!</p>
            </div>

            {rolesLoading ? (
              <div className="lb-empty">Cargando roles...</div>
            ) : roles.length === 0 ? (
              <div className="lb-empty">No hay roles disponibles en este momento.</div>
            ) : (
              <div
                className="roles-grid"
                style={roles.length === 3 ? { maxWidth: "1100px", margin: "0 auto" } : {}}
              >
                {roles.map(role => {
                  // Construir objetos compatibles con la UI existente
                  const features = Array.isArray(role.features)
                    ? role.features
                    : (typeof role.features === "string" ? JSON.parse(role.features) : []);
                  const bgGradient = role.bg_gradient ||
                    `linear-gradient(135deg, ${role.color}22, ${role.color}08)`;
                  const borderColor = role.border_color || `${role.color}55`;
                  const isGoldish = ["#f5c518","#f59e0b","#fbbf24"].includes(role.color);
                  const storeRole = {
                    ...role,
                    price: role.price_usd,
                    bgGradient,
                    borderColor,
                    popular: role.is_popular,
                    features,
                    icon: getRoleIcon(role.name),
                  };
                  return (
                    <div
                      key={role.id}
                      className={`role-card ${role.is_popular ? "role-popular" : ""}`}
                      style={{ background: bgGradient, borderColor }}
                    >
                      {role.is_popular && <div className="role-popular-badge">⭐ MÁS POPULAR</div>}
                      <div className="role-card-header" style={{ color: role.color }}>
                        {getRoleIcon(role.name)}
                        <h3 className="role-name" style={{ color: role.color }}>
                          <span style={{ opacity: 0.7 }}>[</span>{role.tag}<span style={{ opacity: 0.7 }}>]</span>
                        </h3>
                      </div>
                      <p className="role-desc">{role.description}</p>
                      <ul className="role-features">
                        {features.map((f, i) => (
                          <li key={i}><Check size={13} color={role.color} /> {f}</li>
                        ))}
                      </ul>
                      <div className="role-card-footer">
                        <div className="role-price">${parseFloat(role.price_usd).toFixed(2)}<span>/mes</span></div>
                        <button
                          className="role-buy-btn"
                          style={{ background: role.color, color: isGoldish ? "#000" : "#fff" }}
                          onClick={() => handleBuy(storeRole)}
                        >
                          Obtener {role.name}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── COSMÉTICOS ── */}
        {activeTab === "cosmeticos" && (
          <>
            <div className="section-divider"><h2 className="section-title">Cosméticos de Tienda</h2></div>
            {loading ? <div className="lb-empty">Cargando cosméticos...</div> :
             cosmetics.length === 0 ? <div className="lb-empty">Aún no hay cosméticos disponibles.</div> : (
              <div className="cosmetics-grid-store">
                {cosmetics.map(c => {
                  const imgSrc = c.image_url || (c.file_path ? `${process.env.NEXT_PUBLIC_COSMETICS_URL}${c.file_path}` : null);
                  return (
                    <div key={c.id} className="cosmetic-store-card">
                      <div className="cosmetic-img-placeholder">
                        {imgSrc ? <img src={imgSrc} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"8px" }} /> : <span style={{ color:"#71717a", fontSize:"0.8rem" }}>{c.type}</span>}
                      </div>
                      <div className="cosmetic-store-info">
                        <p className="cosmetic-store-name">{c.name}</p>
                        <div className="cosmetic-store-footer">
                          <span className={`cosmetic-store-price ${c.price_usd === 0 ? "price-free" : ""}`}>{c.price_usd === 0 ? "✦ Gratis" : `$${c.price_usd} USD`}</span>
                          <button className="btn btn-primary btn-sm" onClick={() => setSelectedCosmetic(c)}>{isOwned(c.token) ? "Ya lo tienes" : c.price_usd === 0 ? "Reclamar" : "Comprar"}</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── KITS ── */}
        {activeTab === "kits" && (
          <>
            <div className="section-divider">
              <h2 className="section-title">🗡️ Kits de Armadura</h2>
              <p className="section-subtitle">Equipamiento completo desde $5 USD. También obtenibles en Drops a menor costo.</p>
            </div>
            <div className="kits-grid">
              {KITS.map(kit => {
                const IconComp = KIT_ICONS[kit.id];
                return (
                  <div key={kit.id} className={`kit-card ${kit.popular ? "kit-popular" : ""} ${kit.premium ? "kit-premium" : ""}`}
                    style={{ "--kit-color": kit.color, "--kit-glow": kit.glowColor }}
                    onClick={() => setSelectedKit(kit)}>
                    {kit.popular && <div className="kit-badge popular-badge">⭐ Popular</div>}
                    {kit.premium && <div className="kit-badge premium-badge">👑 Élite</div>}
                    <div className="kit-mc-icon"><IconComp /></div>
                    <div className="kit-tier">{kit.tier}</div>
                    <h3 className="kit-name">{kit.name}</h3>
                    <p className="kit-desc">{kit.description}</p>
                    <ul className="kit-contents">
                      {kit.contents.slice(0, 3).map((item, i) => <li key={i}><ChevronRight size={12} color={kit.color} />{item}</li>)}
                      {kit.contents.length > 3 && <li className="kit-more">+{kit.contents.length - 3} items más</li>}
                    </ul>
                    <div className="kit-price">${kit.priceUSD} USD</div>
                    <div className="kit-cta">Ver detalles →</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        </>
        )}
      </div>

      {selectedItem && (
        <CheckoutModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

function KitIconRenderer({ id }) {
  const Comp = KIT_ICONS[id];
  return Comp ? <Comp /> : null;
}
