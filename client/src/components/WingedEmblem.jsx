// Place at: client/src/components/WingedEmblem.jsx
// Inline version of assets/emblem.svg so CSS can animate each wing.
// Styles live in client/src/sacred-fx.css
import React, { useId } from 'react';

const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';

export function HeroLetters({ count = 14 }) {
  return (
    <div className="hero-letters" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 71) % 100}%`,
            fontSize: `${18 + ((i * 13) % 30)}px`,
            '--t': `${14 + ((i * 5) % 12)}s`,
            '--d': `${-(i * 1.9)}s`,
            '--o': (0.12 + ((i * 3) % 5) / 30).toFixed(2),
            '--r': `${(i % 2 ? 1 : -1) * (6 + (i % 10))}deg`,
          }}
        >
          {LETTERS[(i * 7) % LETTERS.length]}
        </span>
      ))}
    </div>
  );
}

const PRIMARIES = [
  [262, 138, -74, 1.18], [264, 142, -62, 1.2], [266, 147, -50, 1.16], [267, 152, -38, 1.08],
  [267, 158, -26, 0.96], [266, 164, -14, 0.82], [264, 170, -2, 0.66],
];
const COVERTS = [
  [260, 140, -66, 0.72], [262, 146, -52, 0.7], [263, 152, -38, 0.64], [263, 159, -24, 0.56], [262, 165, -10, 0.46],
];

export default function WingedEmblem({ label, withHalo = true, className = '' }) {
  const id = useId().replace(/:/g, '');
  const g = (n) => `${n}-${id}`; // unique gradient ids, safe when rendered more than once

  const Wing = () => (
    <g className="wing">
      <g fill={`url(#${g('wingDeep')})`} className="feather-edge">
        {PRIMARIES.map(([x, y, r, s], i) => (
          <use key={i} href={`#${g('feather')}`} transform={`translate(${x},${y}) rotate(${r}) scale(${s},1)`} />
        ))}
      </g>
      <g className="cov feather-edge" fill={`url(#${g('wingLight')})`}>
        {COVERTS.map(([x, y, r, s], i) => (
          <use key={i} href={`#${g('feather')}`} transform={`translate(${x},${y}) rotate(${r}) scale(${s},0.9)`} />
        ))}
      </g>
    </g>
  );

  const svg = (
    <svg className={`winged-emblem ${className}`} viewBox="0 0 400 240" role="img" aria-label={label}>
      <defs>
        <linearGradient id={g('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6DC8C" /><stop offset="0.5" stopColor="#D4A246" /><stop offset="1" stopColor="#F0CD70" />
        </linearGradient>
        <linearGradient id={g('wingDeep')} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#7A5A22" /><stop offset="1" stopColor="#E3C47A" />
        </linearGradient>
        <linearGradient id={g('wingLight')} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#A9843F" /><stop offset="1" stopColor="#F4E2A8" />
        </linearGradient>
        <path id={g('feather')} d="M0,0 C30,-12 70,-4 100,14 C70,6 30,10 0,0 Z" />
      </defs>

      <Wing />
      <g transform="translate(400,0) scale(-1,1)"><Wing /></g>

      <circle cx="200" cy="140" r="66" fill="#0B1626" />
      <circle cx="200" cy="140" r="64" fill="none" stroke={`url(#${g('gold')})`} strokeWidth="5" />
      <circle cx="200" cy="140" r="54" fill="none" stroke={`url(#${g('gold')})`} strokeWidth="1.2" />
      <g className="star" fill="none" stroke={`url(#${g('gold')})`} strokeWidth="4.5" strokeLinejoin="miter">
        <polygon points="200,92 241.6,164 158.4,164" />
        <polygon points="200,188 241.6,116 158.4,116" />
      </g>
    </svg>
  );

  if (!withHalo) return svg;

  return (
    <div className="emblem-stage">
      <div className="halo" aria-hidden="true" />
      {svg}
    </div>
  );
}
