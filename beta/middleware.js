// Vercel Routing Middleware: simple password gate for the private beta.
// Set BETA_PASSWORD in the Vercel project's environment variables.
// Any username works; only the password is checked.
import { next } from '@vercel/functions';

export const config = { matcher: '/:path*' };

const ROBOTS = { 'X-Robots-Tag': 'noindex, nofollow, noarchive' };

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default function middleware(request) {
  const password = process.env.BETA_PASSWORD;
  if (!password) {
    return new Response('The beta is locked: BETA_PASSWORD is not set.', { status: 503, headers: ROBOTS });
  }
  const auth = request.headers.get('authorization') || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme === 'Basic' && encoded) {
    try {
      const decoded = atob(encoded);
      const given = decoded.slice(decoded.indexOf(':') + 1);
      if (safeEqual(given, password)) return next({ headers: ROBOTS });
    } catch {
      /* malformed header: fall through to 401 */
    }
  }
  return new Response('Password required.', {
    status: 401,
    headers: { ...ROBOTS, 'WWW-Authenticate': 'Basic realm="John Rubino portfolio beta", charset="UTF-8"' },
  });
}
