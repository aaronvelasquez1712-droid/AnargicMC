"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LogIn, MessageSquare, Edit2, Shield, Swords, Skull, Trophy } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { getAvatarSrc, getFrameSrc } from "@/utils/avatar";
import "./perfil-movil.css";

export default function MovilPerfilPage() {
  return (
    <Suspense fallback={<div className="m-loading">Cargando perfil...</div>}>
      <MovilPerfilContent />
    </Suspense>
  );
}

function MovilPerfilContent() {
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("BANNER");
  const [cosmetics, setCosmetics] = useState([]);
  const [userCosmetics, setUserCosmetics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const stored = localStorage.getItem("anargic_user");
      let cUser = null;
      if (stored) {
        const { nick } = JSON.parse(stored);
        const { data: users } = await supabase.from("users").select("*").eq("minecraft_username", nick).limit(1);
        if (users && users.length > 0) cUser = users[0];
      }
      setCurrentUser(cUser);

      const targetNick = searchParams.get("nick") || cUser?.minecraft_username;
      if (targetNick) {
        const { data: targetUser } = await supabase.from("users").select("*").eq("minecraft_username", targetNick).limit(1);
        if (targetUser && targetUser.length > 0) {
          setUser(targetUser[0]);
          
          const { data: cosm } = await supabase.from("cosmetics").select("*");
          if (cosm) setCosmetics(cosm);
          
          const { data: userCosm } = await supabase.from("user_cosmetics").select("*").eq("user_id", targetUser[0].id);
          if (userCosm) setUserCosmetics(userCosm);
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [searchParams]);

  if (loading) return <div className="m-loading">Cargando datos...</div>;

  if (!user) {
    return (
      <div className="m-unauth">
        <LogIn size={48} className="m-unauth-icon" />
        <h2>Inicia Sesión</h2>
        <p>Debes ingresar para ver tu perfil móvil.</p>
        <button onClick={() => window.location.href="/login"} className="m-btn-login">Ir al Login</button>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === user.id;

  const handleEquip = async (cosmeticId, type, url) => {
    if (!isOwnProfile) return;
    const updateField = type === "BANNER" ? "equipped_banner_url" : type === "FRAME" ? "equipped_frame_url" : "equipped_profile_pic_url";
    await supabase.from("users").update({ [updateField]: url }).eq("id", user.id);
    setUser({ ...user, [updateField]: url });
  };

  const filteredCosmetics = cosmetics.filter(c => c.type === activeTab);

  return (
    <div className="movil-perfil-container animate-fade-in">
      <div 
        className="m-perfil-banner"
        style={{ backgroundImage: `url(${user.equipped_banner_url || 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1000'})` }}
      >
        <div className="m-perfil-banner-overlay"></div>
      </div>

      <div className="m-perfil-header">
        <div className="m-avatar-wrapper">
          <img 
            src={getAvatarSrc(user)} 
            className="m-avatar" 
          />
          {user.equipped_frame_url && (
            <img src={getFrameSrc(user)} className="m-avatar-frame" />
          )}
        </div>
        <h1>{user.minecraft_username}</h1>
        <div className="m-rank-badge">
          {user.rank === 'admin' ? 'Administrador' : user.rank === 'mod' ? 'Moderador' : 'Usuario'}
        </div>
      </div>

      <div className="m-stats-grid">
        <div className="m-stat-box">
          <Swords size={20} className="stat-icon kills" />
          <span className="stat-val">{user.kills}</span>
          <span className="stat-lbl">Kills</span>
        </div>
        <div className="m-stat-box">
          <Skull size={20} className="stat-icon deaths" />
          <span className="stat-val">{user.deaths}</span>
          <span className="stat-lbl">Deaths</span>
        </div>
        <div className="m-stat-box">
          <Trophy size={20} className="stat-icon score" />
          <span className="stat-val">{Math.max(0, user.kills - user.deaths)}</span>
          <span className="stat-lbl">Score</span>
        </div>
      </div>

      <div className="m-perfil-section">
        <h2>Inventario</h2>
        
        <div className="m-tabs">
          <button className={`m-tab ${activeTab === "BANNER" ? "active" : ""}`} onClick={() => setActiveTab("BANNER")}>Banners</button>
          <button className={`m-tab ${activeTab === "FRAME" ? "active" : ""}`} onClick={() => setActiveTab("FRAME")}>Marcos</button>
          <button className={`m-tab ${activeTab === "PROFILE_PIC" ? "active" : ""}`} onClick={() => setActiveTab("PROFILE_PIC")}>Fotos</button>
        </div>

        <div className="m-cosmetics-grid">
          {filteredCosmetics.map(c => {
            const owns = userCosmetics.some(uc => uc.cosmetic_id === c.id);
            const isEquipped = (activeTab === "BANNER" && user.equipped_banner_url === c.image_url) ||
                               (activeTab === "FRAME" && user.equipped_frame_url === c.image_url) ||
                               (activeTab === "PROFILE_PIC" && user.equipped_profile_pic_url === c.image_url);

            return (
              <div key={c.id} className={`m-cosmetic-card ${owns ? 'owned' : 'locked'}`}>
                <div className="m-cosmetic-img">
                  <img src={c.image_url} alt={c.name} />
                </div>
                <h4>{c.name}</h4>
                {owns ? (
                  <button 
                    className={`m-equip-btn ${isEquipped ? 'equipped' : ''}`}
                    onClick={() => handleEquip(c.id, c.type, c.image_url)}
                  >
                    {isEquipped ? 'Equipado' : 'Equipar'}
                  </button>
                ) : (
                  <button className="m-buy-btn" disabled>Comprar</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
