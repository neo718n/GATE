import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gate-900">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col items-center justify-center p-16 border-r border-border/30 bg-gate-800/20">
        <div className="flex flex-col items-center gap-10 max-w-sm text-center">
          <Logo size="lg" variant="dark" showTagline />
          <p className="text-sm font-light text-gate-white/70 leading-relaxed">
            An international academic competition uniting exceptional students
            worldwide, culminating at Xidian University, Hangzhou.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex flex-col items-center lg:hidden">
            <Link href="/">
              <Logo size="sm" variant="dark" showTagline={false} />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
