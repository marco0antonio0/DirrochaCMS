/**
 * Headers de seguranca.
 *
 * O cookie de sessao e HttpOnly, portanto um XSS nao rouba o token -- mas ainda poderia
 * agir como o usuario a partir da propria origem. A CSP reduz essa superficie, e o
 * frame-ancestors/X-Frame-Options impede clickjacking do painel.
 *
 * `unsafe-inline` em style-src e necessario para Tailwind/HeroUI, que injetam estilos
 * inline. `unsafe-eval` fica restrito ao desenvolvimento, onde o Fast Refresh depende.
 */
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Imagens dos registros sao data URLs base64 gravadas no proprio documento.
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O Next anuncia a versao num header por padrao; nao ha motivo para isso.
  poweredByHeader: false,

  async headers() {
    return [
      // A API publica de endpoints e consumida por outras origens (CORS `*`), portanto a
      // CSP do painel nao se aplica a ela.
      {
        source: "/((?!api/).*)",
        headers: securityHeaders,
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Respostas do painel nunca devem ser cacheadas por proxies.
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
