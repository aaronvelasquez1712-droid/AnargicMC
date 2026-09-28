import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const txId = searchParams.get('id');

    if (!txId) {
      return new NextResponse('Falta ID de transacción', { status: 400 });
    }

    // 1. Fetch Transaction
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('*, users(*)')
      .eq('id', txId)
      .single();

    if (txError || !tx) {
      return new NextResponse('Transacción no encontrada', { status: 404 });
    }

    if (tx.status === 'completed') {
      return new NextResponse('Esta transacción ya fue confirmada previamente.', { status: 200 });
    }

    const user = tx.users;

    // 2. Grant Item
    let updatePayload = {};
    
    if (tx.item_type === 'COSMETIC' || tx.item_type === 'FRAME' || tx.item_type === 'PROFILE_PIC' || tx.item_type === 'BANNER') {
      const currentUnlocked = user.cosmetics_unlocked || [];
      if (!currentUnlocked.includes(tx.item_token)) {
        updatePayload.cosmetics_unlocked = [...currentUnlocked, tx.item_token];
      }
    } else if (tx.item_type === 'RANGO') {
      updatePayload.rank = tx.item_token || tx.item_name;
    }
    
    // Add logic here if you want to store kits in a 'kits_unlocked' array in the future

    // Update User
    if (Object.keys(updatePayload).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', user.id);
        
      if (userError) {
        console.error("Error updating user:", userError);
        return new NextResponse('Error al actualizar el usuario', { status: 500 });
      }
    }

    // 3. Mark transaction as completed
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({ status: 'completed', updated_at: new Date() })
      .eq('id', txId);

    if (updateTxError) {
      console.error("Error updating transaction:", updateTxError);
      return new NextResponse('Error al actualizar estado de la transacción', { status: 500 });
    }

    // 4. Send Email to User (if they have an email)
    if (user.email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"Anargic Network (Tienda)" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `✅ Compra Confirmada: ${tx.item_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #fff; padding: 20px; border-radius: 10px;">
            <h1 style="color: #10b981; text-align: center;">¡Tu compra fue confirmada!</h1>
            <p>Hola <strong>${user.minecraft_username}</strong>,</p>
            <p>Tu compra del artículo <strong>${tx.item_name}</strong> ha sido verificada y confirmada con éxito por nuestro equipo de soporte.</p>
            
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0;">El artículo ha sido añadido a tu cuenta. Ya puedes ir a la configuración de la web o entrar al servidor para disfrutar de sus beneficios.</p>
            </div>

            <p style="text-align: center; color: #a1a1aa; margin-top: 30px;">
              Si no te llega el artículo a tu cuenta, escríbenos en nuestro servidor de Discord oficial:
            </p>
            <div style="text-align: center; margin-top: 15px;">
              <a href="https://discord.gg/9bBBrqafVd" style="background-color: #5865F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Soporte en Discord
              </a>
            </div>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.error("No se pudo enviar el correo al usuario:", mailErr);
        // We don't fail the whole request just because the user email failed
      }
    }

    // 5. Render Success Response
    return new NextResponse(`
      <html>
        <body style="background: #18181b; color: #fff; font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #10b981;">✅ Transacción Aprobada</h1>
          <p>El artículo "${tx.item_name}" ha sido entregado a ${user.minecraft_username}.</p>
          <p>Se le ha enviado un correo electrónico de confirmación (si tenía uno vinculado).</p>
          <p style="color: #a1a1aa; font-size: 14px;">Ya puedes cerrar esta ventana.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error('Error in confirm route:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
