/**
 * TesseractLogo - SVG Hypercube (Tesseract) icon for ChapaWorks
 * Classic Schlegel diagram: outer square + inner square + corner connectors
 */

interface TesseractLogoProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export default function TesseractLogo({
  className = "",
  size = 24,
  strokeWidth = 1.75,
}: TesseractLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="ChapaWorks logo"
    >
      {/* Outer square */}
      <rect x="1.5" y="1.5" width="21" height="21" rx="2" />
      {/* Inner square */}
      <rect x="6" y="6" width="12" height="12" rx="1" />
      {/* Corner connectors — outer to inner */}
      <line x1="1.5" y1="1.5" x2="6" y2="6" />
      <line x1="22.5" y1="1.5" x2="18" y2="6" />
      <line x1="22.5" y1="22.5" x2="18" y2="18" />
      <line x1="1.5" y1="22.5" x2="6" y2="18" />
    </svg>
  );
}
