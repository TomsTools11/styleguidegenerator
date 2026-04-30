// StyleSnap — feature icons. Hand-drawn 1.6 stroke, round caps.
// Icon stroke uses the brand-accent blue from the logo (rgb(65,173,250)).

const ACCENT = 'rgb(65, 173, 250)';

export const IcCheck = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 6.5 L5 9 L9.5 3.5" />
  </svg>
);

export const IcArrow = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ stroke: 'currentColor' }}
  >
    <path d="M3 8 H13" />
    <path d="M9 4 L13 8 L9 12" />
  </svg>
);

export const IcSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="spin">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth={3} />
    <path d="M21 12 A9 9 0 0 0 12 3" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const featureIconBase = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  style: { stroke: ACCENT },
};

export const IcPalette = () => (
  <svg {...featureIconBase}>
    <rect x="2" y="3" width="3" height="3" rx="0.5" />
    <rect x="6.5" y="3" width="3" height="3" rx="0.5" />
    <rect x="11" y="3" width="3" height="3" rx="0.5" />
    <rect x="2" y="7.5" width="3" height="3" rx="0.5" />
    <rect x="6.5" y="7.5" width="3" height="3" rx="0.5" />
    <rect x="11" y="7.5" width="3" height="3" rx="0.5" />
  </svg>
);

export const IcType = () => (
  <svg {...featureIconBase}>
    <path d="M3 4 H13" />
    <path d="M8 4 V13" />
    <path d="M6 13 H10" />
  </svg>
);

export const IcComponents = () => (
  <svg {...featureIconBase}>
    <rect x="2" y="2.5" width="5.5" height="5.5" rx="1" />
    <rect x="8.5" y="2.5" width="5.5" height="5.5" rx="1" />
    <rect x="2" y="9" width="5.5" height="5.5" rx="1" />
    <rect x="8.5" y="9" width="5.5" height="5.5" rx="1" />
  </svg>
);

export const IcAccess = () => (
  <svg {...featureIconBase}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 2 V14" />
    <path d="M2.5 6 H13.5" />
  </svg>
);

export const IcPdf = () => (
  <svg {...featureIconBase}>
    <path d="M4 1.5 H10 L13 4.5 V14 A0.5 0.5 0 0 1 12.5 14.5 H4 A0.5 0.5 0 0 1 3.5 14 V2 A0.5 0.5 0 0 1 4 1.5 Z" />
    <path d="M10 1.5 V4.5 H13" />
    <path d="M5.5 8.5 H10.5" />
    <path d="M5.5 11 H9" />
  </svg>
);

export const IcBolt = () => (
  <svg {...featureIconBase}>
    <path d="M9 1.5 L3 9 H8 L7 14.5 L13 7 H8 L9 1.5 Z" />
  </svg>
);

// Brand mark — same teardrop silhouette as DropDoc, with a color-swatch row +
// "Aa" sample inside to communicate "style guide". Used in the footer.
export function BrandMark({ size = 24 }: { size?: number }) {
  const id = `ss-${size}-mark`;
  return (
    <svg
      width={size}
      height={(size * 120) / 100}
      viewBox="0 0 100 120"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <path d="M 50 6 C 72 34 88 60 88 78 A 38 38 0 1 1 12 78 C 12 60 28 34 50 6 Z" />
        </clipPath>
      </defs>
      <path
        d="M 50 6 C 72 34 88 60 88 78 A 38 38 0 1 1 12 78 C 12 60 28 34 50 6 Z"
        fill="var(--brand)"
      />
      <g clipPath={`url(#${id})`}>
        <g stroke="#fff" strokeWidth="0.6" strokeOpacity="0.35">
          {[44, 56, 68, 80, 92, 104].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} />
          ))}
        </g>
        <g>
          <rect x="22" y="60" width="11" height="11" rx="1.5" fill="#F2EADA" />
          <rect x="35" y="60" width="11" height="11" rx="1.5" fill="#D85858" />
          <rect x="48" y="60" width="11" height="11" rx="1.5" fill="#B9A986" />
          <rect x="61" y="60" width="11" height="11" rx="1.5" fill="#fff" fillOpacity="0.85" />
        </g>
        <text
          x="22"
          y="84"
          fill="#fff"
          fillOpacity="0.95"
          fontSize="11"
          fontWeight="900"
          fontFamily="Lato, sans-serif"
          letterSpacing="-0.04em"
        >
          Aa
        </text>
        <line x1="40" y1="82" x2="76" y2="82" stroke="#fff" strokeWidth="1.4" strokeOpacity="0.75" strokeLinecap="round" />
        <line x1="40" y1="86" x2="68" y2="86" stroke="#fff" strokeWidth="1.4" strokeOpacity="0.45" strokeLinecap="round" />
        <path d="M 58 14 C 56 26 62 36 72 44 C 78 48 84 50 88 50 L 88 30 C 80 24 68 18 58 14 Z" fill="#F2EADA" />
        <path
          d="M 58 14 C 56 26 62 36 72 44"
          stroke="#B9A986"
          strokeWidth="0.7"
          strokeOpacity="0.5"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function BrandLockup({ height = 24 }: { height?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <BrandMark size={height} />
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          fontSize: height * 0.95,
          lineHeight: 1,
          color: 'var(--text-primary)',
        }}
      >
        StyleSnap
      </span>
    </div>
  );
}
