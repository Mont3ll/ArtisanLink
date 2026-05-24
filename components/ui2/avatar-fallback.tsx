"use client";

const AVATAR_PALETTE = [
  ["#ecfdf5", "#059669"],
  ["#eff6ff", "#1d4ed8"],
  ["#faf5ff", "#7e22ce"],
  ["#fff7ed", "#c2410c"],
  ["#fdf2f8", "#9d174d"],
  ["#f0fdf4", "#15803d"],
] as const;

function getColorPair(name: string) {
  let hash = 0;

  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "CW";
}

export function AvatarFallback({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const [bg, fg] = getColorPair(name || "ChapaWorks");

  return (
    <span
      className={`inline-grid place-items-center rounded-full font-semibold ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.36,
        flexShrink: 0,
      }}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
