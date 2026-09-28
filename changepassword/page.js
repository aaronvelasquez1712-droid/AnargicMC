"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import "./changepassword.css";

function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/recover/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al actualizar la contraseña.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="change-container animate-fade-in" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="change-card glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <AlertCircle size={64} color="#ef4444" style={{ margin: "0 auto 1.5rem", display: "block" }} />
          <h1 className="change-title" style={{ fontSize: "1.5rem" }}>No has solicitado una recuperación de contraseña</h1>
          <p className="change-subtitle" style={{ marginTop: "0.5rem" }}>Redirigiendo al inicio...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="change-container animate-fade-in" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="change-card glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 1.5rem", display: "block" }} />
          <h1 className="change-title" style={{ fontSize: "1.5rem" }}>¡Contraseña Actualizada!</h1>
          <p className="change-subtitle" style={{ marginTop: "0.5rem" }}>Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="change-container animate-fade-in">
      <div className="change-card glass-panel">
        
        <div className="change-header">
          <div className="change-icon-wrapper">
            <Lock size={24} />
          </div>
          <h1 className="change-title">NUEVA CONTRASEÑA</h1>
          <p className="change-subtitle">Crea una nueva contraseña segura</p>
        </div>

        <form className="change-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nueva Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button 
                type="button" 
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

          <button type="submit" className="btn btn-primary change-btn" disabled={loading}>
            {loading ? <div className="spinner-small"></div> : "Guardar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  return (
    <div className="change-page">
      <div className="change-overlay"></div>
      <Suspense fallback={<div className="change-container"><div className="spinner-small"></div></div>}>
        <ChangePasswordForm />
      </Suspense>
    </div>
  );
}
