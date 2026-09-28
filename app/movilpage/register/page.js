"use client";
import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { hashPassword } from "@/utils/hash";
import "../login/login-movil.css"; // We can reuse the login css!

export default function MovilRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      // Validar nick
      const { data: existingNick } = await supabase.from("users").select("id").eq("minecraft_username", minecraftUsername);
      if (existingNick && existingNick.length > 0) {
        throw new Error("El nombre de usuario ya está en uso");
      }

      // Validar email
      const { data: existingEmail } = await supabase.from("users").select("id").eq("email", email);
      if (existingEmail && existingEmail.length > 0) {
        throw new Error("El correo electrónico ya está registrado");
      }

      const hashedPass = await hashPassword(password);
      
      const { error: insertError } = await supabase.from("users").insert({
        minecraft_username: minecraftUsername,
        email: email,
        password_hash: hashedPass
      });

      if (insertError) throw new Error("Hubo un error al registrarte. Intenta de nuevo.");

      setIsSuccess(true);
      
      setTimeout(() => {
        localStorage.setItem("anargic_user", JSON.stringify({ nick: minecraftUsername }));
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
        <h2>¡Cuenta Creada!</h2>
        <p>Bienvenido a AnargicMC, preparándolo todo...</p>
      </div>
    );
  }

  return (
    <div className="m-login-container animate-fade-in">
      <div className="m-login-header">
        <h1>Crear Cuenta</h1>
        <p>Únete a la mejor comunidad</p>
      </div>

      {error && <div className="m-login-error">{error}</div>}

      <form className="m-login-form" onSubmit={handleRegister}>
        <div className="m-input-group">
          <label>Usuario de Minecraft</label>
          <div className="m-input-wrapper">
            <User size={20} className="input-icon" />
            <input 
              type="text"
              placeholder="Ej: Steve"
              value={minecraftUsername}
              onChange={(e) => setMinecraftUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="m-input-group">
          <label>Correo Electrónico</label>
          <div className="m-input-wrapper">
            <Mail size={20} className="input-icon" />
            <input 
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        <div className="m-input-group" style={{ marginBottom: '2rem' }}>
          <label>Confirmar Contraseña</label>
          <div className="m-input-wrapper">
            <Lock size={20} className="input-icon" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="m-btn-submit" disabled={loading}>
          {loading ? "Registrando..." : "Crear Cuenta"}
        </button>
      </form>

      <div className="m-login-footer" style={{ marginTop: '3rem' }}>
        ¿Ya tienes cuenta? <Link href="/movilpage/login">Inicia Sesión</Link>
      </div>
    </div>
  );
}
