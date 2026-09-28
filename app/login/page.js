"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, LogIn, Hash, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { hashPassword } from "@/utils/hash";
import { useRouter } from "next/navigation";
import "./login.css";

export default function Login() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState("nick");
  const [showPassword, setShowPassword] = useState(false);
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDiscordLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI.replace("/api/discord/callback", "/oauth/discord");
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
    window.location.href = discordAuthUrl;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const hashedPass = await hashPassword(password);
      
      const query = supabase.from("users").select("*");
      if (loginMethod === "nick") {
        query.eq("minecraft_username", identifier);
      } else {
        query.eq("email", identifier);
      }
      query.eq("password_hash", hashedPass);

      const { data, error: dbError } = await query.single();

      if (dbError || !data) {
        throw new Error("Credenciales incorrectas");
      }

      if (data.is_banned) {
        throw new Error("Esta cuenta está baneada: " + (data.ban_reason || "Sin razón especificada"));
      }

      // Show success state
      setIsSuccess(true);
      
      // Wait 3 seconds before redirecting
      setTimeout(() => {
        localStorage.setItem("anargic_user", JSON.stringify({ nick: data.minecraft_username }));
        window.location.href = "/";
      }, 3000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="login-page">
        <div className="login-overlay"></div>
        <div className="login-container animate-fade-in" style={{ alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div className="login-card glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 1.5rem", display: "block" }} />
            <h1 className="login-title" style={{ fontSize: "1.5rem" }}>Verificación completada</h1>
            <p className="login-subtitle" style={{ marginTop: "0.5rem" }}>Redirigiendo...</p>
            <div className="spinner" style={{ margin: "1.5rem auto 0" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Background overlay specifically for login if needed, or rely on global bg */}
      <div className="login-overlay"></div>

      <div className="login-container animate-fade-in">
        <div className="login-card glass-panel">
          <div className="login-header">
            <div className="login-icon-wrapper">
              <LogIn size={24} />
            </div>
            <h1 className="login-title">INICIAR SESIÓN</h1>
            <p className="login-subtitle">Usa tu nick o email</p>
          </div>

          <div className="login-tabs">
            <button 
              className={`tab-btn ${loginMethod === "nick" ? "active" : ""}`}
              onClick={() => setLoginMethod("nick")}
            >
              <User size={16} /> Nick
            </button>
            <button 
              className={`tab-btn ${loginMethod === "email" ? "active" : ""}`}
              onClick={() => setLoginMethod("email")}
            >
              <Mail size={16} /> Email
            </button>
          </div>

          {error && <div className="error-message" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "10px", borderRadius: "8px", textAlign: "center", marginBottom: "1rem", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "0.9rem" }}>{error}</div>}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  {loginMethod === "nick" ? <User size={18} /> : <Mail size={18} />}
                </span>
                <input 
                  type={loginMethod === "email" ? "email" : "text"} 
                  className="form-input" 
                  placeholder={loginMethod === "nick" ? "Ej: Notch" : "ejemplo@correo.com"} 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              {loginMethod === "nick" && (
                <p className="input-hint">
                  <span className="hint-icon">!</span> El nick distingue mayúsculas y minúsculas
                </p>
              )}
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Contraseña</label>
                <Link href="/recuperar" className="forgot-password">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input" 
                  placeholder="Contraseña" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            <div style={{ textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
              <Link href="/recuperar" style={{ color: "#a1a1aa", fontSize: "0.85rem", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "#c084fc"} onMouseOut={(e) => e.target.style.color = "#a1a1aa"}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className="btn btn-submit" disabled={loading}>
              <LogIn size={18} /> {loading ? "Verificando datos..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="divider">
            <span>o</span>
          </div>

          <div className="social-login">
            <button className="btn btn-social btn-microsoft btn-coming-soon" disabled>
              <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h10v10H0zM11 0h10v10H11zM0 11h10v10H0zM11 11h10v10H11z" fill="#71717a"/>
              </svg>
              Iniciar sesión con Microsoft
              <span className="coming-soon-badge">Próximamente</span>
            </button>
            <button type="button" className="btn btn-social btn-discord" onClick={handleDiscordLogin}>
              <svg width="18" height="18" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fff" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.16,65.69,84.69,65.69Z"/>
              </svg>
              Iniciar sesión con Discord
            </button>
          </div>

          <div className="login-footer">
            <Link href="/register" className="register-link">
              ¿No tienes cuenta vinculada? <span className="arrow-icon">›</span>
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
