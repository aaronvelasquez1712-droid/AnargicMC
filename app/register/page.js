"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { hashPassword } from "@/utils/hash";
import { useRouter } from "next/navigation";
import "./register.css";

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ nick: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm) {
      return setError("Las contraseñas no coinciden");
    }
    if (formData.password.length < 8) {
      return setError("La contraseña debe tener al menos 8 caracteres");
    }

    setLoading(true);
    try {
      const hashedPass = await hashPassword(formData.password);

      const { data, error: dbError } = await supabase
        .from("users")
        .insert([
          { 
            minecraft_username: formData.nick, 
            email: formData.email, 
            password_hash: hashedPass,
            rank: "USER",
            balance: 0.00,
            playtime_minutes: 0,
            is_banned: false
          }
        ]);

      if (dbError) {
        if (dbError.code === "23505") { // Unique violation
          throw new Error("El Nick o Email ya están registrados");
        }
        throw new Error(dbError.message);
      }

      // Show success state
      setIsSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        localStorage.setItem("anargic_user", JSON.stringify({ nick: formData.nick }));
        window.location.href = "/";
      }, 3000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="register-page">
        <div className="register-overlay"></div>
        <div className="register-container animate-fade-in" style={{ alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div className="register-card glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 1.5rem", display: "block" }} />
            <h1 className="register-title" style={{ fontSize: "1.5rem" }}>Cuenta creada con éxito</h1>
            <p className="register-subtitle" style={{ marginTop: "0.5rem" }}>Redirigiendo...</p>
            <div className="spinner" style={{ margin: "1.5rem auto 0" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-bg-canvas">
        <div className="register-grid-lines"></div>
      </div>
      <div className="register-overlay"></div>

      <div className="register-container animate-fade-in">
        <div className="register-card glass-panel">
          <div className="register-header">
            <div className="register-icon-wrapper">
              <UserPlus size={24} />
            </div>
            <h1 className="register-title">CREAR CUENTA</h1>
            <p className="register-subtitle">Únete a AnargicMC</p>
          </div>

          {error && <div className="error-message" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "10px", borderRadius: "8px", textAlign: "center", marginBottom: "1rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>{error}</div>}

          <form className="register-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nick de Minecraft</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej: Notch" 
                  required
                  value={formData.nick}
                  onChange={(e) => setFormData({ ...formData, nick: e.target.value })}
                />
              </div>
              <p className="input-hint">
                <span className="hint-icon">!</span> Debe ser tu nick exacto en el juego
              </p>
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="ejemplo@correo.com" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input" 
                  placeholder="Mínimo 8 caracteres" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input" 
                  placeholder="Repite tu contraseña" 
                  required
                  value={formData.confirm}
                  onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-submit" disabled={loading}>
              <UserPlus size={18} /> {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <div className="register-footer">
            <Link href="/login" className="login-link">
              ¿Ya tienes una cuenta? Iniciar Sesión <span className="arrow-icon">›</span>
            </Link>
          </div>
        </div>

        <div className="back-link-container">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
