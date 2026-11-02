import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { repInviteLinks } from "@/lib/db/schema";
import { requireRep } from "@/lib/reps/auth";
import { inviteUrl } from "@/lib/portal-urls";
import { PageTitle } from "@/components/rep/rep-shell";
import { LinksManager } from "@/components/rep/links-manager";
import { getLocale } from "@/lib/i18n/server";

export default async function RepLinksPage() {
  const rep = await requireRep();
  const ru = (await getLocale()) === "ru";
  const links = await db.query.repInviteLinks.findMany({
    where: eq(repInviteLinks.representativeId, rep.id),
    orderBy: desc(repInviteLinks.createdAt),
    with: { applications: { columns: { id: true, status: true } } },
  });

  return (
    <>
      <PageTitle eyebrow={ru ? "Для учеников" : "Share with students"} title={ru ? "Ссылки для регистрации" : "Registration links"} />
      <LinksManager
        links={links.map((l) => ({
          id: l.id,
          label: l.label,
          url: inviteUrl(l.token),
          active: l.active,
          count: l.applications.filter((a) => a.status !== "cancelled").length,
          createdAt: l.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
