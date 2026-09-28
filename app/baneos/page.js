"use client";
import { Search, ShieldBan, Filter, AlertOctagon } from "lucide-react";
import "./baneos.css";

const MOCK_BANS = [
  { player: "Notch", reason: "Uso de KillAura", admin: "AdminFluxzy", date: "2024-03-15", duration: "Permanente", active: true },
  { player: "Steve_01", reason: "X-Ray en minería", admin: "ModAlex", date: "2024-03-14", duration: "30 Días", active: true },
  { player: "AlexPro", reason: "Insultos reiterados", admin: "HelperBot", date: "2024-03-10", duration: "7 Días", active: false },
  { player: "CreeperBoy", reason: "Lag Machine", admin: "AdminFluxzy", date: "2024-03-01", duration: "Permanente", active: true },
];

export default function Baneos() {
  return (
    <div className="bans-page">
      <div className="bans-bg"></div>
      <div className="container bans-content">
        <div className="bans-header">
          <ShieldBan size={48} color="#ef4444" />
          <h1 className="bans-title">Registro de Sanciones</h1>
          <p className="bans-subtitle">Sistema de penalizaciones transparente de Anargic MC.</p>
        </div>

        <div className="bans-toolbar glass-panel">
          <div className="bans-search">
            <Search size={18} color="#a1a1aa" />
            <input type="text" placeholder="Buscar jugador..." />
          </div>
          <button className="btn btn-secondary btn-icon">
            <Filter size={16} /> Filtros
          </button>
        </div>

        <div className="bans-table-container glass-panel">
          <table className="bans-table">
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Motivo</th>
                <th>Por</th>
                <th>Fecha</th>
                <th>Duración</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BANS.map((ban, i) => (
                <tr key={i} className={ban.active ? "active-ban" : "expired-ban"}>
                  <td className="player-cell">
                    <img src={`https://minotar.net/helm/${ban.player}/32.png`} alt={ban.player} />
                    <span>{ban.player}</span>
                  </td>
                  <td className="reason-cell">{ban.reason}</td>
                  <td className="admin-cell">{ban.admin}</td>
                  <td>{ban.date}</td>
                  <td>{ban.duration}</td>
                  <td>
                    {ban.active ? (
                      <span className="status-badge active"><AlertOctagon size={12} /> Activo</span>
                    ) : (
                      <span className="status-badge expired">Expirado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
