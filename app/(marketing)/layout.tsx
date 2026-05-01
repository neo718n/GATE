import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { getCurrentSession } from "@/lib/authz";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav session={session} />
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
