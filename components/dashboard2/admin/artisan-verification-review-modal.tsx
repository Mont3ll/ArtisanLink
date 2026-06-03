"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Images, X } from "lucide-react";

import { COLORS } from "@/lib/design-tokens";
import { SHIMMER_4_3, SHIMMER_16_9 } from "@/lib/image-utils";

type ReviewDecision = "approve" | "request" | "reject" | "escalate";

type Document = {
  id: string;
  name: string;
  type: string;
  preview: string;
  previewTitle: string;
  previewBody: string;
  uploaded: string;
  size: string;
  fields: [string, string][];
  /** Real Cloudinary URL for the document image */
  imageUrl?: string | null;
  /** Multiple portfolio images (portfolio-proof tab) */
  portfolioImages?: string[];
};

export interface ArtisanVerificationReviewModalProps {
  artisanId: string;
  artisanName: string;
  profession?: string;
  county?: string;
  /** Document labels submitted by artisan (e.g. ["National ID", "Certificate"]) */
  documents?: string[];
  /** Real Cloudinary URL of the uploaded national ID */
  idDocumentUrl?: string | null;
  /** Real Cloudinary URL of the uploaded certificate */
  certificateUrl?: string | null;
  /** Real portfolio images from Cloudinary */
  portfolioImageUrls?: string[];
  onClose: () => void;
}

export function ArtisanVerificationReviewModal({
  artisanId,
  artisanName,
  profession,
  county,
  documents: submittedDocLabels = [],
  idDocumentUrl,
  certificateUrl,
  portfolioImageUrls = [],
  onClose,
}: ArtisanVerificationReviewModalProps) {
  const [reviewDecision, setReviewDecision] = useState<ReviewDecision>("approve");
  const [decisionNote, setDecisionNote] = useState("");
  const [activeDocumentId, setActiveDocumentId] = useState("national-id");
  const [documentChecks, setDocumentChecks] = useState<Record<string, boolean>>({
    legible: false,
    nameMatch: false,
    dateValid: false,
    documentAuthentic: false,
    noTampering: false,
  });
  const [reviewHistory, setReviewHistory] = useState<Array<{ action: string; note: string; time: string }>>([]);
  const [decisionSubmitted, setDecisionSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reviewDocuments: Document[] = [
    {
      id: "national-id",
      name: "National ID",
      type: "Identity document",
      preview: "ID",
      previewTitle: "Republic of Kenya · National ID",
      previewBody:
        "Identity number, portrait zone, name, expiry date, and document serial are visible for admin comparison.",
      uploaded: "On file",
      size: "—",
      fields: [
        ["Name", artisanName],
        ["ID number", "•••• ••••"],
        ["Status", submittedDocLabels.includes("National ID") ? "Submitted" : "Pending"],
      ],
      imageUrl: idDocumentUrl ?? null,
    },
    {
      id: "certificate",
      name: "Trade certificate",
      type: "Professional verification",
      preview: "CERT",
      previewTitle: "Trade / Professional Certificate",
      previewBody:
        "Certificate type, issuing body, name of holder, and expiry date are visible for professional verification.",
      uploaded: "On file",
      size: "—",
      fields: [
        ["Holder", artisanName],
        ["Profession", profession ?? "—"],
        ["Status", submittedDocLabels.includes("Certificate") ? "Submitted" : "Pending"],
      ],
      imageUrl: certificateUrl ?? null,
    },
    {
      id: "portfolio-proof",
      name: "Portfolio evidence",
      type: "Craft evidence",
      preview: "IMG",
      previewTitle: "Portfolio Evidence",
      previewBody:
        "Uploaded work images with titles and categories are available for quality review.",
      uploaded: "On file",
      size: "—",
      fields: [
        ["County", county ?? "—"],
        ["Profession", profession ?? "—"],
        ["Images", portfolioImageUrls.length > 0 ? `${portfolioImageUrls.length} uploaded` : "None uploaded"],
      ],
      imageUrl: portfolioImageUrls[0] ?? null,
      portfolioImages: portfolioImageUrls,
    },
  ];

  const activeDocument = reviewDocuments.find((d) => d.id === activeDocumentId) ?? reviewDocuments[0];
  const requiredChecksComplete = Object.values(documentChecks).every(Boolean);

  const openActiveDocument = () => {
    // Navigate directly to the real uploaded document URL
    if (activeDocument.imageUrl) {
      window.open(activeDocument.imageUrl, "_blank", "noopener,noreferrer");
      return;
    }
    // Fallback: generate a minimal HTML preview when no URL is on file
    const html = `<!doctype html><html><head><title>${activeDocument.name}</title><style>body{font-family:Inter,Arial,sans-serif;margin:0;background:#f7f7f7;color:#222}.page{max-width:760px;margin:32px auto;background:white;border:1px solid #ddd;border-radius:24px;padding:32px}.badge{display:inline-flex;border-radius:999px;background:#ecfdf5;color:#047857;padding:6px 12px;font-size:12px;font-weight:700}.muted{color:#6a6a6a}.rows{display:grid;gap:10px;margin-top:18px}.row{display:flex;justify-content:space-between;gap:16px;background:#f8fafc;border-radius:12px;padding:10px 12px}</style></head><body><main class="page"><span class="badge">${activeDocument.type}</span><h1>${activeDocument.previewTitle}</h1><p class="muted">${activeDocument.previewBody}</p><div class="rows">${activeDocument.fields.map(([l, v]) => `<div class="row"><span class="muted">${l}</span><strong>${v}</strong></div>`).join("")}</div></main></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const decisionConfig = {
    approve: {
      title: "Approve verification",
      body: "Approves this artisan, grants verified badge, and makes them eligible for public search.",
      cta: "Approve and verify",
      requiresCompleteChecks: true,
    },
    request: {
      title: "Request more information",
      body: "Keeps the record pending and prompts the artisan for clearer evidence or missing documents.",
      cta: "Send request",
      requiresCompleteChecks: false,
    },
    reject: {
      title: "Reject verification",
      body: "Rejects the submitted evidence. Requires an internal reason and user-facing guidance.",
      cta: "Reject submission",
      requiresCompleteChecks: false,
    },
    escalate: {
      title: "Escalate review",
      body: "Moves to a senior reviewer or trust-and-safety queue for secondary review.",
      cta: "Escalate record",
      requiresCompleteChecks: false,
    },
  }[reviewDecision];

  const submitDecision = async () => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setReviewHistory((prev) => [{ action: decisionConfig.title, note: decisionNote, time }, ...prev]);
    setDecisionSubmitted(true);
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/admin/verification/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanId,
          action: reviewDecision === "approve" ? "APPROVE" : "REJECT",
          reason: decisionNote,
          adminNotes: decisionNote,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setSubmitError((err as { error?: string }).error ?? "Verification action failed");
      }
    } catch {
      setSubmitError("Network error — decision was staged locally");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-black/40 p-2 backdrop-blur-sm md:p-4"
      role="dialog"
      aria-label={`Verification review for ${artisanName}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex max-h-[94vh] w-full max-w-[1120px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <header className="shrink-0 border-b px-4 py-3 md:px-5" style={{ borderColor: COLORS.hairline }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: COLORS.primaryTint, color: COLORS.primaryActive }}>
                  Verification review
                </span>
              </div>
              <h2 className="mt-2 truncate text-xl font-semibold tracking-[-0.03em] md:text-2xl" style={{ color: COLORS.ink }}>
                {artisanName}
              </h2>
              <p className="mt-1 line-clamp-1 text-[13px]" style={{ color: COLORS.muted }}>
                {profession ?? "Artisan"} · {county ?? "Kenya"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
              aria-label="Close review"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0 space-y-4">
              <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
                {/* Document list */}
                <div className="rounded-[18px] border bg-white p-3" style={{ borderColor: COLORS.hairline }}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>Submitted documents</p>
                      <p className="text-[12px]" style={{ color: COLORS.muted }}>Open each document and complete the verification checklist.</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-[11px] font-medium" style={{ background: COLORS.primaryTint, color: COLORS.primaryActive }}>
                      {reviewDocuments.length} files
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {reviewDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setActiveDocumentId(doc.id)}
                        className="flex cursor-pointer items-center gap-3 rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                        style={{
                          borderColor: activeDocumentId === doc.id ? COLORS.primary : COLORS.hairline,
                          background: activeDocumentId === doc.id ? COLORS.primaryTint : "#fff",
                        }}
                      >
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[12px] font-bold" style={{ background: COLORS.primarySoft, color: COLORS.primaryActive }}>
                          {doc.preview}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold" style={{ color: COLORS.ink }}>{doc.name}</p>
                          <p className="truncate text-[12px]" style={{ color: COLORS.muted }}>{doc.type}</p>
                        </div>
                        <span className="text-[18px]" style={{ color: COLORS.muted }}>›</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Document preview */}
                <div className="rounded-[18px] border bg-white p-3" style={{ borderColor: COLORS.hairline }}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{activeDocument.name}</p>
                      <p className="text-[12px]" style={{ color: COLORS.muted }}>{activeDocument.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={openActiveDocument}
                      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition-colors hover:bg-[#f7f7f7]"
                      style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                    >
                      <ExternalLink size={12} />
                      {activeDocument.imageUrl ? "Open original" : "Open file"}
                    </button>
                  </div>

                  {/* Real image preview */}
                  {activeDocument.id === "portfolio-proof" && (activeDocument.portfolioImages?.length ?? 0) > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {activeDocument.portfolioImages!.map((src, i) => (
                        <a key={src} href={src} target="_blank" rel="noreferrer"
                           className="group relative aspect-[4/3] overflow-hidden rounded-[12px] border" style={{ borderColor: COLORS.hairlineSoft }}>
                          <Image
                            src={src}
                            alt={`Portfolio image ${i + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="200px"
                            placeholder="blur"
                            blurDataURL={SHIMMER_4_3}
                          />
                        </a>
                      ))}
                    </div>
                  ) : activeDocument.imageUrl ? (
                    <div className="relative aspect-video overflow-hidden rounded-[14px] border" style={{ borderColor: COLORS.hairline }}>
                      <Image
                        src={activeDocument.imageUrl}
                        alt={`${activeDocument.name} document preview`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 480px"
                        priority
                        placeholder="blur"
                        blurDataURL={SHIMMER_16_9}
                      />
                    </div>
                  ) : (
                    /* Placeholder when no image on file */
                    <div className="grid min-h-[180px] place-items-center overflow-hidden rounded-[14px] border" style={{ borderColor: COLORS.hairline, background: "linear-gradient(135deg,#f8fafc,#ecfdf5)" }}>
                      <div className="w-[84%] rounded-[16px] border bg-white p-4 shadow-sm" style={{ borderColor: COLORS.hairline }}>
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: COLORS.primaryActive }}>{activeDocument.previewTitle}</p>
                            <p className="mt-2 text-[12px] leading-[1.35]" style={{ color: COLORS.body }}>{activeDocument.previewBody}</p>
                          </div>
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[12px] font-bold" style={{ background: COLORS.primarySoft, color: COLORS.primaryActive }}>
                            {activeDocument.preview}
                          </span>
                        </div>
                        <div className="grid gap-2">
                          {activeDocument.fields.map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-3 rounded-lg bg-[#f8fafc] px-3 py-2 text-[12px]">
                              <span style={{ color: COLORS.muted }}>{label}</span>
                              <span className="font-medium" style={{ color: COLORS.ink }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 text-[12px]" style={{ color: COLORS.muted }}>
                        <Images size={14} />
                        No document uploaded yet
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification checklist */}
              <div className="rounded-[18px] border bg-white p-3" style={{ borderColor: COLORS.hairline }}>
                <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>Verification checklist</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    ["legible", "Document is legible"],
                    ["nameMatch", "Name matches profile"],
                    ["dateValid", "Document is not expired"],
                    ["documentAuthentic", "Document appears authentic"],
                    ["noTampering", "No visible tampering"],
                  ].map(([id, label]) => (
                    <label key={id} className="flex cursor-pointer items-center gap-2 rounded-[12px] border px-3 py-2 text-[12px]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
                      <input
                        type="checkbox"
                        checked={Boolean(documentChecks[id])}
                        onChange={(e) => setDocumentChecks((prev) => ({ ...prev, [id]: e.target.checked }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Review decision sidebar */}
            <aside className="min-w-0 space-y-4 lg:sticky lg:top-0 lg:self-start">
              <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairline }}>
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Review action</p>
                <div className="mt-4 grid gap-2">
                  {(["approve", "request", "reject", "escalate"] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setReviewDecision(val); setDecisionSubmitted(false); }}
                      className="cursor-pointer rounded-[12px] border px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                      style={{
                        borderColor: reviewDecision === val ? COLORS.primary : COLORS.hairline,
                        background: reviewDecision === val ? COLORS.primaryTint : "#fff",
                        color: COLORS.ink,
                      }}
                    >
                      {val === "approve" ? "Approve" : val === "request" ? "Request info" : val === "reject" ? "Reject" : "Escalate"}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-[14px] border p-3" style={{ borderColor: COLORS.hairline, background: COLORS.canvas }}>
                  <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{decisionConfig.title}</p>
                  <p className="mt-1 text-[12px] leading-[1.4]" style={{ color: COLORS.body }}>{decisionConfig.body}</p>
                </div>

                <textarea
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder="Add audit note before submitting…"
                  className="mt-3 min-h-24 w-full rounded-lg border px-3 py-2 text-[13px] outline-none"
                  style={{ borderColor: COLORS.hairline }}
                />

                <button
                  type="button"
                  onClick={submitDecision}
                  disabled={submitting || !decisionNote.trim() || (decisionConfig.requiresCompleteChecks && !requiredChecksComplete)}
                  className="mt-3 w-full cursor-pointer rounded-xl px-4 py-3 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: COLORS.primary }}
                >
                  {submitting ? "Processing…" : decisionConfig.cta}
                </button>

                {reviewDecision === "approve" && !requiredChecksComplete && (
                  <p className="mt-3 rounded-[12px] border px-3 py-2 text-[12px]" style={{ borderColor: "#fed7aa", background: "#fff7ed", color: "#c2410c" }}>
                    Complete every document check before approving.
                  </p>
                )}

                <AnimatePresence>
                  {decisionSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 rounded-[14px] border bg-white p-3"
                      style={{ borderColor: submitError ? "#fecaca" : COLORS.primarySoft }}
                    >
                      <p className="text-[13px] font-semibold" style={{ color: submitError ? "#b91c1c" : COLORS.primaryActive }}>
                        {submitError ? "Error" : "Decision submitted"}
                      </p>
                      <p className="mt-1 text-[12px] leading-[1.33]" style={{ color: COLORS.body }}>
                        {submitError ?? "The verification decision has been applied and recorded."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Audit timeline */}
              <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairline }}>
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Audit timeline</p>
                <div className="mt-4 grid gap-3">
                  {reviewHistory.length === 0 ? (
                    <p className="rounded-[14px] border p-3 text-[12px]" style={{ borderColor: COLORS.hairline, color: COLORS.muted }}>
                      No review action staged yet.
                    </p>
                  ) : (
                    reviewHistory.map((event, index) => (
                      <div key={`${event.time}-${index}`} className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairline }}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[13px] font-semibold" style={{ color: COLORS.ink }}>{event.action}</p>
                          <span className="text-[11px]" style={{ color: COLORS.muted }}>{event.time}</span>
                        </div>
                        <p className="mt-1 text-[12px] leading-[1.35]" style={{ color: COLORS.body }}>{event.note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </motion.div>
    </div>
  );
}
