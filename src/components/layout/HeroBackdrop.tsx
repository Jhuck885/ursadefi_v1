'use client';

/**
 * Full-bleed graphic field for public pages.
 * Composition nod to a storefront-style crypto hero (floating tokens,
 * soft wash, sparkles) remapped to UrsaDeFi teal / black / amber.
 */
export default function HeroBackdrop({
  intensity = 'hero',
}: {
  intensity?: 'hero' | 'page';
}) {
  const soft = intensity === 'page';

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      <div
        className="absolute inset-0"
        style={{
          background: soft
            ? 'radial-gradient(1200px 700px at 88% -10%, rgba(20,184,166,0.22), transparent 58%), radial-gradient(900px 600px at -10% 110%, rgba(13,148,136,0.16), transparent 55%), var(--bg-primary)'
            : 'radial-gradient(1100px 720px at 85% 8%, rgba(20,184,166,0.38), transparent 55%), radial-gradient(800px 520px at 8% 92%, rgba(13,148,136,0.22), transparent 50%), radial-gradient(600px 400px at 50% 50%, rgba(245,158,11,0.06), transparent 60%), var(--bg-primary)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at 70% 30%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 70% 30%, black 20%, transparent 75%)',
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMid slice"
      >
        <g className="ursa-float-a" style={{ opacity: soft ? 0.45 : 0.85 }}>
          <Token cx={1120} cy={280} r={86} fill="#14B8A6" letter="X" />
        </g>
        <g className="ursa-float-b" style={{ opacity: soft ? 0.38 : 0.78 }}>
          <Token cx={1280} cy={430} r={54} fill="#0D9488" letter="R" />
        </g>
        <g className="ursa-float-c" style={{ opacity: soft ? 0.32 : 0.7 }}>
          <Token cx={1040} cy={470} r={40} fill="#F59E0B" letter="$" dark />
        </g>
        <g className="ursa-float-d" style={{ opacity: soft ? 0.28 : 0.55 }}>
          <Token cx={1210} cy={160} r={32} fill="#2DD4BF" letter="U" />
        </g>
        <g className="ursa-float-b" style={{ opacity: soft ? 0.22 : 0.4 }}>
          <Token cx={980} cy={220} r={26} fill="#0F766E" letter="P" />
        </g>

        <g opacity={soft ? 0.35 : 0.55}>
          <Sparkle x={980} y={140} />
          <Sparkle x={1320} y={240} />
          <Sparkle x={1088} y={560} />
          <Sparkle x={1260} y={340} />
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background: soft
            ? 'linear-gradient(90deg, color-mix(in srgb, var(--bg-primary) 82%, transparent) 0%, color-mix(in srgb, var(--bg-primary) 35%, transparent) 55%, transparent 100%)'
            : 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-primary) 18%, transparent) 100%)',
        }}
      />
    </div>
  );
}

function Token({
  cx,
  cy,
  r,
  fill,
  letter,
  dark,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  letter: string;
  dark?: boolean;
}) {
  return (
    <>
      <circle cx={cx} cy={cy + 10} r={r} fill="#000" opacity={0.28} />
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r * 0.92} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={3} />
      <text
        x={cx}
        y={cy + r * 0.18}
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fontSize={r * 0.72}
        fill={dark ? '#0f1419' : '#ffffff'}
      >
        {letter}
      </text>
    </>
  );
}

function Sparkle({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 8} L${x + 2} ${y - 2} L${x + 8} ${y} L${x + 2} ${y + 2} L${x} ${y + 8} L${x - 2} ${y + 2} L${x - 8} ${y} L${x - 2} ${y - 2} Z`}
      fill="#FBBF24"
      opacity={0.85}
    />
  );
}
