"use client";

import { deleteCycle } from "@/lib/actions/admin";

export function ConfirmDeleteCycle({ cycleId, cycleName }: { cycleId: number; cycleName: string }) {
  return (
    <form
      action={deleteCycle}
      onSubmit={(e) => {
        if (!confirm(`Delete "${cycleName}" permanently? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={cycleId} />
      <button
        type="submit"
        className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400 hover:text-red-600 transition-colors"
      >
        Delete Cycle
      </button>
    </form>
  );
}
