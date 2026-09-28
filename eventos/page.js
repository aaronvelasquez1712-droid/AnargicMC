"use client";
import { useState, useEffect } from "react";
import { Calendar, Users, Star, ArrowRight, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/utils/supabase";
import "./eventos.css";

export default function Eventos() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [participations, setParticipations] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [participatingMsg, setParticipatingMsg] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load User
        const stored = localStorage.getItem("anargic_user");
        let currentUser = null;
        if (stored) {
          const { nick } = JSON.parse(stored);
          const { data: users } = await supabase.from("users").select("*").eq("minecraft_username", nick).limit(1);
          if (users && users.length > 0) {
            currentUser = users[0];
            setUser(currentUser);
          }
        }

        // Load Events
        const { data: eventsData, error } = await supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && eventsData) {
          setEvents(eventsData);
        }

        // Load Participations if user exists
        if (currentUser) {
          const { data: parts } = await supabase
            .from("event_participants")
            .select("event_id")
            .eq("user_id", currentUser.id);
            
          if (parts) {
            setParticipations(new Set(parts.map(p => p.event_id)));
          }
        }
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleParticipate = async (event) => {
    if (!user) {
      setParticipatingMsg("⚠️ Debes iniciar sesión para participar.");
      setTimeout(() => setParticipatingMsg(""), 3000);
      return;
    }

    try {
      // 1. Inscribir al usuario
      const { error: insertError } = await supabase
        .from("event_participants")
        .insert({ event_id: event.id, user_id: user.id });

      if (insertError) throw insertError;

      // 2. Actualizar estado local
      setParticipations(prev => new Set([...prev, event.id]));
      
      // 3. Enviar notificación personal a la campanita
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "¡Inscripción Exitosa!",
        message: `Te has inscrito en "${event.title}". Recuerda que el evento se estará realizando en Discord. ¡Mantente atento a los avisos!`,
        type: "SUCCESS"
      });

      setParticipatingMsg(`✅ ¡Te has inscrito en ${event.title}! Revisa tu campanita.`);
      setTimeout(() => setParticipatingMsg(""), 5000);

    } catch (err) {
      console.error("Error participating:", err);
      setParticipatingMsg("❌ Error al inscribirse al evento.");
      setTimeout(() => setParticipatingMsg(""), 3000);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "ACTIVE": return <div className="ev-badge active">¡ACTIVO!</div>;
      case "UPCOMING": return <div className="ev-badge upcoming">PRÓXIMO</div>;
      case "ENDED": return <div className="ev-badge ended">FINALIZADO</div>;
      default: return null;
    }
  };

  const getGlowColor = (status, type) => {
    if (status === "ENDED") return "#71717a";
    if (type === "DISCORD") return "#5865F2";
    if (type === "IN_GAME") return "#10b981";
    return "#c084fc";
  };

  return (
    <div className="events-page">
      <div className="events-bg"></div>
      <div className="container events-content">
        <div className="events-header">
          <Calendar size={48} color="#c084fc" />
          <h1 className="events-title">Eventos Anargic</h1>
          <p className="events-subtitle">Participa en torneos, sorteos y eventos exclusivos de la comunidad.</p>
        </div>
        
        {participatingMsg && (
          <div style={{ textAlign: "center", marginBottom: "2rem", padding: "1rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)" }}>
            {participatingMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "#a1a1aa", marginTop: "4rem" }}>Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", color: "#a1a1aa", marginTop: "4rem" }}>
            <Info size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }}/>
            No hay eventos disponibles en este momento.
          </div>
        ) : (
          <div className="events-grid">
            {events.map(ev => {
              const isParticipating = participations.has(ev.id);
              const isEnded = ev.status === "ENDED";
              
              return (
                <div key={ev.id} className={`event-card glass-panel ${isEnded ? "ended" : ""}`}>
                  {getStatusBadge(ev.status)}

                  <div className="ev-img-container">
                    <div className="ev-glow" style={{ background: getGlowColor(ev.status, ev.type) }}></div>
                    <img src={ev.image_url || "https://minotar.net/helm/Steve/128.png"} alt={ev.title} />
                  </div>

                  <div className="ev-info">
                    <div>
                      <h2 className="ev-name">{ev.title}</h2>
                      <p className="ev-desc">{ev.description}</p>
                    </div>

                    {ev.prize && (
                      <div className="ev-prize">
                        <Star size={16} color={isEnded ? "#a1a1aa" : "#fbbf24"} />
                        {ev.prize}
                      </div>
                    )}

                    <div className="ev-stats">
                      {ev.start_date && <div><Calendar size={14} /> Inicio: {new Date(ev.start_date).toLocaleDateString()}</div>}
                      {ev.end_date && <div><Calendar size={14} /> Fin: {new Date(ev.end_date).toLocaleDateString()}</div>}
                      {ev.participants !== undefined && <div><Users size={14} /> {ev.participants} Inscritos</div>}
                    </div>

                    {!isEnded ? (
                      isParticipating ? (
                        <button className="btn ev-btn" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16,185,129,0.4)" }} disabled>
                          <CheckCircle size={16} /> Inscrito
                        </button>
                      ) : (
                        <button className="btn btn-primary ev-btn" onClick={() => handleParticipate(ev)}>
                          Participar Ahora <ArrowRight size={16} />
                        </button>
                      )
                    ) : (
                      <div className="ev-winners">
                        <strong>Ganadores:</strong>
                        {ev.winners && ev.winners.length > 0 ? (
                          <div className="ev-winners-list">
                            {ev.winners.map(w => (
                              <span key={w}><img src={`https://minotar.net/helm/${w}/16.png`} alt={w} /> {w}</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Sin ganadores registrados.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
