/**
 * Simple in-memory rate limiter
 * 
 * Omezuje počet requestů z jedné IP adresy.
 * Používá se jako backup ochrana spolu s Turnstile.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory storage (resetuje se při restartu serveru)
const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries každých 10 minut
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Zkontroluje rate limit pro danou IP adresu
 * 
 * @param identifier - Identifikátor (obvykle IP adresa)
 * @param maxRequests - Maximální počet requestů (default: 5)
 * @param windowMs - Časové okno v milisekundách (default: 1 hodina)
 * @returns true pokud je request povolen, false pokud je překročen limit
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 60 * 1000 // 1 hodina
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Žádný záznam nebo resetovat
  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  // Increment counter
  entry.count++;
  rateLimitMap.set(identifier, entry);

  const remaining = Math.max(0, maxRequests - entry.count);
  const allowed = entry.count <= maxRequests;

  return { allowed, remaining, resetAt: entry.resetAt };
}

/**
 * Získá IP adresu z request headers
 * 
 * @param headers - Next.js request headers
 * @returns IP adresa nebo 'unknown'
 */
export function getClientIp(headers: Headers): string {
  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  // Vercel
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();

  // Standard
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  return 'unknown';
}

/**
 * Formátuje zbývající čas do čitelného formátu
 * 
 * @param resetAt - Timestamp kdy se limit resetuje
 * @returns Formátovaný string (např. "za 45 minut")
 */
export function formatResetTime(resetAt: number): string {
  const now = Date.now();
  const diff = resetAt - now;

  if (diff <= 0) return 'teď';

  const minutes = Math.ceil(diff / (60 * 1000));
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `za ${hours}h ${remainingMinutes}m`;
  }

  return `za ${minutes} minut`;
}


