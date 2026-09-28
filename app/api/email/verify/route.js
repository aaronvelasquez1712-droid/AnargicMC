import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Falta el token de verificación' }, { status: 400 });
    }

    // 1. Buscar el token
    const { data: changeReq, error: fetchError } = await supabase
      .from('email_changes')
      .select('id, user_id, new_email, expires_at, is_used, users(minecraft_username)')
      .eq('token', token)
      .single();

    if (fetchError || !changeReq) {
      return NextResponse.json({ error: 'El enlace de verificación no es válido.' }, { status: 400 });
    }

    if (changeReq.is_used) {
      return NextResponse.json({ error: 'Este enlace ya ha sido utilizado.' }, { status: 400 });
    }

    if (new Date(changeReq.expires_at) < new Date()) {
      return NextResponse.json({ error: 'El enlace de verificación ha caducado.' }, { status: 400 });
    }

    // 2. Actualizar el usuario
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ email: changeReq.new_email })
      .eq('id', changeReq.user_id);

    if (updateUserError) {
      return NextResponse.json({ error: 'Error al actualizar el correo en la base de datos' }, { status: 500 });
    }

    // 3. Marcar token como usado
    await supabase
      .from('email_changes')
      .update({ is_used: true })
      .eq('id', changeReq.id);

    // 4. Enviar correo de éxito
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const username = changeReq.users?.minecraft_username || 'Jugador';

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
          .success-icon { font-size: 48px; color: #10b981; margin-bottom: 20px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 12px; color: #71717a; }
          .socials { margin-top: 15px; display: flex; justify-content: center; gap: 15px; align-items: center; }
          .social-link { color: #3b82f6; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; justify-content: center; }
          .social-icon { width: 20px; height: 20px; margin-right: 6px; vertical-align: middle; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ANARGIC<span class="logo-mc">MC</span></div>
          </div>
          <div class="content">
            <div class="success-icon">✓</div>
            <h2>¡Cambio Exitoso!</h2>
            <p>Hola <strong>${username}</strong>,</p>
            <p>El cambio de correo se realizó correctamente. Ahora <strong>${changeReq.new_email}</strong> será tu correo para acceder y recuperar tu cuenta de AnargicMC en el futuro.</p>
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
      to: changeReq.new_email,
      subject: '✅ Cambio de correo exitoso - AnargicMC',
      html: htmlContent,
    });

    return NextResponse.json({ message: 'Correo verificado y actualizado con éxito' }, { status: 200 });

  } catch (error) {
    console.error('Error in verify email:', error);
    return NextResponse.json({ error: 'Ocurrió un error interno' }, { status: 500 });
  }
}
