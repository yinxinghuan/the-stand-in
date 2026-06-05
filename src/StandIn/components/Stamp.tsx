interface Props {
  kind: 'approved' | 'disavowed';
  label: string;
}

// A tilted seal stamp with concentric rings + bisecting text band.
// Slightly imperfect path + opacity so it reads as hand-stamped.
export default function Stamp({ kind, label }: Props) {
  const color = kind === 'approved' ? '#F5B1C7' : '#E5675C';
  return (
    <svg
      className={`tsi-stamp tsi-stamp--${kind}`}
      viewBox="0 0 110 110"
      width="78"
      height="78"
      aria-hidden
    >
      <g
        stroke={color}
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.82"
      >
        {/* Outer slightly-broken ring */}
        <path d="M55 8 a47 47 0 0 1 46.6 39.2 M101.6 47.2 a47 47 0 0 1 -.4 16.2 M101.2 63.4 a47 47 0 0 1 -90.6 12.4 M10.6 75.8 a47 47 0 0 1 35 -75.6" />
        {/* Inner ring */}
        <circle cx="55" cy="55" r="36" strokeWidth="1.6" opacity="0.7" />
      </g>

      {/* Cross bar with the verdict text */}
      <rect
        x="6"
        y="44"
        width="98"
        height="22"
        fill={color}
        opacity="0.18"
      />
      <text
        x="55"
        y="60"
        textAnchor="middle"
        fontFamily="'Montserrat', system-ui, sans-serif"
        fontWeight="600"
        fontSize="13"
        letterSpacing="2.4"
        fill={color}
        opacity="0.95"
      >
        {label.toUpperCase()}
      </text>

      {/* A few scratched dots to break perfection */}
      <g fill={color} opacity="0.45">
        <circle cx="20" cy="30" r="0.9" />
        <circle cx="92" cy="74" r="0.9" />
        <circle cx="33" cy="88" r="0.7" />
      </g>
    </svg>
  );
}
