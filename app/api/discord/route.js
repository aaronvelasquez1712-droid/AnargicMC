import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // 1. Intercambiar el código por un token de acceso
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        // The redirect URI must perfectly match the one used during authorization
        redirect_uri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI.replace("/api/discord/callback", "/oauth/discord"), 
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Discord Token Error:", tokenData);
      return NextResponse.json({ error: tokenData.error_description || "Error exchanging token" }, { status: 400 });
    }

    const { access_token } = tokenData;

    // 2. Obtener los datos del usuario usando el token
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (userData.error || !userData.id) {
      console.error("Discord User Error:", userData);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 400 });
    }

    // Devolver los datos del usuario de Discord al frontend
    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
    });

  } catch (error) {
    console.error("Discord API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
