"use client";
import { useState, useEffect } from "react";
import { Users, Server, Gamepad2, Trophy, Clock } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { getAvatarSrc, getFrameSrc } from "@/utils/avatar";
import "./comunidad.css";

// Avatar component with optional frame overlay
function PlayerAvatar({ user, size = 50 }) {
  const avatarSrc = getAvatarSrc(user, size);
  const frameSrc = getFrameSrc(user);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <img
        src={avatarSrc}
        alt={user?.minecraft_username || "Player"}
        className="lb-avatar"
        style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
        onError={(e) => { e.target.src = "https://minotar.net/helm/Steve/50.png"; }}
      />
      {frameSrc && (
        <img
          src={frameSrc}
          alt="Frame"
          style={{
            position: "absolute", top: "-10%", left: "-10%",
            width: "120%", height: "120%", pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

export default function Comunidad() {
  const [topPlayers, setTopPlayers] = useState([]);
  const [topStaff, setTopStaff] = useState([]);
  const [stats, setStats] = useState({ users: 0, players_online: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Total users
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        // Top Players (by playtime) — now includes avatar fields
        const { data: players } = await supabase
          .from("users")
          .select("minecraft_username, playtime_minutes, rank, equipped_profile_pic, equipped_frame, custom_face_url")
          .eq("is_banned", false)
          .order("playtime_minutes", { ascending: false })
          .limit(3);

        // Top Staff — includes avatar fields via joined user
        const { data: staffData } = await supabase
          .from("staff")
          .select("role, role_color, users(minecraft_username, playtime_minutes, equipped_profile_pic, equipped_frame, custom_face_url)")
          .eq("is_active", true)
          .order("id", { ascending: true })
          .limit(3);

        setStats({ users: userCount || 0, players_online: 0 });
        setTopPlayers(players || []);
        setTopStaff(staffData || []);
      } catch (e) {
        console.error("Error fetching community data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatHours = (minutes) => {
    if (!minutes) return "0h";
    const h = Math.floor(minutes / 60);
    return `${h}h`;
  };

  const month = new Date().toLocaleString("es-ES", { month: "long" }).toUpperCase();

  const statBlocks = [
    { icon: <Users size={28} />, value: stats.users.toLocaleString("es"), label: "USUARIOS REGISTRADOS" },
    { icon: <Server size={28} />, value: "1", label: "SERVIDORES ACTIVOS" },
    { icon: <Gamepad2 size={28} />, value: stats.players_online.toString(), label: "JUGADORES ONLINE" },
  ];

  return (
    <div className="community-page">
      <div className="community-header">
        <p className="community-since">DESDE 2024</p>
        <h1 className="community-title">NUESTRA COMUNIDAD</h1>
      </div>

      <div className="container community-content">
        {/* Stats */}
        <div className="stats-row">
          {statBlocks.map((s, i) => (
            <div key={i} className="stat-block glass-panel">
              <div className="stat-icon-wrapper">{s.icon}</div>
              <div className="stat-number">{loading ? "—" : s.value}</div>
              <div className="stat-label-com">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Leaderboards */}
        <div className="leaderboards-grid">
          {/* Top Players */}
          <div className="leaderboard-card glass-panel">
            <div className="leaderboard-header">
              <div className="lb-title-group">
                <Trophy size={16} className="lb-icon" />
                <span className="lb-title">TOP JUGADORES</span>
              </div>
              <span className="lb-period">· {month}</span>
            </div>
            <div className="lb-list">
              {loading ? (
                <div className="lb-empty">Cargando...</div>
              ) : topPlayers.length === 0 ? (
                <div className="lb-empty">Aún no hay jugadores registrados</div>
              ) : topPlayers.map((p, i) => (
                <div key={i} className={`lb-row pos-${i + 1}`}>
                  <span className={`lb-pos rank-${i + 1}`}>{i + 1}</span>
                  <div className="lb-avatar-wrapper">
                    <PlayerAvatar user={p} size={40} />
                  </div>
                  <span className="lb-name">{p.minecraft_username}</span>
                  <div className="lb-hours">
                    <Clock size={13} /> {formatHours(p.playtime_minutes)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Staff */}
          <div className="leaderboard-card glass-panel">
            <div className="leaderboard-header">
              <div className="lb-title-group">
                <Trophy size={16} className="lb-icon lb-icon-blue" />
                <span className="lb-title">TOP STAFF</span>
              </div>
              <span className="lb-period">· {month}</span>
            </div>
            <div className="lb-list">
              {loading ? (
                <div className="lb-empty">Cargando...</div>
              ) : topStaff.length === 0 ? (
                <div className="lb-empty">Aún no hay staff registrado</div>
              ) : topStaff.map((s, i) => (
                <div key={i} className={`lb-row pos-${i + 1}`}>
                  <span className={`lb-pos rank-${i + 1}`}>{i + 1}</span>
                  <div className="lb-avatar-wrapper">
                    <PlayerAvatar user={s.users} size={40} />
                  </div>
                  <div className="lb-name-group">
                    <span className="lb-name">{s.users?.minecraft_username}</span>
                    <span className="lb-role" style={{ color: s.role_color }}>{s.role}</span>
                  </div>
                  <div className="lb-hours">
                    <Clock size={13} /> {formatHours(s.users?.playtime_minutes)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
