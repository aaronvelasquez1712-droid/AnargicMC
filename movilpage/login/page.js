"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { hashPassword } from "@/utils/hash";
import "./login-movil.css";

export default function MovilLoginPage() {
  const [loginMethod, setLoginMethod] = useState("nick");
  const [showPassword, setShowPassword] = useState(false);
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDiscordLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI?.replace("/api/discord/callback", "/oauth/discord");
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

      setIsSuccess(true);
      
      setTimeout(() => {
        localStorage.setItem("anargic_user", JSON.stringify({ nick: data.minecraft_username }));
        window.location.href = "/movilpage";
      }, 2000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="m-login-container animate-fade-in success-state">
        <CheckCircle size={80} className="success-icon" />
        <h2>¡Bienvenido!</h2>
        <p>Redirigiendo a tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="m-login-container animate-fade-in">
      <div className="m-login-header">
        <h1>Iniciar Sesión</h1>
        <p>Ingresa a tu cuenta de AnargicMC</p>
      </div>

      <div className="m-login-tabs">
        <button 
          className={`m-login-tab ${loginMethod === 'nick' ? 'active' : ''}`}
          onClick={() => setLoginMethod("nick")}
        >
          Nickname
        </button>
        <button 
          className={`m-login-tab ${loginMethod === 'email' ? 'active' : ''}`}
          onClick={() => setLoginMethod("email")}
        >
          Correo
        </button>
      </div>

      {error && <div className="m-login-error">{error}</div>}

      <form className="m-login-form" onSubmit={handleLogin}>
        <div className="m-input-group">
          <label>{loginMethod === "nick" ? "Usuario de Minecraft" : "Correo Electrónico"}</label>
          <div className="m-input-wrapper">
            {loginMethod === "nick" ? <User size={20} className="input-icon" /> : <Mail size={20} className="input-icon" />}
            <input 
              type={loginMethod === "nick" ? "text" : "email"}
              placeholder={loginMethod === "nick" ? "Ej: Steve" : "correo@ejemplo.com"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="m-input-group">
          <label>Contraseña</label>
          <div className="m-input-wrapper">
            <Lock size={20} className="input-icon" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="m-forgot-pass">
          <Link href="/movilpage/recuperar">¿Olvidaste tu contraseña?</Link>
        </div>

        <button type="submit" className="m-btn-submit" disabled={loading}>
          {loading ? "Verificando..." : "Entrar"}
        </button>
      </form>

      <div className="m-login-divider">
        <span>O ingresa con</span>
      </div>

      <button className="m-btn-discord-login" onClick={handleDiscordLogin}>
        <MessageSquare size={20} /> Continuar con Discord
      </button>

      <div className="m-login-footer">
        ¿No tienes cuenta? <Link href="/movilpage/register">Regístrate</Link>
      </div>
    </div>
  );
}
