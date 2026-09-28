"use client";
import { ShieldAlert, Book, AlertTriangle, CheckCircle, Flame } from "lucide-react";
import "./reglas.css";

const RULES = [
  {
    category: "Comportamiento",
    icon: <ShieldAlert size={24} color="#f59e0b" />,
    items: [
      "No usar lenguaje ofensivo, racista o discriminatorio.",
      "El acoso a otros jugadores (bullying) resultará en baneo permanente.",
      "No hacer spam de mensajes ni usar mayúsculas excesivas.",
      "Prohibido hacerse pasar por miembros del Staff."
    ]
  },
  {
    category: "Juego Limpio",
    icon: <Flame size={24} color="#ef4444" />,
    items: [
      "El uso de hacks, clientes modificados (x-ray, kill-aura, etc.) o macros está terminantemente prohibido.",
      "No abusar de bugs o exploits del servidor. Repórtalos al Staff.",
      "Las granjas que causen lag intencional (lag machines) serán destruidas y el usuario sancionado.",
      "Las multicuentas para evadir baneos o ganar ventajas están prohibidas."
    ]
  },
  {
    category: "Economía y Tienda",
    icon: <CheckCircle size={24} color="#10b981" />,
    items: [
      "Las estafas a otros jugadores son sancionables. Comercia bajo tu propio riesgo.",
      "Prohibido vender items del juego o cuentas por dinero real (RWT).",
      "Los reembolsos en la tienda no están permitidos. Un chargeback resultará en baneo de IP."
    ]
  }
];

export default function Reglas() {
  return (
    <div className="rules-page">
      <div className="rules-bg"></div>
      <div className="container rules-content">
        <div className="rules-header">
          <Book size={48} color="#00bfff" />
          <h1 className="rules-title">Reglas del Servidor</h1>
          <p className="rules-subtitle">Lee atentamente nuestras normas. El desconocimiento no exime de su cumplimiento.</p>
        </div>

        <div className="rules-grid">
          {RULES.map((section, idx) => (
            <div key={idx} className="rules-section glass-panel">
              <div className="rules-section-header">
                {section.icon}
                <h2>{section.category}</h2>
              </div>
              <ul className="rules-list">
                {section.items.map((rule, i) => (
                  <li key={i}>
                    <AlertTriangle size={16} className="rule-bullet" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rules-footer glass-panel">
          <h3>¿Viste a alguien rompiendo las reglas?</h3>
          <p>Usa el comando <code>/report &lt;usuario&gt; &lt;motivo&gt;</code> dentro del juego o repórtalo en nuestro Discord.</p>
        </div>
      </div>
    </div>
  );
}
