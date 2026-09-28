"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import "./recuperar.css";

export default function Recuperar() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!email) {
      setError("Por favor ingresa tu correo electrónico.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al enviar el correo.");
      }

      setSuccess(true);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="recuperar-page">
        <div className="recuperar-overlay"></div>
        <div className="recuperar-container animate-fade-in" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="recuperar-card glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 1.5rem", display: "block" }} />
            <h1 className="recuperar-title" style={{ fontSize: "1.5rem" }}>Revisa tu correo</h1>
            <p className="recuperar-subtitle" style={{ marginTop: "0.5rem" }}>
              {message}
            </p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: "2rem", display: "inline-flex", textDecoration: "none" }}>
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recuperar-page">
      <div className="recuperar-overlay"></div>
      <div className="recuperar-container animate-fade-in">
        <div className="recuperar-card glass-panel">
          
          <Link href="/login" className="back-link">
            <ArrowLeft size={16} /> Volver
          </Link>

          <div className="recuperar-header">
            <div className="recuperar-icon-wrapper">
              <Mail size={24} />
            </div>
            <h1 className="recuperar-title">RECUPERAR CONTRASEÑA</h1>
            <p className="recuperar-subtitle">Ingresa el correo asociado a tu cuenta</p>
          </div>

          <form className="recuperar-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary recuperar-btn" disabled={loading}>
              {loading ? <div className="spinner-small"></div> : "Enviar Enlace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
