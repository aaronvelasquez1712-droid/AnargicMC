import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { discord_id } = await request.json();

    if (!discord_id) {
      return NextResponse.json({ error: "Falta discord_id" }, { status: 400 });
    }

    const botUrl = process.env.BOT_URL || "http://localhost:3001";
    const botSecret = process.env.BOT_SECRET || "anargic-internal-key-2024";

    const response = await fetch(`${botUrl}/assign-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discord_id, secret: botSecret }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Bot respondió con error:", data);
      return NextResponse.json({ error: data.error || "Error en el bot" }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al contactar al bot:", error);
    return NextResponse.json({ error: "No se pudo contactar al bot" }, { status: 500 });
  }
}
