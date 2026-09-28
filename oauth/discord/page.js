"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import "./discord.css";

function DiscordCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Conectando con Discord...");

  useEffect(() => {
    const processDiscordAuth = async () => {
      const code = searchParams.get("code");
      
      if (!code) {
        setStatus("error");
        setMessage("No se proporcionó ningún código de autorización.");
        return;
      }

      try {
        // 1. Enviar el código a nuestra API para que lo intercambie por los datos del usuario
        const res = await fetch("/api/discord", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const discordData = await res.json();

        if (!res.ok || discordData.error) {
          throw new Error(discordData.error || "Error al conectar con Discord");
        }

        const discordId = discordData.id;
        const discordUsername = discordData.username;
        const discordAvatar = discordData.avatar;

        // 2. Determinar si el usuario está intentando VINCULAR o INICIAR SESIÓN
        const storedUser = localStorage.getItem("anargic_user");

        if (storedUser) {
          // =======================
          // FLUJO DE VINCULACIÓN
          // =======================
          const { nick } = JSON.parse(storedUser);
          
          // Actualizar la fila del usuario en Supabase con sus datos de Discord
          const { error: updateError } = await supabase
            .from("users")
            .update({
              discord_id: discordId,
              discord_username: discordUsername,
              discord_avatar: discordAvatar
            })
            .eq("minecraft_username", nick);

          if (updateError) {
            console.error(updateError);
            throw new Error("No se pudo vincular la cuenta en la base de datos.");
          }

          // Notificar al bot de Rei Ayanami para asignar el rol "verificado"
          // (La llamada se hace desde el servidor de Next.js, no desde el navegador)
          try {
            await fetch("/api/bot/assign-role", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ discord_id: discordId })
            });
          } catch (botError) {
            console.warn("No se pudo contactar al bot para asignar el rol:", botError);
          }

          setStatus("success");
          setMessage(`¡Tu cuenta de Discord (${discordUsername}) se vinculó correctamente!`);
          
          setTimeout(() => {
            router.push("/perfil");
          }, 3000);

        } else {
          // =======================
          // FLUJO DE INICIO DE SESIÓN
          // =======================
          
          // Buscar si hay algún usuario con este discord_id
          const { data: users, error: selectError } = await supabase
            .from("users")
            .select("minecraft_username, is_banned, ban_reason")
            .eq("discord_id", discordId)
            .limit(1);

          if (selectError) {
            console.error(selectError);
            throw new Error("Error al consultar la base de datos.");
          }

          if (!users || users.length === 0) {
            throw new Error("Esta cuenta de Discord no está vinculada a ningún usuario. Por favor, inicia sesión normalmente y vincúlala desde tu perfil.");
          }

          const user = users[0];

          if (user.is_banned) {
            throw new Error(`Esta cuenta está baneada: ${user.ban_reason || "Sin razón"}`);
          }

          // Crear la sesión en el cliente
          localStorage.setItem("anargic_user", JSON.stringify({ nick: user.minecraft_username }));
          
          setStatus("success");
          setMessage(`¡Bienvenido de nuevo, ${user.minecraft_username}! Iniciando sesión...`);
          
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
        
        setTimeout(() => {
          if (!localStorage.getItem("anargic_user")) {
            router.push("/login");
          } else {
            router.push("/perfil");
          }
        }, 5000);
      }
    };

    processDiscordAuth();
  }, [router, searchParams]);

  return (
    <div className="discord-callback-container">
      <div className="discord-card glass-panel animate-fade-in">
        {status === "loading" && (
          <>
            <div className="spinner"></div>
            <h2>Procesando...</h2>
            <p>{message}</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle size={64} color="#10b981" />
            <h2>¡Éxito!</h2>
            <p>{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={64} color="#ef4444" />
            <h2>Error</h2>
            <p style={{ color: "#ef4444" }}>{message}</p>
            <p className="redirect-text">Serás redirigido en breve...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function DiscordCallback() {
  return (
    <div className="login-page">
      <div className="login-overlay"></div>
      <Suspense fallback={
        <div className="discord-callback-container">
          <div className="discord-card glass-panel">
            <div className="spinner"></div>
            <h2>Cargando...</h2>
          </div>
        </div>
      }>
        <DiscordCallbackContent />
      </Suspense>
    </div>
  );
}
