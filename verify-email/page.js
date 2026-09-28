"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import "./verify.css";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verificando tu enlace...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("El enlace es inválido o no existe.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/email/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        
        if (res.ok) {
          setStatus("success");
          setMessage("Tu nuevo correo electrónico ha sido verificado y actualizado con éxito.");
        } else {
          setStatus("error");
          setMessage(data.error || "Ocurrió un error al verificar el correo.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Hubo un error de conexión al intentar verificar el correo.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="verify-page">
      <div className="verify-overlay"></div>
      
      <div className="verify-container glass-panel">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
        
        <div className="verify-header">
          <div className={`verify-icon-wrapper ${status}`}>
            {status === "loading" && <div className="spinner-small" style={{ borderColor: "rgba(59, 130, 246, 0.3)", borderTopColor: "#3b82f6" }}></div>}
            {status === "success" && <CheckCircle size={32} color="#10b981" />}
            {status === "error" && <XCircle size={32} color="#ef4444" />}
          </div>
          
          <h1 className="verify-title">
            {status === "loading" && "Procesando..."}
            {status === "success" && "¡Correo Verificado!"}
            {status === "error" && "Error de Verificación"}
          </h1>
          <p className="verify-subtitle">{message}</p>
        </div>

        {status === "success" && (
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href="/configuracion" className="btn btn-primary">
              Ir a Configuración
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="verify-page"><div className="verify-container glass-panel" style={{ textAlign: "center", padding: "3rem" }}>Cargando validación...</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
