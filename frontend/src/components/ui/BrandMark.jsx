// Isotipo: placa de tinta con una línea de pulso (la ciudad "late" con cada aviso).
export default function BrandMark({ size = 28 }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="var(--ink)" />
      <polyline
        points="5,17.5 11,17.5 14,9.5 18.5,23.5 21.5,14.5 27,14.5"
        fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
