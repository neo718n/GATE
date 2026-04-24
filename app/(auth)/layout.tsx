import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gate-white">
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col items-center justify-center p-16 border-r border-gate-fog bg-gate-fog/40">
        <div className="flex flex-col items-center gap-10 max-w-sm text-center">
          <Logo size="lg" variant="light" showTagline />
          <p className="text-sm font-light text-gate-800/65 leading-relaxed">
            An international academic assessment program uniting exceptional students
            worldwide, culminating at Xidian University, Hangzhou.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex flex-col items-center lg:hidden">
            <Link href="/">
              <Logo size="sm" variant="light" showTagline={false} />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
