"use client";
import Link from "next/link";
import { Server, Users, Globe, Monitor, Rocket, Swords, Cpu } from "lucide-react";
import "../page.css"; // Reuse home page styles for the servers grid
import "./servidores.css"; // Optional specific styles if needed

export default function ServidoresPage() {
  return (
    <div className="servidores-page-container">
      <section className="servers-section">
        <div className="container">
          <div className="section-header">
            <Server size={40} color="#00bfff" />
            <h2 className="section-title" style={{ marginTop: '15px' }}>Anargic te da varios servidores a elegir</h2>
            <p className="section-desc" style={{ maxWidth: '800px', margin: '15px auto 30px', lineHeight: '1.6' }}>
              Nuestro servidor cuenta con el sistema <strong>ViaVersion</strong> (y sus derivados), permitiendo una compatibilidad total con múltiples versiones. Hemos diseñado tres Lobbys principales para que encuentres tu experiencia ideal, sin importar desde qué versión o PC juegues.
            </p>
          </div>
          
          {/* LOBBY 1: VERSIONES NUEVAS */}
          <div className="lobby-section">
            <div className="lobby-header">
              <Rocket size={28} color="#a855f7" />
              <h3>Lobby 1: Versiones Nuevas</h3>
              <span className="lobby-version-badge">1.19+ / 1.20+</span>
            </div>
            <p className="lobby-desc">Disfruta de todas las novedades y bloques de las versiones más recientes. ¡La mejor experiencia visual y técnica!</p>
            
            <div className="servers-grid">
              <div className="server-card">
                <div className="server-card-bg" style={{ backgroundImage: "url('/mc_community_bg_1789255891090.jpg')" }}></div>
                <div className="server-card-overlay"></div>
                <div className="server-card-content">
                  <span className="server-badge survival-badge">Novedad</span>
                  <h3>Survival Custom</h3>
                  <p>Economía balanceada, protecciones, clanes y eventos diarios. Aprovecha al máximo la nueva generación.</p>
                  <div className="server-stats">
                    <span><Users size={14} /> 150/500 Jugadores</span>
                    <span><Globe size={14} /> 1.20.x</span>
                  </div>
                  <Link href="/tienda" className="btn btn-primary btn-full">Ver Tienda</Link>
                </div>
              </div>

              <div className="server-card">
                <div className="server-card-bg" style={{ backgroundImage: "url('/minecraft_hero_bg_1789254204192.jpg')" }}></div>
                <div className="server-card-overlay"></div>
                <div className="server-card-content">
                  <span className="server-badge anarchy-badge">Sin Reglas</span>
                  <h3>Anarquía Total</h3>
                  <p>Sobrevive como puedas en el servidor más duro. Hack clients permitidos, cero moderación.</p>
                  <div className="server-stats">
                    <span><Users size={14} /> 200/500 Jugadores</span>
                    <span><Globe size={14} /> 1.20.x</span>
                  </div>
                  <Link href="/tienda" className="btn btn-primary btn-full">Ver Tienda</Link>
                </div>
              </div>

              <div className="server-card">
                <div className="server-card-bg" style={{ backgroundImage: "url('/mc_store_bg_1789255882937.jpg')" }}></div>
                <div className="server-card-overlay"></div>
                <div className="server-card-content">
                  <span className="server-badge minigames-badge">Diversión</span>
                  <h3>Minijuegos</h3>
                  <p>Nuevas mecánicas y juegos adaptados a las últimas versiones del juego. ¡Compite con amigos!</p>
                  <div className="server-stats">
                    <span><Users size={14} /> 85/200 Jugadores</span>
                    <span><Globe size={14} /> 1.20.x</span>
                  </div>
                  <Link href="/juegos/ruleta" className="btn btn-primary btn-full">Jugar Minijuegos</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lobby-divider"></div>

          {/* LOBBY 2: BAJOS RECURSOS */}
          <div className="lobby-section">
            <div className="lobby-header">
              <Cpu size={28} color="#10b981" />
              <h3>Lobby 2: Servidores para Bajos Recursos</h3>
              <span className="lobby-version-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' }}>1.17.1</span>
            </div>
            <p className="lobby-desc">Optimizado para computadoras de bajos recursos, ofreciendo un rendimiento estable y sin lag.</p>
            
            <div className="servers-grid">
              <div className="server-card">
                <div className="server-card-bg" style={{ backgroundImage: "url('/mc_community_bg_1789255891090.jpg')" }}></div>
                <div className="server-card-overlay"></div>
                <div className="server-card-content">
                  <span className="server-badge survival-badge" style={{ background: '#10b981' }}>Optimizado</span>
                  <h3>Survival Custom</h3>
                  <p>Experiencia fluida y balanceada para jugar en survival sin preocuparte por los FPS.</p>
                  <div className="server-stats">
                    <span><Users size={14} /> 110/300 Jugadores</span>
                    <span><Globe size={14} /> 1.17.1</span>
                  </div>
                  <Link href="/tienda" className="btn btn-primary btn-full">Ver Tienda</Link>
                </div>
              </div>

              <div className="server-card">
                <div className="server-card-bg" style={{ backgroundImage: "url('/minecraft_hero_bg_1789254204192.jpg')" }}></div>
                <div className="server-card-overlay"></div>
                <div className="server-card-content">
                  <span className="server-badge anarchy-badge">Sin Reglas</span>
                  <h3>Anarquía Total</h3>
                  <p>La experiencia hardcore de la anarquía, con rendimiento ultra mejorado para PC de bajos requisitos.</p>
                  <div className="server-stats">
                    <span><Users size={14} /> 180/400 Jugadores</span>
                    <span><Globe size={14} /> 1.17.1</span>
                  </div>
                  <Link href="/tienda" className="btn btn-primary btn-full">Ver Tienda</Link>
                </div>
              </div>

              <div className="server-card">
                <div className="server-card-bg" style={{ backgroundImage: "url('/mc_store_bg_1789255882937.jpg')" }}></div>
                <div className="server-card-overlay"></div>
                <div className="server-card-content">
                  <span className="server-badge minigames-badge">Diversión</span>
                  <h3>Minijuegos</h3>
                  <p>Tus minijuegos favoritos optimizados para garantizar más de 60 FPS en equipos modestos.</p>
                  <div className="server-stats">
                    <span><Users size={14} /> 65/150 Jugadores</span>
                    <span><Globe size={14} /> 1.17.1</span>
                  </div>
                  <Link href="/juegos/ruleta" className="btn btn-primary btn-full">Jugar Minijuegos</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lobby-divider"></div>

          {/* LOBBY 3: PVP Y MINIJUEGOS (1.8) */}
          <div className="lobby-section">
            <div className="lobby-header">
              <Swords size={28} color="#f59e0b" />
              <h3>Lobby 3: Especializado en PvP y Minijuegos</h3>
              <span className="lobby-version-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>1.8.8</span>
            </div>
            <p className="lobby-desc">La meca del combate clásico. El lugar ideal para los veteranos que aman el PvP de la versión 1.8.</p>
            
            <div className="servers-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
              <div className="server-card">
                <div className="server-card-bg" style={{ backgroundImage: "url('/mc_store_bg_1789255882937.jpg')" }}></div>
                <div className="server-card-overlay"></div>
                <div className="server-card-content">
                  <span className="server-badge" style={{ background: '#f59e0b', color: '#fff' }}>PvP Clásico</span>
                  <h3>Practice & Duels</h3>
                  <p>Ránkea en las arenas de combate con el sistema de PvP clásico (Sin cooldown). Nodebuff, Gapple y más.</p>
                  <div className="server-stats">
                    <span><Users size={14} /> 250/500 Jugadores</span>
                    <span><Globe size={14} /> 1.8.8</span>
                  </div>
                  <Link href="/juegos/ruleta" className="btn btn-primary btn-full" style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b)' }}>Jugar Ahora</Link>
                </div>
              </div>
              
              <div className="server-card">
                <div className="server-card-bg" style={{ backgroundImage: "url('/minecraft_hero_bg_1789254204192.jpg')" }}></div>
                <div className="server-card-overlay"></div>
                <div className="server-card-content">
                  <span className="server-badge" style={{ background: '#ef4444', color: '#fff' }}>Competitivo</span>
                  <h3>Minijuegos Clásicos</h3>
                  <p>BedWars, SkyWars y UHC. Disfruta de la mejor época de los minijuegos con tus amigos.</p>
                  <div className="server-stats">
                    <span><Users size={14} /> 120/300 Jugadores</span>
                    <span><Globe size={14} /> 1.8.8</span>
                  </div>
                  <Link href="/juegos/ruleta" className="btn btn-primary btn-full" style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)' }}>Jugar Ahora</Link>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}
