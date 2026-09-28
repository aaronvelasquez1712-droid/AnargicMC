"use client";
import Link from "next/link";
import { Download, Monitor, Shield, Zap, Users, Star, ChevronRight, CheckCircle, Cpu, Globe } from "lucide-react";
import "./launcher.css";

const FEATURES = [
  {
    icon: <Monitor size={28} />,
    title: "Gestión de Cosméticos",
    desc: "Equipa banners, marcos y fotos de perfil directamente desde el launcher sin abrir el navegador.",
    color: "#00bfff",
  },
  {
    icon: <Users size={28} />,
    title: "Perfil Integrado",
    desc: "Visualiza tu perfil, estadísticas, rango y colección de cosméticos en tiempo real.",
    color: "#a855f7",
  },
  {
    icon: <Zap size={28} />,
    title: "Conexión Rápida",
    desc: "Entra al servidor con un solo clic. Sin buscar IPs ni recordar configuraciones.",
    color: "#f59e0b",
  },
  {
    icon: <Shield size={28} />,
    title: "Anti-Cheat Integrado",
    desc: "El launcher verifica la integridad del cliente antes de conectar para proteger el servidor.",
    color: "#10b981",
  },
  {
    icon: <Cpu size={28} />,
    title: "Optimización de RAM",
    desc: "Asignación automática de memoria para que Minecraft corra sin lag en tu equipo.",
    color: "#ef4444",
  },
  {
    icon: <Globe size={28} />,
    title: "Noticias en vivo",
    desc: "Consulta las últimas actualizaciones, eventos y sorteos del servidor desde el launcher.",
    color: "#00bfff",
  },
];

const SPECS = [
  { label: "Sistema Operativo", value: "Windows 10 / 11 (64-bit)" },
  { label: "Java", value: "Incluido (Java 21)" },
  { label: "RAM mínima", value: "4 GB" },
  { label: "RAM recomendada", value: "8 GB" },
  { label: "Tamaño del installer", value: "~85 MB" },
  { label: "Versión de Minecraft", value: "1.20.x" },
];

export default function LauncherPage() {
  return (
    <div className="launcher-page">
      {/* Animated background */}
      <div className="launcher-bg">
        <div className="launcher-bg-orb orb-1"></div>
        <div className="launcher-bg-orb orb-2"></div>
        <div className="launcher-bg-orb orb-3"></div>
      </div>

      {/* HERO SECTION */}
      <section className="launcher-hero container">
        <div className="launcher-hero-text">
          <div className="launcher-badge">
            <Star size={14} /> Oficial · Versión 1.0.0
          </div>
          <h1 className="launcher-title">
            El Launcher<br />
            <span className="launcher-title-accent">Oficial de Anargic</span>
          </h1>
          <p className="launcher-subtitle">
            Administra tu perfil, cosméticos y conéctate al servidor con un solo clic.
            Todo lo que necesitas, sin abrir el navegador.
          </p>
          <div className="launcher-cta-group">
            <button className="launcher-download-btn" id="btn-download-launcher">
              <Download size={20} />
              Descargar para Windows
              <span className="launcher-download-sub">Gratis · v1.0.0 · 85 MB</span>
            </button>
            <p className="launcher-req-hint">
              <CheckCircle size={14} color="#10b981" /> Compatible con Windows 10 / 11 (64-bit)
            </p>
          </div>
        </div>

        <div className="launcher-hero-visual">
          <div className="laptop-glow"></div>
          <img
            src="/launcher-laptop.jpg"
            alt="Anargic MC Launcher en laptop"
            className="launcher-laptop-img"
          />
        </div>
      </section>

      {/* DIVIDER */}
      <div className="launcher-divider-line container"></div>

      {/* FEATURES */}
      <section className="launcher-features-section container">
        <div className="launcher-section-header">
          <h2 className="launcher-section-title">Todo lo que necesitas en un solo lugar</h2>
          <p className="launcher-section-sub">
            El launcher de Anargic integra todas las funciones de la web directamente en tu escritorio.
          </p>
        </div>
        <div className="launcher-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="launcher-feature-card glass-panel" style={{ "--feat-color": f.color }}>
              <div className="launcher-feature-icon" style={{ color: f.color }}>
                {f.icon}
              </div>
              <h3 className="launcher-feature-title">{f.title}</h3>
              <p className="launcher-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="launcher-steps-section container">
        <div className="launcher-section-header">
          <h2 className="launcher-section-title">Empieza en 3 pasos</h2>
        </div>
        <div className="launcher-steps">
          <div className="launcher-step">
            <div className="step-number">01</div>
            <h3>Descarga el Installer</h3>
            <p>Haz clic en el botón de descarga y ejecuta el archivo <code>.exe</code> en tu PC.</p>
          </div>
          <div className="launcher-step-arrow"><ChevronRight size={28} color="#3f3f46" /></div>
          <div className="launcher-step">
            <div className="step-number">02</div>
            <h3>Inicia sesión</h3>
            <p>Usa tu usuario y contraseña de Anargic. Las mismas que usas en la web.</p>
          </div>
          <div className="launcher-step-arrow"><ChevronRight size={28} color="#3f3f46" /></div>
          <div className="launcher-step">
            <div className="step-number">03</div>
            <h3>¡A jugar!</h3>
            <p>Personaliza tus cosméticos y conéctate al servidor con un clic.</p>
          </div>
        </div>
      </section>

      {/* SPECS */}
      <section className="launcher-specs-section container">
        <div className="glass-panel launcher-specs-panel">
          <div className="launcher-specs-left">
            <h2>Requisitos del sistema</h2>
            <p>El launcher incluye Java 21. No necesitas instalarlo por separado.</p>
            <button className="launcher-download-btn" id="btn-download-launcher-2" style={{ marginTop: "1.5rem" }}>
              <Download size={18} /> Descargar ahora
            </button>
          </div>
          <div className="launcher-specs-right">
            {SPECS.map((s, i) => (
              <div key={i} className="spec-row">
                <span className="spec-label">{s.label}</span>
                <span className="spec-value">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="launcher-footer-cta container">
        <h2>¿Listo para una mejor experiencia?</h2>
        <p>Únete a los jugadores de Anargic que ya usan el launcher oficial.</p>
        <button className="launcher-download-btn" id="btn-download-launcher-3">
          <Download size={20} /> Descargar el Launcher
        </button>
        <p style={{ marginTop: "1rem", color: "#52525b", fontSize: "0.8rem" }}>
          También disponible desde la web · <Link href="/" style={{ color: "#00bfff" }}>Volver al inicio</Link>
        </p>
      </section>
    </div>
  );
}
