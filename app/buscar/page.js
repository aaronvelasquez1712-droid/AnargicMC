"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, User, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { getAvatarSrc, getFrameSrc } from "@/utils/avatar";
import "./buscar.css";

export default function Buscar() {
  return (
    <Suspense fallback={<div className="buscar-page"><div className="buscar-loading"><Loader2 size={32} className="spin" />Buscando...</div></div>}>
      <BuscarContent />
    </Suspense>
  );
}

function BuscarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams]);

  const doSearch = async (term) => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("users")
      .select("id, minecraft_username, rank, playtime_minutes, created_at, equipped_profile_pic, equipped_frame, custom_face_url")
      .ilike("minecraft_username", `%${term.trim()}%`)
      .eq("is_banned", false)
      .order("minecraft_username")
      .limit(20);
    setResults(data || []);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    doSearch(query);
  };

  const rankColor = (rank) => {
    if (!rank) return "#71717a";
    const r = rank.toUpperCase();
    if (r === "STAFF" || r === "ADMIN" || r === "MOD") return "#f59e0b";
    if (r === "PLATINUM") return "#60a5fa";
    if (r === "PREMIUM") return "#2dd4bf";
    if (r === "GOLD") return "#fbbf24";
    return "#a1a1aa";
  };

  return (
    <div className="buscar-page">
      <div className="buscar-hero">
        <div className="buscar-hero-blur"></div>
        <h1 className="buscar-title">Buscar Jugadores</h1>
        <p className="buscar-subtitle">Encuentra a cualquier miembro de la comunidad Anargic</p>

        <form onSubmit={handleSubmit} className="buscar-form">
          <div className="buscar-input-wrapper">
            <Search size={20} className="buscar-icon" />
            <input
              type="text"
              className="buscar-input"
              placeholder="Escribe un nombre de usuario..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="buscar-btn">
              Buscar
            </button>
          </div>
        </form>
      </div>

      <div className="buscar-results-container container">
        {loading && (
          <div className="buscar-loading">
            <Loader2 size={32} className="spin" />
            <span>Buscando jugadores...</span>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="buscar-empty">
            <AlertCircle size={48} color="#3f3f46" />
            <h2>No se han encontrado resultados</h2>
            <p>No existe ningún jugador con el nombre "<strong>{searchParams.get("q")}</strong>" en el servidor.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="buscar-results-header">
              <span>{results.length} jugador{results.length !== 1 ? "es" : ""} encontrado{results.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="buscar-grid">
              {results.map(player => (
                <div key={player.id} className="player-card">
                  <div className="player-card-bg"></div>
                  <div className="player-avatar" style={{ position: "relative" }}>
                    <img
                      src={getAvatarSrc(player, 80)}
                      alt={player.minecraft_username}
                      style={{ imageRendering: "pixelated", width: "100%", height: "100%" }}
                      onError={e => { e.target.src = "https://minotar.net/helm/Steve/80.png"; }}
                    />
                    {getFrameSrc(player) && (
                      <img
                        src={getFrameSrc(player)}
                        alt="Frame"
                        style={{ position: "absolute", top: "-10%", left: "-10%", width: "120%", height: "120%", pointerEvents: "none" }}
                      />
                    )}
                  </div>
                  <div className="player-info">
                    <h3 className="player-name">{player.minecraft_username}</h3>
                    <span className="player-rank" style={{ color: rankColor(player.rank) }}>
                      {player.rank || "Jugador"}
                    </span>
                    <p className="player-time">
                      {Math.floor((player.playtime_minutes || 0) / 60)}h jugadas
                    </p>
                  </div>
                  <a href={`/perfil?u=${player.minecraft_username}`} className="player-view-btn">
                    <User size={15} /> Visualizar Perfil <ChevronRight size={15} />
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="buscar-hint">
            <User size={64} color="#27272a" />
            <p>Escribe un nombre para comenzar a buscar</p>
          </div>
        )}
      </div>
    </div>
  );
}
