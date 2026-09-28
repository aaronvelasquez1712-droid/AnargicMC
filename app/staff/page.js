"use client";
import { Crown, Shield, ShieldCheck, Mail } from "lucide-react";
import "./staff.css";

const STAFF_MEMBERS = [
  {
    role: "Administración",
    color: "#ef4444",
    icon: <Crown size={20} />,
    members: [
      { name: "Fluxzy", uuid: "Fluxzy", title: "Owner / Developer", desc: "Encargado general del servidor y web." },
      { name: "Notch", uuid: "Notch", title: "Co-Owner", desc: "Gestión de comunidad y finanzas." },
    ]
  },
  {
    role: "Moderación",
    color: "#f59e0b",
    icon: <ShieldCheck size={20} />,
    members: [
      { name: "AlexPro", uuid: "Alex", title: "Sr. Moderador", desc: "Supervisa al equipo de staff." },
      { name: "SteveBot", uuid: "Steve", title: "Moderador", desc: "Atención de reportes ingame." },
    ]
  },
  {
    role: "Soporte (Helpers)",
    color: "#10b981",
    icon: <Shield size={20} />,
    members: [
      { name: "Helper1", uuid: "MHF_Question", title: "Helper", desc: "Ayuda a usuarios nuevos." },
      { name: "Helper2", uuid: "MHF_Exclamation", title: "Helper", desc: "Revisión de bugs." },
    ]
  }
];

export default function Staff() {
  return (
    <div className="staff-page">
      <div className="staff-bg"></div>
      <div className="container staff-content">
        <div className="staff-header">
          <Shield size={48} color="#ef4444" />
          <h1 className="staff-title">Equipo de Staff</h1>
          <p className="staff-subtitle">Conoce a las personas que hacen posible Anargic MC.</p>
        </div>

        <div className="staff-sections">
          {STAFF_MEMBERS.map((group, idx) => (
            <div key={idx} className="staff-group">
              <div className="staff-group-header" style={{ color: group.color, borderBottomColor: `rgba(${group.color}, 0.2)` }}>
                {group.icon}
                <h2>{group.role}</h2>
              </div>
              
              <div className="staff-grid">
                {group.members.map((member, i) => (
                  <div key={i} className="staff-card glass-panel" style={{ "--hover-color": group.color }}>
                    <div className="staff-avatar">
                      <img src={`https://minotar.net/helm/${member.uuid}/64.png`} alt={member.name} />
                    </div>
                    <div className="staff-info">
                      <h3>{member.name}</h3>
                      <span className="staff-role-badge" style={{ background: `rgba(255,255,255,0.1)`, color: group.color }}>
                        {member.title}
                      </span>
                      <p>{member.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="staff-contact glass-panel">
          <Mail size={24} color="#00bfff" />
          <div>
            <h3>¿Quieres formar parte del equipo?</h3>
            <p>Abre un ticket en nuestro Discord cuando las postulaciones estén abiertas.</p>
          </div>
          <button className="btn btn-primary">Ir a Discord</button>
        </div>
      </div>
    </div>
  );
}
