import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    const userId = formData.get('userId');
    const phone = formData.get('phone');
    const documentId = formData.get('documentId');
    const reference = formData.get('reference');
    const platform = formData.get('platform');
    
    // Item details
    const itemName = formData.get('itemName');
    const itemPrice = formData.get('itemPrice');
    const itemType = formData.get('itemType'); // 'RANGO', 'KIT', 'COSMETIC'
    const itemToken = formData.get('itemToken'); // e.g. 'marco_fuego' or 'mvp'
    
    const proofImage = formData.get('proofImage'); // File
    
    if (!userId || !reference || !proofImage || !itemName) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const transactionId = crypto.randomUUID();

    // 1. Insert into Supabase transactions table (pending) without .select() to avoid RLS read error
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        user_id: userId,
        buyer_phone: phone,
        buyer_document: documentId,
        reference_number: reference,
        payment_platform: platform,
        amount: parseFloat(itemPrice) || 0,
        status: 'pending',
        item_name: itemName,
        item_type: itemType,
        item_token: itemToken
      });

    if (txError) {
      console.error("Error inserción DB:", txError);
      return NextResponse.json({ error: 'Error al registrar la transacción en la base de datos' }, { status: 500 });
    }

    // 2. Prepare Email Attachment
    const arrayBuffer = await proofImage.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Construir el enlace de confirmación
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.1.18:3000';
    const confirmUrl = `${baseUrl}/api/transactions/confirm?id=${transactionId}`;

    const mailOptions = {
      from: `"Anargic Network (Tienda)" <${process.env.EMAIL_USER}>`,
      to: 'Davidvelasquez0717@gmail.com',
      subject: `💰 Nueva Compra Pendiente: ${itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #fff; padding: 20px; border-radius: 10px;">
          <h1 style="color: #3b82f6; text-align: center;">Nueva Transacción Pendiente</h1>
          <p>Se ha registrado un nuevo pago en la tienda de Anargic Network. Revisa los datos y el comprobante adjunto.</p>
          
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Artículo:</strong> ${itemName} (${itemPrice} USD)</p>
            <p><strong>Plataforma:</strong> ${platform}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Cédula:</strong> ${documentId}</p>
            <p><strong>Referencia:</strong> ${reference}</p>
          </div>

          <p style="text-align: center; color: #a1a1aa;">El comprobante ha sido adjuntado a este correo.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${confirmUrl}" style="background-color: #10b981; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              ✅ Confirmar Compra y Entregar Artículo
            </a>
          </div>
          
          <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #71717a;">
            Si los datos no coinciden o el pago es falso, simplemente ignora o elimina este correo. La compra no se procesará.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: proofImage.name || 'comprobante.jpg',
          content: buffer
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, transactionId });
  } catch (error) {
    console.error('Error submitting transaction:', error);
    return NextResponse.json({ error: 'Error interno del servidor al enviar el correo' }, { status: 500 });
  }
}
