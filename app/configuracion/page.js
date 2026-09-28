"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  User, Shield, Bell, Settings, ChevronRight,
  CheckCircle, XCircle, Edit2, Save, Globe,
  Monitor, Clock, Hash, Trash2, AlertTriangle,
  LogOut, ExternalLink, Lock, ShoppingCart,
  Swords, Star, X, Image
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import "./configuracion.css";

const MENU_ITEMS = [
  { id: "general",        label: "General",          icon: Settings  },
  { id: "skin",           label: "Mi Skin",          icon: User      },
  { id: "cosmeticos",     label: "Cosméticos",       icon: Image     },
  { id: "cuenta",         label: "Mi Cuenta",        icon: Shield    },
  { id: "seguridad",      label: "Seguridad",        icon: Lock      },
  { id: "notificaciones", label: "Notificaciones",   icon: Bell      },
];

const COSM_TABS = [
  { id: "BANNER",      label: "Banners"        },
  { id: "PROFILE_PIC", label: "Fotos de Perfil"},
  { id: "FRAME",       label: "Marcos"         },
];

const SOURCE_INFO = {
  TIENDA:  { label: "Tienda",                    icon: ShoppingCart, color: "#00bfff" },
  MISION:  { label: "Misiones",                  icon: Swords,       color: "#10b981" },
  EVENTO:  { label: "Evento por tiempo limitado", icon: Star,        color: "#f59e0b" },
  DISCORD: { label: "Discord",                    icon: null,         color: "#5865F2" },
};

const DiscordIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);

function ConfiguracionContent() {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState("general");
  const [cosmTab, setCosmTab] = useState("BANNER");
  const [user, setUser] = useState(null);
  const [allCosmetics, setAllCosmetics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedCosmetic, setSelectedCosmetic] = useState(null);
  const [discordMsg, setDiscordMsg] = useState("");
  const [showUnlinkDiscordModal, setShowUnlinkDiscordModal] = useState(false);
  const [unlinkingDiscord, setUnlinkingDiscord] = useState(false);

  // Editor de banner
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [editBannerPosX, setEditBannerPosX] = useState(50);
  const [editBannerPosY, setEditBannerPosY] = useState(50);
  const [editBannerScale, setEditBannerScale] = useState(1.0);

  // Subida de Skin
  const [uploadingSkin, setUploadingSkin] = useState(false);
  const [skinMsg, setSkinMsg] = useState("");

  const handleSkinUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingSkin(true);
    setSkinMsg("");

    try {
      // Leer el archivo como imagen
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      // Extraer la cara (8x8 desde x:8, y:8)
      const canvas = document.createElement("canvas");
      canvas.width = 64; // Escalar a 64x64 para mejor calidad
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      // Primero la capa de la cabeza
      ctx.drawImage(img, 8, 8, 8, 8, 0, 0, 64, 64);
      // Luego el accesorio del casco (x:40, y:8)
      ctx.drawImage(img, 40, 8, 8, 8, 0, 0, 64, 64);

      // Subir el archivo original al bucket 'skins'
      const skinPath = `full/${user.id}.png`;
      const facePath = `faces/${user.id}.png`;

      await supabase.storage.from('skins').upload(skinPath, file, { upsert: true });

      // Subir la cara generada
      const faceBlob = await new Promise(res => canvas.toBlob(res, "image/png"));
      await supabase.storage.from('skins').upload(facePath, faceBlob, { upsert: true });

      // Obtener URLs públicas
      const skinUrl = supabase.storage.from('skins').getPublicUrl(skinPath).data.publicUrl;
      const faceUrl = supabase.storage.from('skins').getPublicUrl(facePath).data.publicUrl;

      // Actualizar usuario
      const updates = { custom_skin_url: skinUrl, custom_face_url: faceUrl };
      await supabase.from("users").update(updates).eq("id", user.id);

      setUser({ ...user, ...updates });
      setSkinMsg("✅ Skin actualizada con éxito.");
    } catch (err) {
      console.error(err);
      setSkinMsg("❌ Error al subir la skin. Asegúrate de que es un archivo PNG válido (64x64 o 64x32).");
    } finally {
      setUploadingSkin(false);
    }
  };

  // Leer parámetros de retorno del OAuth de Discord
  useEffect(() => {
    const status = searchParams.get("discord");
    const tag    = searchParams.get("tag");
    if (status === "success" && tag) {
      setDiscordMsg(`✅ Discord vinculado correctamente como ${decodeURIComponent(tag)}`);
    } else if (status === "error") {
      setDiscordMsg("❌ Error al vincular Discord. Inténtalo de nuevo.");
    } else if (status === "cancelled") {
      setDiscordMsg("⚠️ Vinculación cancelada.");
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const stored = localStorage.getItem("anargic_user");
      if (!stored) { setLoading(false); return; }
      const { nick } = JSON.parse(stored);
      const { data: userData } = await supabase.from("users").select("*").eq("minecraft_username", nick).limit(1);
      if (userData && userData.length > 0) {
        setUser(userData[0]);
        setEditEmail(userData[0].email || "");
      }
      const { data: cosm } = await supabase.from("cosmetics").select("*").order("name");
      setAllCosmetics(cosm || []);
      setLoading(false);
    }
    load();
  }, []);

  const isOwned = (token) => {
    // El avatar de Discord siempre está "desbloqueado" si Discord está vinculado
    if (token === 'discord_avatar' && user?.discord_username) return true;
    return (user?.cosmetics_unlocked || []).includes(String(token));
  };
  const isEquipped = (token, type) => {
    const sToken = String(token);
    if (type === "BANNER")      return user?.equipped_banner      === sToken;
    if (type === "PROFILE_PIC") return user?.equipped_profile_pic === sToken;
    if (type === "FRAME")       return user?.equipped_frame       === sToken;
    return false;
  };

  const getImgSrc = (c) => {
    if (!c) return null;
    if (c.source === "DISCORD" && user?.discord_username) {
      if (c.type === "PROFILE_PIC" && user?.discord_avatar) return `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png?size=1024`;
      if (c.type === "BANNER" && user?.discord_banner) return `https://cdn.discordapp.com/banners/${user.discord_id}/${user.discord_banner}.png?size=512`;
    }
    return c.image_url || (c.file_path ? `${process.env.NEXT_PUBLIC_COSMETICS_URL}${c.file_path}` : null);
  };

  // Cosmético sintético de avatar de Discord (si está vinculado)
  const discordAvatarCosmetic = user?.discord_username ? {
    id: 'discord-avatar-synthetic',
    token: 'discord_avatar',
    name: 'Avatar de Discord',
    type: 'PROFILE_PIC',
    source: 'DISCORD',
    description: 'Tu foto de perfil de Discord, se actualiza automáticamente cuando cambias tu avatar en Discord.',
    image_url: user.discord_avatar ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png?size=1024` : `https://cdn.discordapp.com/embed/avatars/0.png`,
  } : null;

  // Lista de cosméticos con el sintético de Discord inyectado
  const allCosmeticsWithDiscord = discordAvatarCosmetic
    ? [discordAvatarCosmetic, ...allCosmetics]
    : allCosmetics;

  const equippedBannerData = allCosmeticsWithDiscord.find(c => String(c.token) === user?.equipped_banner && c.type === "BANNER");
  const equippedAvatarData = allCosmeticsWithDiscord.find(c => String(c.token) === user?.equipped_profile_pic && c.type === "PROFILE_PIC");
  const equippedFrameData = allCosmeticsWithDiscord.find(c => String(c.token) === user?.equipped_frame && c.type === "FRAME");
  const isDiscordFrame = equippedFrameData?.source === "DISCORD" && user?.discord_color;

  const handleUnlinkDiscord = async () => {
    setUnlinkingDiscord(true);
    const { error } = await supabase.from("users").update({ discord_id: null, discord_username: null, discord_avatar: null }).eq("id", user.id);
    if (!error) {
      // Si tiene equipado el avatar de Discord, des-equiparlo
      let extraUpdates = {};
      if (user.equipped_profile_pic === 'discord_avatar') {
        extraUpdates = { equipped_profile_pic: null, equipped_profile_pic_url: null };
        await supabase.from("users").update(extraUpdates).eq("id", user.id);
      }
      setUser({ ...user, discord_id: null, discord_username: null, discord_avatar: null, ...extraUpdates });
      setShowUnlinkDiscordModal(false);
    } else {
      alert("Hubo un error al desvincular la cuenta.");
    }
    setUnlinkingDiscord(false);
  };

  const handleEquip = async (c) => {
    const sToken = String(c.token);
    if (!isOwned(sToken)) return;
    let updateObj = {};
    if (c.type === "BANNER") {
      updateObj = { 
        equipped_banner: isEquipped(sToken, "BANNER") ? null : sToken,
        equipped_banner_url: isEquipped(sToken, "BANNER") ? null : getImgSrc(c)
      };
    }
    if (c.type === "PROFILE_PIC") {
      updateObj = { 
        equipped_profile_pic: isEquipped(sToken, "PROFILE_PIC") ? null : sToken,
        equipped_profile_pic_url: isEquipped(sToken, "PROFILE_PIC") ? null : getImgSrc(c)
      };
    }
    if (c.type === "FRAME") {
      updateObj = { 
        equipped_frame: isEquipped(sToken, "FRAME") ? null : sToken,
        equipped_frame_url: isEquipped(sToken, "FRAME") ? null : getImgSrc(c)
      };
    }
    const { error } = await supabase.from("users").update(updateObj).eq("id", user.id);
    if (!error) setUser({ ...user, ...updateObj });
    setSelectedCosmetic(null);
  };

  const openCosmeticModal = (c) => {
    setSelectedCosmetic(c);
    setIsEditingBanner(false);
    if (c.type === "BANNER") {
      setEditBannerPosX(user?.banner_pos_x ?? 50);
      setEditBannerPosY(user?.banner_pos_y ?? 50);
      setEditBannerScale(user?.banner_scale ?? 1.0);
    }
  };

  const handleSaveBannerConfig = async () => {
    setSaving(true);
    const updates = { 
      banner_pos_x: editBannerPosX, 
      banner_pos_y: editBannerPosY, 
      banner_scale: editBannerScale 
    };
    const { error } = await supabase.from("users").update(updates).eq("id", user.id);
    if (!error) {
      setUser({ ...user, ...updates });
      setIsEditingBanner(false);
    }
    setSaving(false);
  };

  const handleAutoCenterBanner = () => {
    setEditBannerPosX(50);
    setEditBannerPosY(50);
    setEditBannerScale(1.0);
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    setSaveMsg("");
    
    try {
      const res = await fetch("/api/email/request-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newEmail: editEmail }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSaveMsg("Revisa la bandeja de entrada de tu nuevo correo para verificar el cambio.");
        // No actualizamos la UI localmente hasta que lo verifiquen
        setEditMode(false);
      } else {
        setSaveMsg(data.error || "Error al solicitar el cambio.");
      }
    } catch (error) {
      setSaveMsg("Error de conexión al guardar.");
    }
    
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await supabase.from("users").delete().eq("id", user.id);
    localStorage.removeItem("anargic_user");
    window.location.href = "/";
  };

  const handleLogout = () => {
    localStorage.removeItem("anargic_user");
    window.location.href = "/";
  };

  if (loading) return <div className="config-page"><div className="config-loading">Cargando configuración...</div></div>;

  if (!user) return (
    <div className="config-page">
      <div className="config-loading">
        <p>Debes iniciar sesión para acceder.</p>
        <a href="/login" className="btn btn-primary" style={{ marginTop: "1rem" }}>Iniciar Sesión</a>
      </div>
    </div>
  );

  const bannerSrc  = getImgSrc(equippedBannerData);
  const avatarSrc  = equippedAvatarData
    ? getImgSrc(equippedAvatarData)
    : (user.custom_face_url || `https://minotar.net/helm/${user.minecraft_username}/96.png`);

  return (
    <div className="config-page">

      {/* ===== COSMETIC DETAIL MODAL ===== */}
      {selectedCosmetic && (
        <div className="modal-overlay" onClick={() => setSelectedCosmetic(null)}>
          <div className="modal-box glass-panel cosmetic-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCosmetic(null)}><X size={18}/></button>

            {isEditingBanner ? (
              <>
                <div className="cosmetic-modal-preview banner-edit-preview" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
                  <img 
                    src={getImgSrc(selectedCosmetic)} 
                    alt="Banner Editor" 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                      objectPosition: `${editBannerPosX}% ${editBannerPosY}%`,
                      transform: `scale(${editBannerScale})`,
                      transition: "transform 0.1s, object-position 0.1s"
                    }}
                  />
                </div>
                <div className="cosmetic-modal-info">
                  <h2 className="cosmetic-modal-name">Ajustar Banner</h2>
                  <p className="cosmetic-modal-desc">Modifica cómo se verá tu banner en tu perfil público y en esta página.</p>
                  
                  <div className="banner-editor-controls">
                    <div className="editor-control">
                      <label>Posición Horizontal (X): {editBannerPosX}%</label>
                      <input type="range" min="0" max="100" value={editBannerPosX} onChange={(e) => setEditBannerPosX(parseInt(e.target.value))} />
                    </div>
                    <div className="editor-control">
                      <label>Posición Vertical (Y): {editBannerPosY}%</label>
                      <input type="range" min="0" max="100" value={editBannerPosY} onChange={(e) => setEditBannerPosY(parseInt(e.target.value))} />
                    </div>
                    <div className="editor-control">
                      <label>Zoom (Escala): {editBannerScale.toFixed(2)}x</label>
                      <input type="range" min="0.5" max="2.0" step="0.05" value={editBannerScale} onChange={(e) => setEditBannerScale(parseFloat(e.target.value))} />
                    </div>
                  </div>

                  <div className="cosmetic-modal-actions" style={{ marginTop: "1.5rem" }}>
                    <button className="btn btn-secondary" onClick={handleAutoCenterBanner}>Centrar Automáticamente</button>
                  </div>
                  <div className="cosmetic-modal-actions" style={{ marginTop: "0.5rem" }}>
                    <button className="btn btn-primary" onClick={handleSaveBannerConfig} disabled={saving}>
                      {saving ? "Guardando..." : "Guardar Diseño"}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsEditingBanner(false)}>Cancelar</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="cosmetic-modal-preview">
                  {getImgSrc(selectedCosmetic) ? (
                    <img src={getImgSrc(selectedCosmetic)} alt={selectedCosmetic.name}
                      style={{ 
                        width:"100%", 
                        height:"100%", 
                        objectFit: selectedCosmetic.type === "FRAME" ? "contain" : "cover",
                        objectPosition: selectedCosmetic.type === "BANNER" ? `${user?.banner_pos_x ?? 50}% ${user?.banner_pos_y ?? 50}%` : "50% 50%",
                        transform: selectedCosmetic.type === "BANNER" ? `scale(${user?.banner_scale ?? 1.0})` : "scale(1.0)"
                      }}/>
                  ) : (
                <div className="cosmetic-modal-noimg">
                  <Lock size={32} color="#52525b"/>
                </div>
              )}
              {!isOwned(selectedCosmetic.token) && (
                <div className="cosmetic-modal-lock-overlay"><Lock size={28} color="#fff"/></div>
              )}
            </div>

            <div className="cosmetic-modal-info">
              <p className="cosmetic-modal-type">{selectedCosmetic.type === "BANNER" ? "Banner" : selectedCosmetic.type === "PROFILE_PIC" ? "Foto de Perfil" : "Marco"}</p>
              <h2 className="cosmetic-modal-name">{selectedCosmetic.name}</h2>
              <p className="cosmetic-modal-desc">{selectedCosmetic.description || "Sin descripción."}</p>

              {!isOwned(selectedCosmetic.token) && (() => {
                const src = SOURCE_INFO[selectedCosmetic.source] || SOURCE_INFO.TIENDA;
                const SrcIcon = src.icon;
                return (
                  <div className="cosmetic-modal-source">
                    <p className="cosmetic-source-label">Dónde conseguirlo</p>
                    <div className="cosmetic-source-badge" style={{ borderColor: src.color, color: src.color }}>
                      <SrcIcon size={14}/> {src.label}
                      {selectedCosmetic.source === "EVENTO" && selectedCosmetic.event_end_date && (
                        <span className="event-timer"> · Hasta {new Date(selectedCosmetic.event_end_date).toLocaleDateString("es-ES")}</span>
                      )}
                    </div>
                    {selectedCosmetic.source === "TIENDA" && (
                      <a href="/tienda" className="btn-outline-sm" style={{ marginTop:"0.75rem", display:"inline-flex" }}>
                        <ShoppingCart size={13}/> Ver en la Tienda
                      </a>
                    )}
                  </div>
                );
              })()}

              <div className="cosmetic-modal-actions">
                {isOwned(selectedCosmetic.token) ? (
                  <>
                    <button className="btn btn-primary" onClick={() => handleEquip(selectedCosmetic)}>
                      {isEquipped(selectedCosmetic.token, selectedCosmetic.type) ? "Desequipar" : "Equipar"}
                    </button>
                    {isEquipped(selectedCosmetic.token, selectedCosmetic.type) && selectedCosmetic.type === "BANNER" && (
                      <button className="btn btn-secondary" onClick={() => setIsEditingBanner(true)}>
                        <Edit2 size={14}/> Editar Diseño
                      </button>
                    )}
                  </>
                ) : (
                  <button className="btn btn-secondary" disabled>
                    <Lock size={14}/> Bloqueado
                  </button>
                )}
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM MODAL ===== */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel">
            <AlertTriangle size={40} color="#ef4444" style={{ margin:"0 auto 1rem", display:"block" }}/>
            <h2 className="modal-title">Estás a punto de eliminar tu cuenta</h2>
            <p className="modal-desc">¿Estás seguro de hacerlo? Esta acción es <strong>irreversible</strong> y perderás todos tus datos, cosméticos y progreso.</p>
            <div className="modal-actions">
              <button className="btn btn-danger-solid" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? "Eliminando..." : "Sí, eliminar mi cuenta"}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>No, volver</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== UNLINK DISCORD MODAL ===== */}
      {showUnlinkDiscordModal && (
        <div className="modal-overlay" onClick={() => !unlinkingDiscord && setShowUnlinkDiscordModal(false)}>
          <div className="modal-box glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            {!unlinkingDiscord && (
              <button className="modal-close" onClick={() => setShowUnlinkDiscordModal(false)}><X size={18}/></button>
            )}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "0.5rem 0" }}>
              {/* Discord icon with warning overlay */}
              <div style={{ position: "relative", width: "72px", height: "72px" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(88,101,242,0.15)", border: "2px solid rgba(88,101,242,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DiscordIcon size={36} color="#5865F2" />
                </div>
                <div style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "26px", height: "26px", borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #18181b" }}>
                  <X size={14} color="#fff" />
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <h2 className="modal-title" style={{ marginBottom: "0.5rem" }}>Desvincular Discord</h2>
                {user.discord_username && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "0.75rem" }}>
                    <img src={user.discord_avatar ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} alt="" style={{ width: "28px", borderRadius: "50%" }} />
                    <span style={{ color: "#7289da", fontWeight: 600 }}>{user.discord_username}</span>
                  </div>
                )}
                <p className="modal-desc">Al desvincular tu cuenta de Discord:
                  <ul style={{ textAlign: "left", marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem", paddingLeft: "1.25rem" }}>
                    <li>Ya <strong>no podrás</strong> iniciar sesión con Discord.</li>
                    <li>El <strong>Avatar de Discord</strong> será desequipado si lo tenías activo.</li>
                    <li>Puedes volver a vincular cuando quieras.</li>
                  </ul>
                </p>
              </div>

              <div className="modal-actions" style={{ width: "100%" }}>
                <button className="btn btn-danger-solid" onClick={handleUnlinkDiscord} disabled={unlinkingDiscord} style={{ flex: 1 }}>
                  {unlinkingDiscord ? "Desvinculando..." : "Sí, desvincular"}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowUnlinkDiscordModal(false)} disabled={unlinkingDiscord} style={{ flex: 1 }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="config-layout container">
        {/* ===== SIDEBAR ===== */}
        <aside className="config-sidebar glass-panel">
          <div className="config-user-header">
            <img src={avatarSrc} alt={user.minecraft_username} className="config-avatar" style={{ imageRendering: avatarSrc?.includes('minotar.net') || avatarSrc?.includes('custom_face') ? 'pixelated' : 'auto' }}/>
            <div>
              <p className="config-username">{user.minecraft_username}</p>
              <p className="config-user-rank">{user.rank || "JUGADOR"}</p>
            </div>
          </div>
          <nav className="config-nav">
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`config-nav-item ${activeSection === id ? "active" : ""}`}
                onClick={() => setActiveSection(id)}>
                <Icon size={17}/><span>{label}</span>
                <ChevronRight size={13} className="config-chevron"/>
              </button>
            ))}
          </nav>
          <button className="config-nav-item config-logout" onClick={handleLogout}>
            <LogOut size={17}/><span>Cerrar Sesión</span>
          </button>
        </aside>

        {/* ===== CONTENT ===== */}
        <main className="config-content">

          {/* ======== GENERAL ======== */}
          {activeSection === "general" && (
            <div className="config-section">
              <h1 className="config-section-title">General</h1>

              {/* Profile preview con banner de fondo real */}
              <div className="profile-preview-card glass-panel">
                <div
                  className="preview-banner-bg"
                  style={bannerSrc ? { 
                    backgroundImage: `url(${bannerSrc})`,
                    backgroundPosition: `${user.banner_pos_x ?? 50}% ${user.banner_pos_y ?? 50}%`,
                    backgroundSize: `calc(100% * ${user.banner_scale ?? 1.0})`
                  } : {}}
                >
                  <div className="preview-banner-overlay"/>
                </div>
                <div className="preview-body">
                  <div className="preview-avatar-container">
                    <img src={avatarSrc} alt={user.minecraft_username} className="preview-avatar"
                      onError={e => { e.target.src = `https://minotar.net/helm/${user.minecraft_username}/96.png`; }}/>
                    {equippedFrameData && (
                      <img src={getImgSrc(equippedFrameData)} className="preview-frame-overlay" alt="Marco" />
                    )}
                  </div>
                  <div className="preview-info">
                    <h2 className="preview-username">{user.minecraft_username}</h2>
                    <p className="preview-id">#{user.id?.slice(0,4).toUpperCase() || "0000"}</p>
                    <div className="preview-actions">
                      <a href="/perfil" className="btn-outline-sm"><ExternalLink size={12}/> Ver perfil público</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sessions grid */}
              <div className="sessions-grid" style={{ marginTop:"1.25rem" }}>
                <div className="config-card glass-panel">
                  <div className="session-card-header"><Monitor size={16} color="#00bfff"/><span>Última sesión en el servidor</span></div>
                  <p className="session-server-name">Sin datos de sesión</p>
                  <p className="session-detail">Conéctate al servidor para ver tu historial.</p>
                </div>
                <div className="config-card glass-panel">
                  <div className="session-card-header"><Globe size={16} color="#00bfff"/><span>Última sesión web</span></div>
                  <div className="web-session-info">
                    <div className="wsession-row"><Globe size={13}/><span>Navegador actual</span></div>
                    <div className="wsession-row"><Monitor size={13}/><span>Windows Desktop</span></div>
                    <div className="wsession-row"><Clock size={13}/><span>{new Date().toLocaleString("es-ES")}</span></div>
                  </div>
                </div>
              </div>

              {/* Checklist de seguridad */}
              <div style={{ marginTop:"1.5rem" }}>
                <p className="section-label-lg">Checklist de seguridad</p>
                <p className="section-label-sub">Estado de vinculaciones y seguridad</p>
                <div className="config-card glass-panel" style={{ marginTop:"0.75rem", gap:"0" }}>
                  <div className="security-item">
                    <span>Email cargado</span>
                    <div className={`security-status ${user.email ? "ok" : "pending"}`}>
                      {user.email ? <><CheckCircle size={13}/> OK</> : <><XCircle size={13}/> Pendiente</>}
                    </div>
                  </div>
                  <div className="security-item" style={{ borderBottom:"none" }}>
                    <span>Discord vinculado</span>
                    <div className={`security-status ${user.discord_username ? "ok" : "pending"}`}>
                      {user.discord_username ? <><CheckCircle size={13}/> {user.discord_username}</> : <><XCircle size={13}/> Pendiente</>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial de nombres */}
              <div style={{ marginTop:"1.25rem" }}>
                <div className="config-card glass-panel">
                  <div className="session-card-header"><Hash size={16} color="#a1a1aa"/><span>Historial de nombres</span></div>
                  <p style={{ color:"#71717a", fontSize:"0.85rem" }}>
                    Nombre actual: <strong style={{ color:"#e4e4e7" }}>{user.minecraft_username}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======== SKIN ======== */}
          {activeSection === "skin" && (
            <div className="config-section">
              <h1 className="config-section-title">Mi Skin</h1>
              <p className="config-section-sub">Sube tu skin personalizada de Minecraft (.png)</p>

              <div className="config-card glass-panel" style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <h3>Subir nueva Skin</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                      Sube el archivo PNG de tu skin. Extraeremos tu cara automáticamente para mostrarla en el perfil y en los tops del servidor.
                      Si equipas un "Avatar de Tienda", este reemplazará la cara de tu skin en la web.
                    </p>
                    
                    <input 
                      type="file" 
                      accept="image/png" 
                      onChange={handleSkinUpload} 
                      style={{ display: "none" }} 
                      id="skin-upload"
                      disabled={uploadingSkin}
                    />
                    <label htmlFor="skin-upload" className="btn btn-primary" style={{ cursor: "pointer", display: "inline-flex" }}>
                      {uploadingSkin ? "Subiendo..." : "Seleccionar Archivo .PNG"}
                    </label>
                    {skinMsg && <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: skinMsg.startsWith("✅") ? "#10b981" : "#ef4444" }}>{skinMsg}</p>}
                  </div>
                  
                  {user.custom_skin_url && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "12px" }}>
                      <h4>Skin Actual</h4>
                      <img src={`https://visage.surgeplay.com/full/300/${user.minecraft_username}`} 
                           onError={(e) => { e.target.src = user.custom_face_url; e.target.style.width = '64px'; e.target.style.imageRendering = 'pixelated'; }}
                           alt="Skin" style={{ height: "200px" }} />
                      <a href={user.custom_skin_url} target="_blank" rel="noreferrer" className="btn-outline-sm">Ver Archivo</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======== COSMÉTICOS ======== */}
          {activeSection === "cosmeticos" && (
            <div className="config-section">
              <h1 className="config-section-title">Cosméticos</h1>
              <p className="config-section-sub">Equipa los cosméticos que tienes desbloqueados. Haz clic en cualquiera para ver detalles.</p>

              {/* Equipped preview row */}
              <div className="equipped-row glass-panel">
                <div className="equipped-slot">
                  <p className="equipped-slot-label">Banner activo</p>
                  <div className="equipped-slot-img banner-slot">
                    {equippedBannerData && getImgSrc(equippedBannerData) ? (
                      <div style={{ overflow: "hidden", width: "100%", height: "100%", borderRadius: "8px" }}>
                        <img src={getImgSrc(equippedBannerData)} alt="Banner" 
                          style={{ 
                            width:"100%", height:"100%", objectFit:"cover", 
                            objectPosition: `${user?.banner_pos_x ?? 50}% ${user?.banner_pos_y ?? 50}%`,
                            transform: `scale(${user?.banner_scale ?? 1.0})` 
                          }}/>
                      </div>
                    ) : <span className="slot-empty">Sin equipar</span>}
                  </div>
                </div>
                <div className="equipped-slot">
                  <p className="equipped-slot-label">Foto de perfil activa</p>
                  <div className="equipped-slot-img avatar-slot" style={{ position: "relative" }}>
                    <img src={avatarSrc} alt="Avatar" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%", imageRendering: avatarSrc?.includes('minotar.net') || avatarSrc?.includes('custom_face') ? 'pixelated' : 'auto' }}/>
                    {isDiscordFrame ? (
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: "50%", border: `3px solid ${user?.discord_color || '#5865F2'}`, boxSizing: "border-box", pointerEvents: "none" }}></div>
                    ) : equippedFrameData ? (
                      <img src={getImgSrc(equippedFrameData)} className="slot-frame-overlay" alt="Marco" />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="cosmetics-tabs-bar" style={{ marginTop:"1.5rem" }}>
                {COSM_TABS.map(t => (
                  <button key={t.id} className={`cosm-tab ${cosmTab === t.id ? "active" : ""}`}
                    onClick={() => setCosmTab(t.id)}>
                    {t.label}
                    <span className="cosm-tab-count">
                      {allCosmeticsWithDiscord.filter(c => c.type === t.id).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="cosm-grid">
                {allCosmeticsWithDiscord.filter(c => {
                  if (c.type !== cosmTab) return false;
                  // Los cosméticos de Discord solo se muestran si Discord está vinculado
                  if (c.source === "DISCORD" && !user?.discord_username) return false;
                  return true;
                }).length === 0 ? (
                  <p style={{ color:"#71717a", gridColumn:"1/-1", padding:"2rem 0" }}>No hay cosméticos de este tipo disponibles aún.</p>
                ) : allCosmeticsWithDiscord.filter(c => {
                  if (c.type !== cosmTab) return false;
                  if (c.source === "DISCORD" && !user?.discord_username) return false;
                  return true;
                }).map(c => {
                  const owned    = isOwned(c.token);
                  const equipped = isEquipped(c.token, c.type);
                  const img      = getImgSrc(c);
                  const fitStyle = c.type === "FRAME" ? "contain" : "cover";
                  const isDiscord = c.source === "DISCORD";
                  return (
                    <button key={c.id} className={`cosm-card ${owned ? "owned" : "locked"} ${equipped ? "equipped" : ""} ${isDiscord ? "discord-cosm" : ""}`}
                      onClick={() => openCosmeticModal(c)}>
                      <div className="cosm-card-img">
                        {img ? (
                          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                            <img src={img} alt={c.name} 
                              style={{ 
                                width:"100%", height:"100%", objectFit:fitStyle,
                                objectPosition: c.type === "BANNER" && equipped ? `${user?.banner_pos_x ?? 50}% ${user?.banner_pos_y ?? 50}%` : "50% 50%",
                                transform: c.type === "BANNER" && equipped ? `scale(${user?.banner_scale ?? 1.0})` : "scale(1.0)"
                              }}/>
                          </div>
                        ) : (
                          <div className={`cosm-card-placeholder ${isDiscord ? "discord-placeholder" : ""}`}>
                            {isDiscord ? <DiscordIcon size={32} color="#5865F2"/> : c.type[0]}
                          </div>
                        )}
                        {!owned && <div className="cosm-lock-overlay"><Lock size={22} color="#fff"/></div>}
                        {equipped && <div className="cosm-equipped-badge">Equipado</div>}
                      </div>
                      <p className="cosm-card-name">{c.name}</p>
                      {/* Badge de origen */}
                      {isDiscord && (
                        <div className="cosm-source-badge discord-badge">
                          <DiscordIcon size={11} color="#fff"/>
                          <span>Discord</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======== MI CUENTA ======== */}
          {activeSection === "cuenta" && (
            <div className="config-section">
              <h1 className="config-section-title">Mi Cuenta</h1>
              <p className="config-section-sub">Administra tu información personal</p>
              <div className="config-card glass-panel">
                <div className="config-card-header"><h3>Información de la cuenta</h3></div>
                <div className="config-field">
                  <label>Usuario de Minecraft</label>
                  <div className="config-field-value readonly">{user.minecraft_username}</div>
                  <p className="config-field-hint">El nick no se puede cambiar desde aquí.</p>
                </div>
                <div className="config-field">
                  <label>Correo Electrónico</label>
                  {editMode ? (
                    <div className="config-edit-row">
                      <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                        className="config-input" placeholder="tu@correo.com"/>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveEmail} disabled={saving}>
                        <Save size={13}/> {saving ? "Guardando..." : "Guardar"}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>Cancelar</button>
                    </div>
                  ) : (
                    <div className="config-edit-row">
                      <div className="config-field-value">{user.email || "Sin correo registrado"}</div>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>
                        <Edit2 size={13}/> Editar
                      </button>
                    </div>
                  )}
                  {saveMsg && <p className="config-save-msg">{saveMsg}</p>}
                </div>
                <div className="config-field">
                  <label>Rango</label>
                  <div className="config-field-value rank-badge-display">{user.rank || "JUGADOR"}</div>
                </div>
                <div className="config-field">
                  <label>Miembro desde</label>
                  <div className="config-field-value">
                    {new Date(user.created_at).toLocaleDateString("es-ES", { year:"numeric", month:"long", day:"numeric" })}
                  </div>
                </div>

                {/* Discord link section */}
                <div className="config-field">
                  <label>Cuenta de Discord</label>
                  {user.discord_username ? (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={user.discord_avatar ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} alt="Discord" style={{ width: "32px", borderRadius: "50%" }} />
                        <div className="config-field-value" style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"#7289da" }}>
                          {user.discord_username}
                        </div>
                        <span style={{ fontSize:"0.8rem", color:"#10b981" }}>✓ Vinculado</span>
                      </div>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setShowUnlinkDiscordModal(true)}
                        style={{ borderColor: "#ef4444", color: "#ef4444", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                      >
                        Desvincular
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                      <p className="config-field-hint">Vincula tu cuenta de Discord para acceder a beneficios exclusivos en el servidor.</p>
                      <a
                        href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI.replace("/api/discord/callback", "/oauth/discord"))}&response_type=code&scope=identify`}
                        className="btn-discord"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                        Vincular con Discord
                      </a>
                      {discordMsg && <p style={{ fontSize:"0.85rem", color: discordMsg.startsWith("✅") ? "#10b981" : "#ef4444" }}>{discordMsg}</p>}
                    </div>
                  )}
                </div>

              </div>

              <div className="config-card glass-panel" style={{ marginTop:"1.25rem" }}>
                <div className="config-card-header"><h3>Estadísticas</h3></div>
                <div className="stats-grid">
                  {[
                    { v: Math.floor((user.playtime_minutes||0)/60)+"h", l: "Jugado" },
                    { v: "$"+(user.balance||0), l: "Balance" },
                    { v: (user.cosmetics_unlocked||[]).length, l: "Cosméticos" },
                    { v: user.rank||"—", l: "Rango" },
                  ].map(s => (
                    <div key={s.l} className="stat-item">
                      <span className="stat-value">{s.v}</span>
                      <span className="stat-label">{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="config-card glass-panel danger-zone" style={{ marginTop:"1.25rem" }}>
                <div className="config-card-header"><h3>⚠️ Zona de Peligro</h3></div>
                <p style={{ color:"#a1a1aa", fontSize:"0.9rem", marginBottom:"1rem" }}>
                  Esta acción es permanente e irreversible. Perderás todos tus datos.
                </p>
                <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={15}/> Eliminar mi cuenta
                </button>
              </div>
            </div>
          )}

          {/* ======== SEGURIDAD ======== */}
          {activeSection === "seguridad" && (
            <div className="config-section">
              <h1 className="config-section-title">Seguridad</h1>
              <p className="config-section-sub">Estado de vinculaciones y seguridad de tu cuenta</p>
              <div className="config-card glass-panel">
                <div className="config-card-header"><h3>Checklist de Seguridad</h3></div>
                {[
                  { label:"Cuenta creada",     ok: true },
                  { label:"Email registrado",  ok: !!user.email },
                  { label:"Discord vinculado", ok: !!user.discord_username, extra: user.discord_username },
                  { label:"Estado de cuenta",  ok: !user.is_banned, danger: user.is_banned, dangerLabel:"Baneado" },
              ].map(item => (
                <div key={item.label} className="security-item">
                  <div className="security-label"><Shield size={15}/><span>{item.label}</span></div>
                  <div className={`security-status ${item.ok ? "ok" : item.danger ? "danger" : "pending"}`}>
                    {item.ok ? <><CheckCircle size={14}/> {item.extra || "OK"}</> : item.danger ? <><XCircle size={14}/> {item.dangerLabel}</> : <><XCircle size={14}/> Pendiente</>}
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}

          {/* ======== NOTIFICACIONES ======== */}
          {activeSection === "notificaciones" && (
            <div className="config-section">
              <h1 className="config-section-title">Notificaciones</h1>
              <p className="config-section-sub">Controla qué avisos quieres recibir</p>
              <div className="config-card glass-panel">
                <div className="config-card-header"><h3>Preferencias</h3></div>
                {["Actualizaciones del servidor","Nuevos cosméticos disponibles","Alertas de sanciones","Novedades de la comunidad"].map(item => (
                  <div key={item} className="notif-item">
                    <span>{item}</span>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked/>
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default function Configuracion() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#a1a1aa" }}>Cargando configuración...</div>}>
      <ConfiguracionContent />
    </Suspense>
  );
}
