import { QpSignInForm } from "./qp-sign-in-form";

export default function QpSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold mb-2">
            G.A.T.E. Assessment
          </p>
          <h1 className="font-serif text-3xl font-light text-foreground">Question Provider</h1>
          <p className="text-sm font-light text-muted-foreground mt-1">Sign in to your authoring account</p>
        </div>
        <QpSignInForm />
      </div>
    </div>
  );
}
