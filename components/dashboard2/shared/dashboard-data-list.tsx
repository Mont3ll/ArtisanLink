"use client";

import { COLORS } from "@/lib/design-tokens";

export function DashboardDataList<Row>({ rows, emptyText = "No records found", renderRow }: { rows: Row[]; emptyText?: string; renderRow: (row: Row, index: number) => React.ReactNode }) {
  if (!rows.length) {
    return (
      <div className="rounded-[18px] border border-dashed p-8 text-center text-[14px]" style={{ borderColor: COLORS.hairline, color: COLORS.muted }}>
        {emptyText}
      </div>
    );
  }
  return <div className="grid gap-3">{rows.map((row, index) => <div key={index}>{renderRow(row, index)}</div>)}</div>;
}
