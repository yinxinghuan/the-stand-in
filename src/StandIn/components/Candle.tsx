interface Props {
  phase: 'lit' | 'puffing' | 'out';
}

// A small candle + flame, ~40px tall. CSS handles the flicker animation;
// the SVG is just the shape. When puffing, the flame scales down + drifts
// up while a thin smoke wisp rises.
export default function Candle({ phase }: Props) {
  return (
    <svg
      className={`tsi-candle tsi-candle--${phase}`}
      viewBox="0 0 40 80"
      width="40"
      height="80"
      aria-hidden
    >
      <defs>
        <radialGradient id="tsi-flame-grad" cx="50%" cy="65%" r="55%">
          <stop offset="0%"   stopColor="#fff4cc" />
          <stop offset="55%"  stopColor="#f3b56b" />
          <stop offset="100%" stopColor="#8b3a1f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tsi-halo-grad" cx="50%" cy="60%" r="55%">
          <stop offset="0%"   stopColor="#c79567" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#c79567" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tsi-wax-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e6d6b8" />
          <stop offset="100%" stopColor="#7a684c" />
        </linearGradient>
      </defs>

      {/* Halo behind the flame */}
      <circle className="tsi-candle__halo" cx="20" cy="30" r="22" fill="url(#tsi-halo-grad)" />

      {/* Smoke wisp — only when puffing */}
      <path
        className="tsi-candle__smoke"
        d="M20 26 q-3 -6 1 -12 q4 -6 -1 -14"
        stroke="#9a8c78"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0"
      />

      {/* Flame */}
      <g className="tsi-candle__flame">
        <path
          d="M20 12 q-6 8 -5 16 q1 7 5 10 q4 -3 5 -10 q1 -8 -5 -16 z"
          fill="url(#tsi-flame-grad)"
        />
        <path
          d="M20 18 q-2.5 4 -2 8.5 q.5 3 2 4.5 q1.5 -1.5 2 -4.5 q.5 -4.5 -2 -8.5 z"
          fill="#fff4cc"
          opacity="0.85"
        />
      </g>

      {/* Wick */}
      <rect x="19.4" y="38" width="1.2" height="6" fill="#1a1410" />

      {/* Candle body */}
      <rect x="14" y="44" width="12" height="30" rx="2" fill="url(#tsi-wax-grad)" />
      {/* Wax drip */}
      <path d="M14 50 q-1 6 0 12 l1 -1 q-.5 -5 0 -10 z" fill="#d6c19a" opacity="0.7" />
    </svg>
  );
}
