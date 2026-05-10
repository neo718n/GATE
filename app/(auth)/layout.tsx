import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col items-center justify-center p-16 border-r border-border bg-muted/40">
        <div className="flex flex-col items-center gap-10 max-w-sm text-center">
          <Logo size="lg" variant="light" showTagline className="dark:hidden" />
          <Logo size="lg" variant="dark" showTagline className="hidden dark:block" />
          <p className="text-sm font-light text-foreground/65 leading-relaxed">
            An international academic assessment program uniting exceptional students
            worldwide, culminating in the invitation-only Global Onsite Final.
          </p>
        </div>
      </div>

      <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex flex-col items-center lg:hidden">
            <Link href="/">
              <Logo size="sm" variant="light" showTagline={false} className="dark:hidden" />
              <Logo size="sm" variant="dark" showTagline={false} className="hidden dark:block" />
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}