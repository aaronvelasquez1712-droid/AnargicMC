import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { hashPassword } from '@/utils/hash';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    // 1. Buscar el token en la BD
    const { data: resetRecord, error: resetError } = await supabase
      .from('password_resets')
      .select('*, users(id)')
      .eq('token', token)
      .eq('is_used', false)
      .single();

    if (resetError || !resetRecord) {
      return NextResponse.json({ error: 'Token inválido o ya utilizado' }, { status: 400 });
    }

    // 2. Verificar si expiró
    const now = new Date();
    const expiresAt = new Date(resetRecord.expires_at);
    if (now > expiresAt) {
      return NextResponse.json({ error: 'El enlace de recuperación ha expirado' }, { status: 400 });
    }

    // 3. Hashear la nueva contraseña
    const hashedPass = await hashPassword(newPassword);

    // 4. Actualizar contraseña del usuario
    const { error: updatePassError } = await supabase
      .from('users')
      .update({ password_hash: hashedPass })
      .eq('id', resetRecord.user_id);

    if (updatePassError) {
      throw new Error('Error al actualizar la contraseña');
    }

    // 5. Marcar token como usado
    await supabase
      .from('password_resets')
      .update({ is_used: true })
      .eq('id', resetRecord.id);

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' }, { status: 200 });

  } catch (error) {
    console.error('Error en update password route:', error);
    return NextResponse.json({ error: 'Ocurrió un error al cambiar la contraseña' }, { status: 500 });
  }
}
