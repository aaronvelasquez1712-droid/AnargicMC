"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, LogIn, MessageSquare, Trash2, Edit2, ChevronLeft, ChevronRight, UserPlus, UserCheck, Clock as ClockIcon, X } from "lucide-react";
import { supabase } from "@/utils/supabase";
import "./perfil.css";

// Necesario envolver en Suspense por useSearchParams
export default function Perfil() {
  return (
    <Suspense fallback={<div className="profile-container container"><h2 style={{textAlign:"center", padding:"3rem"}}>Cargando perfil...</h2></div>}>
      <PerfilContent />
    </Suspense>
  );
}

function PerfilContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [currentUser, setCurrentUser] = useState(null); // The logged in user
  const [user, setUser] = useState(null); // The profile being viewed
  const [discordLink, setDiscordLink] = useState(null);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [unlinkingDiscord, setUnlinkingDiscord] = useState(false);
  
  const [cosmetics, setCosmetics] = useState([]);
  const [userCosmetics, setUserCosmetics] = useState([]);
  const [playerRole, setPlayerRole] = useState(null); // Rol dinámico desde server_roles
  const [activeTab, setActiveTab] = useState("BANNER"); // 'BANNER', 'FRAME', 'PROFILE_PIC'
  const [loading, setLoading] = useState(true);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  // Friend system state
  const [friendStatus, setFriendStatus] = useState(null); // 'NONE', 'PENDING', 'ACCEPTED'
  const [commentPage, setCommentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const COMMENTS_PER_PAGE = 10;

  const fetchComments = useCallback(async (profileId, page = 1) => {
    const from = (page - 1) * COMMENTS_PER_PAGE;
    const to = from + COMMENTS_PER_PAGE - 1;
    
    const { data, count } = await supabase
      .from("profile_comments")
      .select("*, author:users!profile_comments_author_user_id_fkey(minecraft_username, equipped_profile_pic_url, equipped_frame_url, custom_face_url)", { count: "exact" })
      .eq("profile_user_id", profileId)
      .order("created_at", { ascending: false })
      .range(from, to);
      
    if (data) setComments(data);
    if (count !== null) setTotalComments(count);
  }, []);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;
    const { error } = await supabase.from("profile_comments").insert({
      profile_user_id: user.id,
      author_user_id: currentUser.id,
      content: newComment.trim().substring(0, 500)
    });
    if (!error) {
      setNewComment("");
      fetchComments(user.id, commentPage);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase.from("profile_comments").delete().eq("id", commentId);
    if (!error) {
      fetchComments(user.id, commentPage);
    }
  };

  useEffect(() => {
    async function fetchProfileData() {
      try {
        // 1. Get logged in user
        let localUser = null;
        const storedUser = localStorage.getItem("anargic_user");
        if (storedUser) {
          const { nick } = JSON.parse(storedUser);
          const { data: cUser } = await supabase.from("users").select("*").eq("minecraft_username", nick).limit(1);
          if (cUser && cUser.length > 0) {
            setCurrentUser(cUser[0]);
            localUser = cUser[0];
          }
        }

        // 2. Determine whose profile to show
        const profileNick = searchParams.get("u") || (localUser ? localUser.minecraft_username : null);
        
        if (!profileNick) {
          setLoading(false);
          return;
        }

        const { data: users } = await supabase
          .from("users")
          .select("*")
          .ilike("minecraft_username", profileNick)
          .limit(1);
        
        const profileUser = users && users.length > 0 ? users[0] : null;
        setUser(profileUser);

        if (profileUser) {
          setUserCosmetics(profileUser.cosmetics_unlocked || []);

          // Cargar rol dinámico desde server_roles si el usuario tiene role_id
          if (profileUser.role_id) {
            const { data: roleData } = await supabase
              .from("server_roles")
              .select("id, name, tag, tag_color, color")
              .eq("id", profileUser.role_id)
              .limit(1);
            if (roleData && roleData.length > 0) setPlayerRole(roleData[0]);
          } else {
            setPlayerRole(null);
          }
          
          // Get their discord links
          const { data: dLinks } = await supabase.from("discord_links").select("*").eq("user_id", profileUser.id).limit(1);
          if (dLinks && dLinks.length > 0) setDiscordLink(dLinks[0]);

          // Get comments
          await fetchComments(profileUser.id, 1);
          
          // Get friendship status
          if (localUser && localUser.id !== profileUser.id) {
            const { data: friendship } = await supabase
              .from("friends")
              .select("status")
              .or(`and(user_id_1.eq.${localUser.id},user_id_2.eq.${profileUser.id}),and(user_id_1.eq.${profileUser.id},user_id_2.eq.${localUser.id})`)
              .limit(1);
            if (friendship && friendship.length > 0) {
              setFriendStatus(friendship[0].status);
            } else {
              setFriendStatus("NONE");
            }
          }
        }

        // 3. Fetch ALL cosmetics
        const { data: allCosmetics } = await supabase.from("cosmetics").select("*");
        setCosmetics(allCosmetics || []);
        
      } catch (e) {
        console.error("Error fetching profile data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [searchParams, fetchComments]);

  // userCosmetics is now an array of token strings e.g. ['banner_neon', 'perfil_creeper']
  const getOwnedCosmetics = (type) => {
    return cosmetics.filter(
      (c) => c.type === type && userCosmetics.includes(String(c.token))
    );
  };

  const isOwned = (token) => userCosmetics.includes(String(token));

  const isEquipped = (token, type) => {
    const sToken = String(token);
    if (type === "BANNER") return user?.equipped_banner === sToken;
    if (type === "PROFILE_PIC") return user?.equipped_profile_pic === sToken;
    if (type === "FRAME") return user?.equipped_frame === sToken;
    return false;
  };

  const handleAddFriend = async () => {
    if (!currentUser || !user) return;
    const { error } = await supabase.from("friends").insert({
      user_id_1: currentUser.id,
      user_id_2: user.id,
      status: 'PENDING'
    });
    
    if (error) {
      console.error("Error adding friend:", error);
      alert("Error al enviar solicitud: " + error.message);
      return;
    }
    
    setFriendStatus('PENDING');
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Nueva solicitud de amistad",
      message: `${currentUser.minecraft_username} quiere ser tu amigo.`,
      type: "INFO"
    });
  };

  // Get equipped cosmetic metadata and inject dynamic discord data
  const getEquippedCosmetic = (type) => {
    let token = null;
    if (type === "BANNER") token = user?.equipped_banner;
    if (type === "PROFILE_PIC") token = user?.equipped_profile_pic;
    if (type === "FRAME") token = user?.equipped_frame;
    if (!token) return null;

    // Caso especial: avatar de Discord (cosmético sintético, no existe en la DB)
    if (token === "discord_avatar" && type === "PROFILE_PIC" && user?.discord_username) {
      return {
        token: "discord_avatar",
        type: "PROFILE_PIC",
        source: "DISCORD",
        image_url: user.discord_avatar
          ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png?size=1024`
          : `https://cdn.discordapp.com/embed/avatars/0.png`,
      };
    }
    
    let cosmetic = cosmetics.find((c) => String(c.token) === token && c.type === type);
    if (!cosmetic) return null;

    // Inject dynamic discord data for other DISCORD-sourced cosmetics
    if (cosmetic.source === "DISCORD" && discordLink) {
      cosmetic = { ...cosmetic }; // clone
      if (type === "PROFILE_PIC" && discordLink.discord_avatar) {
        cosmetic.image_url = `https://cdn.discordapp.com/avatars/${discordLink.discord_id}/${discordLink.discord_avatar}.png?size=1024`;
      }
      if (type === "BANNER" && discordLink.discord_banner) {
        cosmetic.image_url = `https://cdn.discordapp.com/banners/${discordLink.discord_id}/${discordLink.discord_banner}.png?size=1024`;
      }
    }
    return cosmetic;
  };

  const getImgSrc = (c) => c?.image_url || (c?.file_path ? `${process.env.NEXT_PUBLIC_COSMETICS_URL}${c.file_path}` : null);

  const equippedBanner = getEquippedCosmetic("BANNER");
  const equippedProfilePic = getEquippedCosmetic("PROFILE_PIC");
  const equippedFrame = getEquippedCosmetic("FRAME");

  // Avatar with skin fallback priority:
  // 1. Equipped Tienda photo (from cosmetics)
  // 2. Custom face from uploaded skin
  // 3. Steve (Minecraft default)
  const resolvedAvatarSrc = equippedProfilePic
    ? getImgSrc(equippedProfilePic)
    : (user?.custom_face_url || `https://minotar.net/helm/${user?.minecraft_username || 'Steve'}/96.png`);

  const isDiscordFrame = equippedFrame?.source === "DISCORD" && discordLink?.discord_color;

  if (loading) {
    return (
      <div className="profile-container container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <h2>Cargando perfil...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: "1rem" }}>
        <h2>No has iniciado sesión</h2>
        <a href="/login" className="btn btn-primary"><LogIn size={18} /> Iniciar Sesión</a>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("anargic_user");
    window.location.href = "/";
  };

  const handleUnlinkDiscord = async () => {
    setUnlinkingDiscord(true);
    const { error } = await supabase.from("users").update({ discord_id: null, discord_username: null, discord_avatar: null }).eq("id", user.id);
    if (!error) {
      setUser({...user, discord_id: null, discord_username: null, discord_avatar: null});
      setShowUnlinkModal(false);
    } else {
      alert("Hubo un error al desvincular la cuenta.");
    }
    setUnlinkingDiscord(false);
  };

  return (
    <div className="profile-container container">
      {/* ===== UNLINK DISCORD MODAL ===== */}
      {showUnlinkModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
          onClick={() => !unlinkingDiscord && setShowUnlinkModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "rgba(24,24,27,0.97)", border: "1px solid rgba(88,101,242,0.3)", borderRadius: "16px", padding: "2rem", maxWidth: "400px", width: "90%", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            {!unlinkingDiscord && (
              <button onClick={() => setShowUnlinkModal(false)} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#71717a" }}><X size={18}/></button>
            )}
            <div style={{ position: "relative", width: "64px", height: "64px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(88,101,242,0.15)", border: "2px solid rgba(88,101,242,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              </div>
              <div style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "22px", height: "22px", borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #18181b" }}>
                <X size={12} color="#fff" />
              </div>
            </div>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Desvincular Discord</h2>
            {user.discord_username && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={user.discord_avatar ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} alt="" style={{ width: "24px", borderRadius: "50%" }} />
                <span style={{ color: "#7289da", fontWeight: 600 }}>{user.discord_username}</span>
              </div>
            )}
            <p style={{ color: "#a1a1aa", fontSize: "0.9rem", textAlign: "center", margin: 0 }}>Ya no podrás iniciar sesión con Discord. Puedes volver a vincularla cuando quieras.</p>
            <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
              <button onClick={handleUnlinkDiscord} disabled={unlinkingDiscord} style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                {unlinkingDiscord ? "Desvinculando..." : "Sí, desvincular"}
              </button>
              <button onClick={() => setShowUnlinkModal(false)} disabled={unlinkingDiscord} style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: "#e4e4e7", border: "1px solid rgba(255,255,255,0.1)", padding: "0.6rem", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {/* Banner Section */}
      <div className="profile-banner glass-panel">
        <div className="banner-placeholder" style={{ overflow: "hidden" }}>
          {equippedBanner ? (
            <img 
              src={getImgSrc(equippedBanner)} 
              alt="Banner" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover",
                objectPosition: `${user.banner_pos_x ?? 50}% ${user.banner_pos_y ?? 50}%`,
                transform: `scale(${user.banner_scale ?? 1.0})`
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <span className="image-text">Sin banner equipado</span>
          )}
        </div>
        {currentUser && currentUser.id === user.id && (
          <button onClick={handleLogout} className="btn btn-secondary" style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}>Cerrar Sesión</button>
        )}
        
        {/* Profile Info Overlay */}
        <div className="profile-info-overlay">
          <div className="profile-avatar-wrapper">
            <div className="profile-frame">
              {isDiscordFrame ? (
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: `4px solid ${discordLink.discord_color}`, boxSizing: "border-box" }}></div>
              ) : equippedFrame ? (
                <img src={getImgSrc(equippedFrame)} alt="Frame" className="frame-img" />
              ) : (
                <div className="frame-placeholder"></div>
              )}
            </div>
            <div className="profile-avatar">
              <img 
                src={resolvedAvatarSrc}
                alt="Avatar"
                style={{ imageRendering: resolvedAvatarSrc?.includes("minotar.net") || resolvedAvatarSrc?.includes("custom_face") ? "pixelated" : "auto" }}
                onError={(e) => { e.target.src = `https://minotar.net/helm/Steve/100.png`; }}
              />
            </div>
          </div>
          
          <div className="profile-details">
            <h1 className="profile-username">
              {user.minecraft_username}
              {playerRole ? (
                <span
                  className="role-badge"
                  style={{
                    '--role-color': playerRole.color || playerRole.tag_color || '#00bfff',
                  }}
                >
                  [{playerRole.tag}]
                </span>
              ) : user.rank && user.rank !== 'USER' ? (
                <span className="rank-badge mvp">{user.rank}</span>
              ) : null}
            </h1>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.5rem" }}>
              <p className="profile-status" style={{ margin: 0 }}>{user.is_banned ? "Baneado" : "Cuenta activa"}</p>
              
              {/* Friend Button */}
              {currentUser && currentUser.id !== user.id && (
                <div className="friend-actions">
                  {friendStatus === 'NONE' && (
                    <button className="btn btn-primary btn-sm" onClick={handleAddFriend} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <UserPlus size={16} /> Añadir a Amigos
                    </button>
                  )}
                  {friendStatus === 'PENDING' && (
                    <button className="btn btn-secondary btn-sm" disabled style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: 0.7 }}>
                      <ClockIcon size={16} /> Solicitud Enviada
                    </button>
                  )}
                  {friendStatus === 'ACCEPTED' && (
                    <button className="btn btn-secondary btn-sm" disabled style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderColor: '#10b981', color: '#10b981' }}>
                      <UserCheck size={16} /> Amigos
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Stats Column */}
        <aside className="profile-sidebar">
          <div className="glass-panel stat-box">
            <h3>Estadísticas</h3>
            <ul className="stat-list">
              <li><span>Dinero:</span> <span>${user.balance}</span></li>
              <li><span>Tiempo Jugado:</span> <span>{Math.floor(user.playtime_minutes / 60)}h {user.playtime_minutes % 60}m</span></li>
              <li><span>Rango:</span> <span>{user.rank}</span></li>
              <li><span>Miembro desde:</span> <span>{new Date(user.created_at).toLocaleDateString()}</span></li>
            </ul>
          </div>

          {currentUser && currentUser.id === user.id && (
            <div className="glass-panel stat-box" style={{ marginTop: "1rem" }}>
              <h3>Cuentas Vinculadas</h3>
              {user.discord_username ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginTop: "1rem", padding: "10px", background: "rgba(88, 101, 242, 0.1)", borderRadius: "8px", border: "1px solid rgba(88, 101, 242, 0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={user.discord_avatar ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} alt="Discord" style={{ width: "40px", borderRadius: "50%" }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: "bold", color: "#fff" }}>{user.discord_username}</p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#10b981" }}>Vinculada correctamente</p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => setShowUnlinkModal(true)}
                    style={{ borderColor: "#ef4444", color: "#ef4444", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                  >
                    Desvincular
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.9rem", color: "#a1a1aa", marginBottom: "1rem" }}>Vincula tu cuenta de Discord para poder iniciar sesión con ella.</p>
                  <button className="btn btn-primary" onClick={() => {
                    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
                    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI.replace("/api/discord/callback", "/oauth/discord");
                    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
                  }} style={{ width: "100%", background: "#5865F2", border: "none" }}>
                    Conectar Discord
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Cosmetics Column */}
        <main className="profile-cosmetics">
          <div className="glass-panel cosmetics-box">
            <div className="cosmetics-header">
              <h2>Cosméticos de {user.minecraft_username}</h2>
              <div className="cosmetics-tabs">
                <button className={`tab ${activeTab === "BANNER" ? "active" : ""}`} onClick={() => setActiveTab("BANNER")}>Banners</button>
                <button className={`tab ${activeTab === "FRAME" ? "active" : ""}`} onClick={() => setActiveTab("FRAME")}>Marcos</button>
                <button className={`tab ${activeTab === "PROFILE_PIC" ? "active" : ""}`} onClick={() => setActiveTab("PROFILE_PIC")}>Fotos de Perfil</button>
              </div>
            </div>
            
            <div className="cosmetics-grid">
              {getOwnedCosmetics(activeTab).length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>
                  <Lock size={32} color="#52525b" style={{ margin: "0 auto 0.75rem", display: "block" }} />
                  <p style={{ color: "#71717a" }}>Este usuario no tiene cosméticos públicos en esta categoría.</p>
                </div>
              ) : (
                getOwnedCosmetics(activeTab).map((c) => {
                  const token = c.token;
                  const equipped = isEquipped(token, activeTab);
                  let imgSrc = getImgSrc(c);
                  const isDiscord = c.source === "DISCORD";
                  if (isDiscord && discordLink) {
                    if (c.type === "PROFILE_PIC" && discordLink.discord_avatar) imgSrc = `https://cdn.discordapp.com/avatars/${discordLink.discord_id}/${discordLink.discord_avatar}.png?size=1024`;
                    if (c.type === "BANNER" && discordLink.discord_banner) imgSrc = `https://cdn.discordapp.com/banners/${discordLink.discord_id}/${discordLink.discord_banner}.png?size=512`;
                  }

                  return (
                    <div key={c.id} className={`cosmetic-item ${equipped ? "equipped" : ""} ${isDiscord ? "discord-cosm" : ""}`} style={{ position: "relative" }}>
                      <div className="cosmetic-preview">
                        {imgSrc ? (
                          <img 
                            src={imgSrc} 
                            alt={c.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <span style={{ color: isDiscord ? "#5865F2" : "#71717a", fontSize: "0.75rem" }}>{c.type}</span>
                        )}
                      </div>
                      <p>{c.name}</p>
                      
                      {isDiscord && (
                        <div className="cosm-source-badge discord-badge" style={{ position: "absolute", top: "4px", right: "4px" }}>
                          <span style={{ fontSize: "10px" }}>Discord</span>
                        </div>
                      )}
                      
                      {equipped ? (
                        <span className="status">Equipado</span>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Comentarios */}
          <div className="comments-box glass-panel">
            <div className="comments-header">
              <MessageSquare size={20} color="#00bfff" />
              <h2>Muro ({totalComments})</h2>
            </div>
            
            {currentUser ? (
              <form onSubmit={handlePostComment} className="comment-form">
                <input 
                  type="text" 
                  className="comment-input-field" 
                  placeholder="Escribe un comentario público..." 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)}
                  maxLength={500}
                />
                <button type="submit" className="btn-send-comment" disabled={!newComment.trim()}>Enviar</button>
              </form>
            ) : (
              <p style={{ color: "#a1a1aa", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Inicia sesión para dejar un comentario.</p>
            )}

            <div className="comments-list">
              {comments.length === 0 ? (
                <p style={{ color: "#71717a", textAlign: "center", padding: "1rem" }}>No hay comentarios aún. ¡Sé el primero!</p>
              ) : comments.map(comment => {
                const isAuthor = currentUser && currentUser.id === comment.author_user_id;
                const isProfileOwner = currentUser && currentUser.id === user.id;
                const canDelete = isAuthor || isProfileOwner;
                
                        const imgSrc = comment.author?.equipped_profile_pic_url
                          ? comment.author.equipped_profile_pic_url
                          : (comment.author?.custom_face_url || `https://minotar.net/helm/${comment.author?.minecraft_username || 'Steve'}/64.png`);
                        return (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-avatar-wrapper" style={{ position: "relative" }}>
                              <img 
                                src={imgSrc}
                                alt="Avatar" 
                                className="comment-avatar"
                                style={{ imageRendering: imgSrc?.includes("minotar.net") || imgSrc?.includes("custom_face") ? "pixelated" : "auto" }}
                                onError={(e) => { e.target.src = "https://minotar.net/helm/Steve/64.png"; }}
                              />
                      {comment.author?.equipped_frame_url && (
                        <img
                          src={comment.author.equipped_frame_url}
                          alt=""
                          style={{ position: "absolute", top: "-10%", left: "-10%", width: "120%", height: "120%", pointerEvents: "none" }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                    
                    <div className="comment-content-wrapper">
                      <div className="comment-meta">
                        <a href={`/perfil?u=${comment.author?.minecraft_username}`} className="comment-author-link">
                          {comment.author?.minecraft_username || "Usuario Desconocido"}
                        </a>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                    </div>
                    
                    {canDelete && (
                      <button onClick={() => handleDeleteComment(comment.id)} className="delete-comment-btn" title="Eliminar comentario">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {totalComments > COMMENTS_PER_PAGE && (
              <div className="comments-pagination">
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={commentPage === 1}
                  onClick={() => { setCommentPage(p => p - 1); fetchComments(user.id, commentPage - 1); }}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span>Página {commentPage} de {Math.ceil(totalComments / COMMENTS_PER_PAGE)}</span>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={commentPage >= Math.ceil(totalComments / COMMENTS_PER_PAGE)}
                  onClick={() => { setCommentPage(p => p + 1); fetchComments(user.id, commentPage + 1); }}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
