import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // user ID de Anargic (UUID)
  const error = searchParams.get("error");

  // Si el usuario canceló la autorización en Discord
  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL("/configuracion?discord=cancelled", request.url)
    );
  }

  try {
    // 1. Intercambiar el code por un access_token de Discord
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Error al obtener token de Discord");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Obtener el perfil del usuario en Discord
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      throw new Error("Error al obtener perfil de Discord");
    }

    const discordUser = await userRes.json();
    // discordUser.id, discordUser.username, discordUser.discriminator, discordUser.global_name

    const discordTag =
      discordUser.discriminator === "0"
        ? discordUser.global_name || discordUser.username
        : `${discordUser.username}#${discordUser.discriminator}`;

    // 3. Guardar la vinculación en la tabla discord_links de Supabase
    // Convertir el color (int) a hex string si existe
    let accentColor = null;
    if (discordUser.accent_color != null) {
      accentColor = "#" + discordUser.accent_color.toString(16).padStart(6, "0");
    }

    const { error: upsertError } = await supabase
      .from("discord_links")
      .upsert(
        {
          user_id: state,
          discord_id: discordUser.id,
          discord_tag: discordTag,
          discord_avatar: discordUser.avatar, // Hash
          discord_banner: discordUser.banner, // Hash
          discord_color: accentColor,
        },
        { onConflict: "user_id" } // Si ya tiene vinculado, actualizar
      );

    if (upsertError) {
      throw new Error("Error al guardar en base de datos: " + upsertError.message);
    }

    // 4. Desbloquear automáticamente los cosméticos de Discord
    // Buscar todos los cosméticos con source = 'DISCORD'
    const { data: discordCosmetics } = await supabase
      .from("cosmetics")
      .select("token")
      .eq("source", "DISCORD");

    if (discordCosmetics && discordCosmetics.length > 0) {
      // Obtener los cosméticos actuales del usuario
      const { data: userData } = await supabase
        .from("users")
        .select("cosmetics_unlocked")
        .eq("id", state)
        .limit(1);

      const currentUnlocked = userData?.[0]?.cosmetics_unlocked || [];
      const discordTokens = discordCosmetics.map(c => String(c.token));
      
      // Añadir solo los que no tiene ya
      const newUnlocked = [...new Set([...currentUnlocked, ...discordTokens])];
      
      await supabase
        .from("users")
        .update({ cosmetics_unlocked: newUnlocked })
        .eq("id", state);
    }

    // 5. Redirigir al usuario de vuelta a Configuración con mensaje de éxito
    return NextResponse.redirect(
      new URL(`/configuracion?discord=success&tag=${encodeURIComponent(discordTag)}`, request.url)
    );
  } catch (err) {
    console.error("Discord OAuth error:", err);
    return NextResponse.redirect(
      new URL("/configuracion?discord=error", request.url)
    );
  }
}
