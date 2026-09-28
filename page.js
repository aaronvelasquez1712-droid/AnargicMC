"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, MessageCircle, Server, Users, Shield, ArrowRight, Gamepad2, Globe, Sword, Info } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { getAvatarSrc, getFrameSrc } from "@/utils/avatar";
import "./page.css";

export default function Home() {
  const [latestMembers, setLatestMembers] = useState([]);

  useEffect(() => {
    // Fetch latest registered members for the "Últimos Miembros" section
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("users")
        .select("minecraft_username, created_at, equipped_profile_pic, equipped_frame, custom_face_url")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (data) {
        setLatestMembers(data);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div className="home-container">
      {/* ── HERO SECTION ── */}
      <section className="hero">
        <div className="hero-content animate-fade-in">
          <div className="hero-logo-container">
            <h1 className="hero-logo-text">
              <span className="logo-white">ANARGIC</span><span className="logo-blue">MC</span>
            </h1>
          </div>
          <p className="hero-subtitle">
            Únete a la red de Minecraft líder en Latinoamérica.<br/>
            Descubre una experiencia única y sin límites.
          </p>
          <div className="hero-actions">
            <button className="btn btn-glass copy-ip" onClick={() => navigator.clipboard.writeText("anargicmc.play.hosting")}>
              <span className="copy-icon"><Copy size={18} /></span>
              <span>anargicmc.play.hosting</span>
            </button>
            <Link href="https://discord.gg/9bBBrqafVd" target="_blank" className="btn btn-discord">
              <span className="discord-icon"><MessageCircle size={18} /></span> Unirse al Discord
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN DE INFORMACIÓN ── */}
      <section className="info-section">
        <div className="container">
          <div className="section-header">
            <Info size={32} color="#a855f7" />
            <h2 className="section-title">¿Qué Ofrecemos?</h2>
            <p className="section-desc">Todo lo que necesitas saber sobre nuestra comunidad.</p>
          </div>
          <div className="info-grid">
            <div className="info-card glass-panel">
              <div className="info-icon"><Shield size={36} color="#00bfff" /></div>
              <h3>Survival Custom</h3>
              <p>Disfruta de una economía balanceada, clanes, protecciones de terreno y eventos diarios. Ideal para jugar con amigos y construir tu imperio.</p>
            </div>
            <div className="info-card glass-panel">
              <div className="info-icon"><Sword size={36} color="#ef4444" /></div>
              <h3>Anarquía Total</h3>
              <p>Sin reglas, sin límites, sin piedad. El lugar perfecto para los amantes del peligro, el grifeo y la supervivencia extrema.</p>
            </div>
            <div className="info-card glass-panel">
              <div className="info-icon"><Gamepad2 size={36} color="#10b981" /></div>
              <h3>Minijuegos</h3>
              <p>Compite en partidas rápidas y llenas de acción. Contamos con diversas modalidades para probar tu habilidad y divertirte al máximo.</p>
            </div>
            <div className="info-card glass-panel">
              <div className="info-icon"><Users size={36} color="#f59e0b" /></div>
              <h3>Staff Activo 24/7</h3>
              <p>Nuestra comunidad está respaldada por un equipo de moderación siempre disponible para ayudarte, resolver dudas y mantener un ambiente sano.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN DE MODALIDADES ── */}
      <section className="servers-section">
        <div className="container">
          <div className="section-header">
            <Server size={32} color="#00bfff" />
            <h2 className="section-title">Modalidades</h2>
            <p className="section-desc">Explora las diferentes modalidades que tenemos para ofrecerte. ¡Hay para todos los gustos!</p>
          </div>
          
          <div className="servers-grid">
            {/* Survival */}
            <div className="server-card">
              <div className="server-card-bg" style={{ backgroundImage: "url('/mc_community_bg_1789255891090.jpg')" }}></div>
              <div className="server-card-overlay"></div>
              <div className="server-card-content">
                <span className="server-badge survival-badge">Nuevo</span>
                <h3>Survival Custom</h3>
                <p>Economía balanceada, protecciones, clanes y eventos diarios. La experiencia clásica mejorada.</p>
                <div className="server-stats">
                  <span><Users size={14} /> 150/500 Jugadores</span>
                  <span><Globe size={14} /> 1.20.x</span>
                </div>
                <Link href="/tienda" className="btn btn-primary btn-full">Ver Tienda</Link>
              </div>
            </div>

            {/* Anarchy */}
            <div className="server-card">
              <div className="server-card-bg" style={{ backgroundImage: "url('/minecraft_hero_bg_1789254204192.jpg')" }}></div>
              <div className="server-card-overlay"></div>
              <div className="server-card-content">
                <span className="server-badge anarchy-badge">Sin Reglas</span>
                <h3>Anarquía Total</h3>
                <p>Sin protecciones, sin reglas, sin piedad. Sobrevive como puedas en el servidor más duro.</p>
                <div className="server-stats">
                  <span><Users size={14} /> 200/500 Jugadores</span>
                  <span><Globe size={14} /> 1.19.x - 1.20.x</span>
                </div>
                <Link href="/tienda" className="btn btn-primary btn-full">Ver Tienda</Link>
              </div>
            </div>

            {/* Minijuegos */}
            <div className="server-card">
              <div className="server-card-bg" style={{ backgroundImage: "url('/mc_store_bg_1789255882937.jpg')" }}></div>
              <div className="server-card-overlay"></div>
              <div className="server-card-content">
                <span className="server-badge minigames-badge">BETA</span>
                <h3>Minijuegos</h3>
                <p>BedWars, SkyWars, y más. Diviértete con amigos en partidas rápidas y competitivas.</p>
                <div className="server-stats">
                  <span><Users size={14} /> 85/200 Jugadores</span>
                  <span><Globe size={14} /> 1.8.x - 1.20.x</span>
                </div>
                <Link href="/juegos/ruleta" className="btn btn-primary btn-full">Jugar Ruleta</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NUESTRA COMUNIDAD ── */}
      <section className="community-section">
        <div className="community-bg-image"></div>
        <div className="container community-content">
          <div className="community-text">
            <h2>Únete a <span className="highlight-blue">Nuestra Comunidad</span></h2>
            <p>
              Anargic MC no es solo un servidor, es una familia de miles de jugadores. Contamos con un equipo de Staff activo 24/7, eventos semanales en Discord, torneos y un ambiente libre de toxicidad (excepto en anarquía 🤫).
            </p>
            <ul className="community-features">
              <li><Shield size={18} color="#00bfff"/> Seguridad y Anti-Cheat Premium</li>
              <li><Gamepad2 size={18} color="#a855f7"/> Eventos y Sorteos todas las semanas</li>
              <li><MessageCircle size={18} color="#10b981"/> Soporte rápido y directo</li>
            </ul>
            <div className="community-buttons">
              <Link href="/discord" className="btn btn-discord"><MessageCircle size={18} /> Entrar al Discord</Link>
              <Link href="/reglas" className="btn btn-secondary">Ver Reglas <ArrowRight size={16}/></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ÚLTIMOS MIEMBROS ── */}
      <section className="latest-members-section">
        <div className="container">
          <div className="section-header">
            <Users size={32} color="#a855f7" />
            <h2 className="section-title">Últimos Miembros</h2>
            <p className="section-desc">Bienvenido a los aventureros más recientes que se unieron a Anargic MC.</p>
          </div>

          <div className="members-grid">
            {latestMembers.length > 0 ? (
              latestMembers.map((member, idx) => (
                <div key={idx} className="member-card glass-panel">
                  <div className="member-avatar" style={{ position: "relative" }}>
                    <img
                      src={getAvatarSrc(member, 64)}
                      alt={member.minecraft_username}
                      style={{ imageRendering: "pixelated", width: "100%", height: "100%" }}
                      onError={(e) => { e.target.src = "https://minotar.net/helm/Steve/64.png"; }}
                    />
                    {getFrameSrc(member) && (
                      <img
                        src={getFrameSrc(member)}
                        alt="Frame"
                        style={{ position: "absolute", top: "-10%", left: "-10%", width: "120%", height: "120%", pointerEvents: "none" }}
                      />
                    )}
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">{member.minecraft_username}</h4>
                    <span className="member-date">Se unió: {new Date(member.created_at).toLocaleDateString("es-ES")}</span>
                  </div>
                </div>
              ))
            ) : (
              // MOCKUP si no hay DB
              ["Steve", "Alex", "Notch", "Herobrine", "Jeb_", "Dinnerbone"].map((name, idx) => (
                <div key={idx} className="member-card glass-panel">
                  <div className="member-avatar">
                    <img src={`https://minotar.net/helm/${name}/64.png`} alt={name} />
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">{name}</h4>
                    <span className="member-date">Se unió: Hoy</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="members-footer">
            <Link href="/register" className="btn btn-primary">¡Crear mi Cuenta Gratis!</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
