/**
 * Resolves the correct avatar URL for a user following priority:
 * 1. Equipped Tienda photo (cosmetic) using cached URL
 * 2. Custom face extracted from uploaded skin
 * 3. Minotar (minecraft skin face) - shows real face if they have one on Mojang
 * 4. Steve fallback
 */
export function getAvatarSrc(user, size = 64) {
  if (!user) return `https://minotar.net/helm/Steve/${size}.png`;

  // Use the cached URL directly from the database if they equipped a store avatar
  if (user.equipped_profile_pic_url) {
    return user.equipped_profile_pic_url;
  }

  if (user.custom_face_url) {
    return user.custom_face_url;
  }

  return `https://minotar.net/helm/${user.minecraft_username || 'Steve'}/${size}.png`;
}

/**
 * Returns the frame image URL using the cached URL if the user has one equipped, null otherwise.
 */
export function getFrameSrc(user) {
  if (!user?.equipped_frame_url) return null;
  return user.equipped_frame_url;
}

/**
 * AvatarWithFrame: Returns props object to render avatar + frame overlay
 * Usage: const { avatarSrc, frameSrc } = getAvatarWithFrame(user);
 */
export function getAvatarWithFrame(user, size = 64) {
  return {
    avatarSrc: getAvatarSrc(user, size),
    frameSrc: getFrameSrc(user),
  };
}
