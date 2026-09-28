"use client";
import { useState } from "react";
import { HeadphonesIcon, ShieldCheck, MessageSquare, Clock, Users, Star, ExternalLink, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import "./soporte.css";

const REQUIREMENTS = [
  {
    icon: <Clock size={28} color="#00bfff" />,
    title: "Antigüedad mínima",
    desc: "Debes tener al menos 3 meses activo en el servidor de AnargicMC.",
  },
  {
    icon: <MessageSquare size={28} color="#a78bfa" />,
    title: "Comunicación",
    desc: "Debes tener buena ortografía, ser claro y empático al comunicarte con los jugadores.",
  },
  {
    icon: <Clock size={28} color="#34d399" />,
    title: "Disponibilidad",
    desc: "Disponibilidad mínima de 5 horas a la semana para atender dudas y tickets de soporte.",
  },
  {
    icon: <ShieldCheck size={28} color="#f59e0b" />,
    title: "Historial limpio",
    desc: "No debes tener sanciones activas (banes, mutes) en el servidor ni en el Discord oficial.",
  },
  {
    icon: <Users size={28} color="#fb7185" />,
    title: "Conocimiento del servidor",
    desc: "Debes conocer bien las reglas, mecánicas y funciones de AnargicMC para poder orientar correctamente a los jugadores.",
  },
  {
    icon: <Star size={28} color="#fde68a" />,
    title: "Actitud positiva",
    desc: "Ser paciente, tolerante y proactivo. El soporte representa a AnargicMC frente a la comunidad.",
  },
];

export default function SoportePage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "¿Cuánto tarda en revisarse mi solicitud?",
      a: "Las solicitudes son revisadas por el equipo de administración. El proceso puede tardar entre 1 y 2 semanas. Recibirás una respuesta por Discord.",
    },
    {
      q: "¿Tengo que pagar para ser del soporte?",
      a: "No. El soporte es completamente voluntario. No se cobra ni se paga nada para ser miembro del equipo.",
    },
    {
      q: "¿Puedo postularme si tengo menos de 3 meses?",
      a: "Puedes enviar tu solicitud, pero necesitas cumplir los requisitos mínimos para ser aceptado. Te recomendamos esperar a cumplirlos.",
    },
    {
      q: "¿Qué ventajas tiene ser parte del soporte?",
      a: "Tendrás un rango exclusivo en el servidor y Discord, acceso a canales privados del staff y la satisfacción de ayudar a la comunidad.",
    },
  ];

  return (
    <div className="soporte-page">
      {/* Hero */}
      <section className="soporte-hero">
        <div className="soporte-hero-glow" />
        <div className="soporte-hero-glow2" />
        <div className="soporte-hero-content">
          <div className="soporte-hero-icon">
            <HeadphonesIcon size={52} color="#00bfff" />
          </div>
          <h1 className="soporte-title">Soporte <span className="soporte-accent">AnargicMC</span></h1>
          <p className="soporte-subtitle">Nuestro equipo de soporte está aquí para ayudarte con cualquier duda, problema o inconveniente en el servidor.</p>
        </div>
      </section>

      {/* Unirse al soporte */}
      <section className="soporte-join-section container">
        <div className="soporte-join-card">
          <div className="soporte-join-header">
            <HeadphonesIcon size={36} color="#00bfff" />
            <h2>¿Quieres unirte al soporte de AnargicMC?</h2>
          </div>
          <p className="soporte-join-desc">
            Únete al <strong>Discord oficial</strong> de AnargicMC y manda una solicitud explicando <strong>por qué deberías ser miembro del soporte</strong> a <span className="soporte-mention">@FluxzyZzz</span>.
          </p>
          <div className="soporte-join-steps">
            <div className="soporte-step">
              <span className="soporte-step-num">1</span>
              <p>Entra al Discord oficial de AnargicMC</p>
            </div>
            <div className="soporte-step-arrow">→</div>
            <div className="soporte-step">
              <span className="soporte-step-num">2</span>
              <p>Busca a <strong>@FluxzyZzz</strong> en el servidor</p>
            </div>
            <div className="soporte-step-arrow">→</div>
            <div className="soporte-step">
              <span className="soporte-step-num">3</span>
              <p>Envía tu solicitud explicando por qué deberías ser miembro del soporte</p>
            </div>
          </div>
          <a
            href="https://discord.gg/9bBBrqafVd"
            target="_blank"
            rel="noopener noreferrer"
            className="soporte-discord-btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Unirse al Discord Oficial
            <ExternalLink size={16} />
          </a>
        </div>
      </section>

      {/* Requisitos */}
      <section className="soporte-req-section container">
        <div className="soporte-section-header">
          <CheckCircle2 size={28} color="#10b981" />
          <h2>Requisitos para ser miembro del soporte</h2>
        </div>
        <p className="soporte-section-desc">Antes de enviar tu solicitud, asegúrate de cumplir con todos los requisitos:</p>
        <div className="soporte-req-grid">
          {REQUIREMENTS.map((r, i) => (
            <div className="soporte-req-card" key={i}>
              <div className="soporte-req-icon">{r.icon}</div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="soporte-faq-section container">
        <div className="soporte-section-header">
          <MessageSquare size={28} color="#a78bfa" />
          <h2>Preguntas Frecuentes</h2>
        </div>
        <div className="soporte-faq-list">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`soporte-faq-item ${openFaq === i ? "open" : ""}`}
            >
              <button
                className="soporte-faq-q"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openFaq === i && <p className="soporte-faq-a">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Ayuda del soporte */}
      <section className="soporte-help-section container">
        <div className="soporte-help-card">
          <div className="soporte-help-icon">
            <MessageSquare size={32} color="#a78bfa" />
          </div>
          <div className="soporte-help-content">
            <h3>¿Lo que buscabas era ayuda del soporte?</h3>
            <p>
              Si necesitas ayuda puedes contactar a cualquier <strong>miembro del soporte en Discord</strong>,
              abrir un <strong>ticket</strong> en el servidor, o darle al botón de abajo para
              <strong> enviar un email</strong> y describir tu problema.
            </p>
            <div className="soporte-help-actions">
              <a
                href="https://discord.gg/9bBBrqafVd"
                target="_blank"
                rel="noopener noreferrer"
                className="soporte-help-btn discord"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                Ir al Discord
              </a>
              <a
                href="mailto:soporte@anargicmc.net"
                className="soporte-help-btn email"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Enviar un Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
