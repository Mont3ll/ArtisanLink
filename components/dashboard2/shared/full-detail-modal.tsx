"use client";

import { X } from "lucide-react";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

export function FullDetailModal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[95] bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="full-detail-title">
      <div className="mx-auto max-h-[calc(100vh-2rem)] max-w-[960px] overflow-y-auto rounded-[28px] border bg-white" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}>
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
          <h2 id="full-detail-title" className="text-[20px] font-semibold" style={{ color: COLORS.ink }}>{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border" style={{ borderColor: COLORS.hairline }} aria-label="Close modal"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
