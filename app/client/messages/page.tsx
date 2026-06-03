"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { DashboardRealDataProvider } from "@/components/dashboard2/context/dashboard-real-data-context";

/**
 * Inner component that uses useSearchParams — must be inside a Suspense boundary
 * so the build can produce a static shell without crashing during SSR.
 */
function ClientMessagesInner() {
  const searchParams = useSearchParams();
  const artisanId = searchParams.get("artisan");
  const artisanName = searchParams.get("name") ?? "artisan";
  const isNew = searchParams.get("new") === "1";
  const [creating, setCreating] = useState(isNew && !!artisanId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew || !artisanId) return;
    let cancelled = false;

    const createConversation = async () => {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artisanId,
            subject: `New job enquiry`,
            initialMessage: `Hi, I'm interested in your services.`,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          // 409 = conversation already exists — that's fine
          if (res.status !== 409) {
            throw new Error(data.error ?? "Failed to start conversation");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to start conversation");
        }
      } finally {
        if (!cancelled) setCreating(false);
      }
    };

    createConversation();
    return () => { cancelled = true; };
  }, [artisanId, isNew]);

  if (creating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-[15px] font-medium text-gray-600">
            Starting conversation with {artisanName}…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-sm rounded-[18px] border p-6 text-center">
          <p className="text-[15px] font-semibold text-red-700">Failed to start conversation</p>
          <p className="mt-2 text-[14px] text-gray-600">{error}</p>
          <a href="/client/messages" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-[14px] font-medium text-white">
            Open messages
          </a>
        </div>
      </div>
    );
  }

  return (
    <DashboardRealDataProvider role="client">
      <SourceAdminPreview initialRoute="/client/messages" />
    </DashboardRealDataProvider>
  );
}

/**
 * Client messages page — wraps the inner component in Suspense so Next.js
 * can produce a static shell at build time.
 */
export default function ClientMessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    }>
      <ClientMessagesInner />
    </Suspense>
  );
}
