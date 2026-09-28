"use client";
import { useState, useEffect } from "react";
import { Calendar, Users, Star, ArrowRight, CheckCircle, Info, Gift } from "lucide-react";
import { supabase } from "@/utils/supabase";
import "./eventos-movil.css";

export default function MovilEventosPage() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [participations, setParticipations] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [participatingMsg, setParticipatingMsg] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
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

        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false });

        if (eventsData) setEvents(eventsData);

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
      alert("Debes iniciar sesión para participar.");
      return;
    }
    
    setParticipatingMsg("Inscribiendo...");
    
    const { error } = await supabase.from("event_participants").insert({
      event_id: event.id,
      user_id: user.id
    });

    if (error) {
      alert("Error al inscribirse. Intenta de nuevo.");
    } else {
      setParticipations(prev => new Set(prev).add(event.id));
      
      const { data: existingNotifs } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", `Inscrito en: ${event.title}`);
        
      if (!existingNotifs || existingNotifs.length === 0) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: `Inscrito en: ${event.title}`,
          message: `Te has inscrito correctamente en el evento. El evento se estará realizando en nuestro servidor de Discord. ¡No faltes!`,
          type: "system",
          is_read: false
        });
      }
      
      alert("¡Inscrito! Revisa tus notificaciones (Campanita) en PC para los detalles del Discord.");
    }
    setParticipatingMsg("");
  };

  const activeEvents = events.filter(e => e.status === "activo");
  const pastEvents = events.filter(e => e.status === "finalizado");

  if (loading) return <div className="m-loading">Cargando eventos...</div>;

  return (
    <div className="movil-eventos-container animate-fade-in">
      <div className="m-events-header">
        <h1>Eventos</h1>
        <p>Participa y gana recompensas únicas</p>
      </div>

      <div className="m-active-events">
        <h2 className="m-section-title"><Star size={18}/> En Curso</h2>
        
        {activeEvents.length === 0 ? (
          <div className="m-no-events">No hay eventos activos ahora.</div>
        ) : (
          activeEvents.map(ev => {
            const isParticipating = participations.has(ev.id);
            return (
              <div key={ev.id} className="m-event-card m-event-active">
                <div className="m-event-glow"></div>
                <div className="m-event-content">
                  <div className="m-event-top">
                    <span className="m-event-badge">Activo</span>
                    <span className="m-event-date"><Calendar size={14}/> {new Date(ev.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3>{ev.title}</h3>
                  <p>{ev.description}</p>
                  
                  <div className="m-event-reward">
                    <Gift size={16}/> Recompensa: {ev.reward}
                  </div>

                  <button 
                    onClick={() => !isParticipating && handleParticipate(ev)}
                    className={`m-participate-btn ${isParticipating ? 'participating' : ''}`}
                    disabled={isParticipating || !!participatingMsg}
                  >
                    {isParticipating ? (
                      <><CheckCircle size={18}/> ¡Ya estás participando!</>
                    ) : (
                      participatingMsg || "Participar en el Evento"
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="m-past-events">
        <h2 className="m-section-title"><ArrowRight size={18}/> Eventos Anteriores</h2>
        
        {pastEvents.map(ev => (
          <div key={ev.id} className="m-event-card m-event-past">
            <div className="m-event-content">
              <h3>{ev.title}</h3>
              <p>{ev.description}</p>
              {ev.winners && ev.winners.length > 0 && (
                <div className="m-winners-box">
                  <span className="m-winners-label">Ganadores:</span>
                  <div className="m-winners-avatars">
                    {ev.winners.map((w, i) => (
                      <img key={i} src={`https://minotar.net/helm/${w}/64.png`} alt={w} title={w} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
