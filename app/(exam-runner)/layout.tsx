export const metadata = { title: "Exam" };

export default function ExamRunnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
