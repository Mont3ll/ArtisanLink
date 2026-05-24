"use client";

import { X } from "lucide-react";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

export function QuickDetailSlideover({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-black/30" role="dialog" aria-modal="true" aria-label={title}>
      <aside className="ml-auto h-full w-full max-w-[460px] overflow-y-auto bg-white p-5" style={{ boxShadow: SHADOWS.card }}>
        <div className="mb-4 flex items-center justify-between gap-3 border-b pb-4" style={{ borderColor: COLORS.hairlineSoft }}>
          <h2 className="text-[18px] font-semibold" style={{ color: COLORS.ink }}>{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border" style={{ borderColor: COLORS.hairline }} aria-label="Close details"><X size={16} /></button>
        </div>
        {children}
      </aside>
    </div>
  );
}
