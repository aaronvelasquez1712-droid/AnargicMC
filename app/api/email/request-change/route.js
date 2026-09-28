import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { userId, newEmail } = await req.json();

    if (!userId || !newEmail) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    // 1. Obtener usuario actual
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('minecraft_username, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.email === newEmail) {
      return NextResponse.json({ error: 'El nuevo correo es idéntico al actual' }, { status: 400 });
    }

    // 2. Comprobar que el nuevo correo no esté en uso por otro
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', newEmail)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Este correo ya está en uso por otra cuenta' }, { status: 400 });
    }

    // 3. Generar token y expiración (1 hora)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const { error: insertError } = await supabase
      .from('email_changes')
      .insert({
        user_id: userId,
        new_email: newEmail,
        token: token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      throw new Error('Error al registrar la solicitud de cambio');
    }

    // 4. Enviar correo a la NUEVA dirección
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'http';
    const verifyLink = `${protocol}://${host}/verify-email?token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 0; background-color: #080810; color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .container { max-width: 600px; margin: 40px auto; background-color: #12121a; padding: 30px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #ffffff; }
          .logo-mc { color: #3b82f6; }
          .content { font-size: 16px; line-height: 1.6; color: #d4d4d8; text-align: center; }
          .btn-container { text-align: center; margin: 30px 0; }
          .btn { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 12px; color: #71717a; }
          .socials { margin-top: 15px; display: flex; justify-content: center; gap: 15px; align-items: center; }
          .social-link { color: #3b82f6; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; justify-content: center; }
          .social-icon { width: 20px; height: 20px; margin-right: 6px; vertical-align: middle; }
          .warning { font-size: 13px; color: #a1a1aa; margin-top: 25px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ANARGIC<span class="logo-mc">MC</span></div>
          </div>
          <div class="content">
            <h2>Verificar nuevo correo</h2>
            <p>Hola <strong>${user.minecraft_username}</strong>,</p>
            <p>Se ha solicitado cambiar el correo de tu cuenta a esta dirección. Para confirmar este cambio, haz clic en el siguiente botón.</p>
            <p style="font-size: 14px; color: #a1a1aa;">Este enlace caducará automáticamente en <strong>1 hora</strong>.</p>
            
            <div class="btn-container">
              <a href="${verifyLink}" class="btn">Verificar Correo Electrónico</a>
            </div>

            <p class="warning">Si no solicitaste este cambio, simplemente ignora este correo. Tu cuenta de AnargicMC seguirá usando tu dirección anterior.</p>
          </div>
          
          <div class="footer">
            <p>Conéctate con nuestra comunidad:</p>
            <div class="socials">
              <a href="https://www.tiktok.com/@FluxzyZzz" class="social-link" target="_blank">
                <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" class="social-icon" />
                @FluxzyZzz
              </a>
              <span style="color: rgba(255,255,255,0.1)">|</span>
              <a href="https://www.instagram.com/FluxzyZzz" class="social-link" target="_blank">
                <img src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" alt="Instagram" class="social-icon" />
                @FluxzyZzz
              </a>
            </div>
            <p style="margin-top: 20px;">© 2024 AnargicMC. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: '"AnargicMC Soporte" <' + process.env.EMAIL_USER + '>',
      to: newEmail,
      subject: '📩 Verifica tu nuevo correo - AnargicMC',
      html: htmlContent,
    });

    return NextResponse.json({ message: 'Se ha enviado un enlace de verificación a tu nuevo correo.' }, { status: 200 });

  } catch (error) {
    console.error('Error in request-change email:', error);
    return NextResponse.json({ error: 'Ocurrió un error interno' }, { status: 500 });
  }
}
