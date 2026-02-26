export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-950/30 dark:via-background dark:to-emerald-950/20">
      {/* Subtle animated grid overlay */}
      <div className="absolute inset-0 bg-animated-grid opacity-40 dark:opacity-20" />

      {/* Decorative blurred orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl dark:bg-emerald-600/10" />

      {/* Page content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
