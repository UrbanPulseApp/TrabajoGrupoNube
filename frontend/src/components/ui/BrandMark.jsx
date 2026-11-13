// Cuatro celdas de ciudad: tres en reposo y una "con pulso".
export default function BrandMark({ size = 28 }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="2" width="13" height="13" rx="4" fill="var(--brand)" />
      <rect x="17" y="2" width="13" height="13" rx="4" fill="var(--brand)" opacity="0.55" />
      <rect x="2" y="17" width="13" height="13" rx="4" fill="var(--brand)" opacity="0.55" />
      <rect x="17" y="17" width="13" height="13" rx="4" fill="var(--accent)" />
    </svg>
  );
}
