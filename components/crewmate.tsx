/**
 * The Crewmate — TripSync's mascot and the avatar for every member.
 * Ported from the design bundle's Crewmate.dc.html.
 */
export function Crewmate({
  body,
  shade,
  className,
  style,
}: {
  body: string;
  shade: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 200 232"
      width="100%"
      height="100%"
      className={className}
      style={{ display: "block", overflow: "visible", ...style }}
      aria-hidden
    >
      <rect
        x="10"
        y="100"
        width="46"
        height="82"
        rx="18"
        fill={body}
        stroke={shade}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <path
        d="M45,82 C45,34 72,14 100,14 C128,14 155,34 155,82 L155,214 Q155,222 147,222 L120,222 Q112,222 112,214 L112,208 Q112,201 105,201 L95,201 Q88,201 88,208 L88,214 Q88,222 80,222 L53,222 Q45,222 45,214 Z"
        fill={body}
        stroke={shade}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <ellipse cx="116" cy="70" rx="44" ry="28" fill="#BFE0F2" stroke={shade} strokeWidth="9" />
      <ellipse cx="132" cy="61" rx="12" ry="7" fill="#EAF6FD" />
    </svg>
  );
}
