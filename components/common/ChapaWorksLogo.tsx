/**
 * ChapaWorksLogo — renders the official logo.svg
 *
 * The logo is black by default (fill="#000000").
 * Use `className="invert"` for white version on dark backgrounds.
 * Use `className="dark:invert"` for automatic dark-mode inversion.
 */
interface ChapaWorksLogoProps {
  /** Width in pixels */
  size?: number;
  /** Additional Tailwind classes e.g. "invert" for white on dark bg */
  className?: string;
}

export default function ChapaWorksLogo({
  size = 28,
  className = "",
}: ChapaWorksLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="ChapaWorks logo"
      width={size}
      height={size}
      style={{ width: size, height: size, display: "inline-block", flexShrink: 0 }}
      className={className}
      draggable={false}
    />
  );
}
