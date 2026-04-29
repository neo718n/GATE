import { requireRole } from "@/lib/authz";

export default async function ContentPage() {
  await requireRole(["super_admin", "admin"]);

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Content</h1>
        <p className="text-sm font-light text-gate-800/60">
          Manage public-facing content and uploaded files.
        </p>
      </div>

      <div className="border border-gate-fog bg-gate-fog/30 p-10 flex flex-col items-center gap-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/40">
          Coming Soon
        </p>
        <p className="text-sm font-light text-gate-800/55 leading-[1.9] max-w-md">
          Content management tools — including page copy, uploaded documents, and media — will be available here in a future update.
        </p>
      </div>
    </div>
  );
}
