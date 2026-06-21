// Cache for photos indexed by address prefix (text before first comma)
const photoCache = new Map<string, { photoUrl: string; timestamp: number }>();

// Cache validity in milliseconds (24 hours)
const CACHE_VALIDITY = 24 * 60 * 60 * 1000;

export function getAddressPrefix(address: string): string {
  if (!address) return '';
  const prefix = address.split(',')[0].trim();
  return prefix;
}

export function getCachedPhoto(address: string): string | null {
  const prefix = getAddressPrefix(address);
  if (!prefix) return null;

  const cached = photoCache.get(prefix);
  if (!cached) return null;

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_VALIDITY) {
    photoCache.delete(prefix);
    return null;
  }

  return cached.photoUrl;
}

export function setCachedPhoto(address: string, photoUrl: string): void {
  const prefix = getAddressPrefix(address);
  if (!prefix) return;

  photoCache.set(prefix, {
    photoUrl,
    timestamp: Date.now(),
  });
}

export function clearPhotoCache(): void {
  photoCache.clear();
}
