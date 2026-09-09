'use client';

/**
 * Public-page field. Storefront composition (big wash, graphic on the
 * right) without coin clipart. Palette stays Ursa teal / black / amber.
 */
export default function HeroBackdrop({
  intensity = 'hero',
}: {
  intensity?: 'hero' | 'page';
}) {
  const soft = intensity === 'page';
  const uid = intensity;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div
        className="absolute inset-0"
        style={{
          background: soft
            ? 'radial-gradient(980px 640px at 92% -8%, rgba(20,184,166,0.20), transparent 58%), radial-gradient(720px 520px at -8% 108%, rgba(13,148,136,0.12), transparent 52%), var(--bg-primary)'
            : 'radial-gradient(920px 680px at 88% 6%, rgba(20,184,166,0.34), transparent 54%), radial-gradient(700px 480px at 6% 96%, rgba(13,148,136,0.18), transparent 50%), radial-gradient(480px 360px at 72% 70%, rgba(245,158,11,0.05), transparent 62%), var(--bg-primary)',
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMid slice"
      >
        <defs>
          <linearGradient id={`ring-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.0" />
            <stop offset="38%" stopColor="#14B8A6" stopOpacity="0.85" />
            <stop offset="62%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id={`blade-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0" />
            <stop offset="50%" stopColor="#14B8A6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`orb-${uid}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#99F6E4" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#14B8A6" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
          </radialGradient>
          <pattern id={`hex-${uid}`} width="28" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.55"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>

        <g
          className="text-[var(--border-color)]"
          opacity={soft ? 0.22 : 0.32}
          style={{
            maskImage: 'radial-gradient(ellipse at 78% 38%, black 10%, transparent 68%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 78% 38%, black 10%, transparent 68%)',
          }}
        >
          <rect x="720" y="0" width="720" height="900" fill={`url(#hex-${uid})`} />
        </g>

        <ellipse cx="1180" cy="290" rx="260" ry="200" fill={`url(#orb-${uid})`} />

        <g className="ursa-float-a" opacity={soft ? 0.45 : 0.7}>
          <ellipse cx="1160" cy="310" rx="210" ry="210" stroke={`url(#ring-${uid})`} strokeWidth="1.25" />
        </g>
        <g className="ursa-float-b" opacity={soft ? 0.32 : 0.5}>
          <ellipse cx="1160" cy="310" rx="148" ry="148" stroke={`url(#ring-${uid})`} strokeWidth="0.8" />
        </g>
        <g className="ursa-float-d" opacity={soft ? 0.22 : 0.36}>
          <ellipse cx="1160" cy="310" rx="86" ry="86" stroke="#14B8A6" strokeOpacity="0.35" strokeWidth="0.6" />
        </g>

        <g opacity={soft ? 0.25 : 0.4}>
          <path d="M820 160 L1380 520" stroke={`url(#blade-${uid})`} strokeWidth="1" />
          <path d="M860 120 L1420 560" stroke={`url(#blade-${uid})`} strokeWidth="0.6" opacity="0.6" />
        </g>

        <g opacity={soft ? 0.35 : 0.55} fill="#14B8A6">
          <circle cx="1012" cy="168" r="1.6" />
          <circle cx="1078" cy="148" r="1.2" />
          <circle cx="1144" cy="156" r="1.8" />
          <circle cx="1206" cy="132" r="1.1" />
          <circle cx="1262" cy="170" r="1.4" />
          <circle cx="1310" cy="154" r="1.2" />
          <circle cx="1368" cy="188" r="1.5" />
          <path
            d="M1012 168 L1078 148 L1144 156 L1206 132 L1262 170 L1310 154 L1368 188"
            stroke="#14B8A6"
            strokeOpacity="0.45"
            strokeWidth="0.7"
            fill="none"
          />
        </g>
      </svg>

      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: soft
            ? 'linear-gradient(90deg, color-mix(in srgb, var(--bg-primary) 86%, transparent) 0%, color-mix(in srgb, var(--bg-primary) 42%, transparent) 52%, transparent 100%)'
            : 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-primary) 22%, transparent) 100%)',
        }}
      />
    </div>
  );
}
