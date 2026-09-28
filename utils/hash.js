import { sha256 } from 'js-sha256';

export async function hashPassword(password) {
  // Utilizamos js-sha256 en lugar de window.crypto.subtle
  // Esto es vital porque window.crypto.subtle es undefined
  // en contextos HTTP que no son localhost (como al entrar desde otra PC o móvil).
  return sha256(password);
}
