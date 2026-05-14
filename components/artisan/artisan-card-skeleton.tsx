/**
 * ArtisanCardSkeleton — matches ArtisanCard structure exactly (4:3 hero + metadata row + pills + buttons)
 * animate-pulse for loading state
 */
export default function ArtisanCardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero photo area — 4:3 */}
      <div className="rounded-xl bg-[#f2f2f2] mb-3" style={{ aspectRatio: "4/3" }} />

      {/* Metadata row */}
      <div className="flex items-start gap-2.5 mb-1.5">
        {/* Avatar circle */}
        <div className="w-9 h-9 rounded-full bg-[#f2f2f2] flex-shrink-0" />
        {/* Text lines */}
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between gap-2">
            <div className="h-3.5 bg-[#f2f2f2] rounded w-3/5" />
            <div className="h-3 bg-[#f2f2f2] rounded w-10 flex-shrink-0" />
          </div>
          <div className="h-3 bg-[#f2f2f2] rounded w-4/5" />
          <div className="h-3 bg-[#f2f2f2] rounded w-2/5" />
        </div>
      </div>

      {/* Specialization pills */}
      <div className="flex gap-1 mb-2.5">
        <div className="h-5 w-16 bg-[#f2f2f2] rounded-full" />
        <div className="h-5 w-20 bg-[#f2f2f2] rounded-full" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-[#f2f2f2] rounded-lg" />
        <div className="flex-1 h-8 bg-[#f2f2f2] rounded-lg" />
      </div>
    </div>
  );
}
