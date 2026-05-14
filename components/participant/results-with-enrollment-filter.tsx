"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Enrollment = {
  id: number;
  roundId: number | null;
  subjectId: number | null;
  round: {
    id: number;
    name: string;
  } | null;
  subject: {
    id: number;
    name: string;
  } | null;
};

type Result = {
  id: number;
  roundId: number | null;
  subjectId: number | null;
  score: string | null;
  maxScore: string | null;
  rank: number | null;
  award: string | null;
  publishedAt: Date | null;
  subject: {
    id: number;
    name: string;
  } | null;
  cycle: {
    id: number;
    name: string;
  } | null;
  round: {
    id: number;
    name: string;
  } | null;
};

interface ResultsWithEnrollmentFilterProps {
  enrollments: Enrollment[];
  results: Result[];
  hasPaidEnrollment: boolean;
}

export function ResultsWithEnrollmentFilter({
  enrollments,
  results,
  hasPaidEnrollment,
}: ResultsWithEnrollmentFilterProps) {
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(
    enrollments.length > 0 ? enrollments[0].id : null
  );

  // Find the selected enrollment
  const selectedEnrollment = enrollments.find(
    (e) => e.id === selectedEnrollmentId
  );

  // Filter results based on selected enrollment
  const filteredResults = selectedEnrollment
    ? results.filter(
        (result) =>
          result.roundId === selectedEnrollment.roundId &&
          result.subjectId === selectedEnrollment.subjectId &&
          result.publishedAt !== null
      )
    : [];

  // No paid enrollment state
  if (!hasPaidEnrollment) {
    return (
      <div className="border border-border bg-muted/30 p-8 flex flex-col gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Enrollment Required
        </p>
        <p className="text-sm font-light text-foreground/65 leading-[1.9]">
          Results will appear here once you are enrolled and the examination period has concluded.
        </p>
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/participant/enrollment">Go to Enrollment</Link>
        </Button>
      </div>
    );
  }

  // No enrollments state
  if (enrollments.length === 0) {
    return (
      <div className="border border-border bg-muted/30 p-8 flex flex-col gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          No Enrollments
        </p>
        <p className="text-sm font-light text-foreground/65 leading-[1.9]">
          You haven&apos;t enrolled in any programs yet. Enroll in a program to see your results here.
        </p>
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/participant/enrollment">Enroll in a Program</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Enrollment Selector */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="enrollment-select"
          className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60"
        >
          Select Enrollment
        </label>
        <Select
          id="enrollment-select"
          value={selectedEnrollmentId?.toString() ?? ""}
          onChange={(e) => setSelectedEnrollmentId(parseInt(e.target.value))}
        >
          {enrollments.map((enrollment) => (
            <option key={enrollment.id} value={enrollment.id}>
              {enrollment.round?.name ?? "Unknown Round"} -{" "}
              {enrollment.subject?.name ?? "No subject"}
            </option>
          ))}
        </Select>
      </div>

      {/* Results */}
      {filteredResults.length === 0 ? (
        <div className="border border-border bg-muted/30 p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60 mb-2">
            No Results Published
          </p>
          <p className="text-sm font-light text-foreground/65 leading-[1.9]">
            Results for this enrollment are published by the academic committee after examination
            scoring is complete. You will be notified when your results are available.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredResults.map((r) => (
            <div key={r.id} className="border border-border bg-card p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
                    {r.cycle?.name} &mdash; {r.round?.name ?? "Round"}
                  </p>
                  <p className="text-base font-light text-foreground">{r.subject?.name}</p>
                </div>
                {r.award && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] border border-gate-gold/40 text-gate-gold px-3 py-1.5">
                    {r.award.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-6">
                {r.score !== null && (
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
                      Score
                    </p>
                    <p className="text-xl font-serif font-light text-foreground">
                      {r.score}
                      {r.maxScore ? ` / ${r.maxScore}` : ""}
                    </p>
                  </div>
                )}
                {r.rank !== null && (
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
                      Rank
                    </p>
                    <p className="text-xl font-serif font-light text-foreground">#{r.rank}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
