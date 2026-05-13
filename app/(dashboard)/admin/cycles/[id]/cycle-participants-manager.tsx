"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertResult, deleteResult } from "@/lib/actions/admin";

const AWARD_LABELS: Record<string, string> = {
  gold: "Certificate of Distinction",
  silver: "Certificate of High Achievement",
  bronze: "Certificate of Merit",
  honorable_mention: "Honorable Mention",
  participation: "Certificate of Participation",
};

const AWARD_COLOR: Record<string, string> = {
  gold: "text-yellow-700 bg-yellow-50",
  silver: "text-slate-600 bg-slate-50",
  bronze: "text-orange-700 bg-orange-50",
  honorable_mention: "text-blue-700 bg-blue-50",
  participation: "text-foreground/50 bg-muted/40",
};

const REG_COLOR: Record<string, string> = {
  draft: "text-foreground/40",
  submitted: "text-yellow-700",
  verified: "text-green-700",
  rejected: "text-red-600",
};

const PAY_COLOR: Record<string, string> = {
  unpaid: "text-yellow-700",
  paid: "text-green-700",
  waived: "text-foreground/40",
};

type RoundRow = {
  id: number;
  name: string;
  order: number;
  format: string;
};

type SubjectRow = {
  id: number;
  name: string;
};

type ResultRow = {
  id: number;
  roundId: number | null;
  subjectId: number;
  score: string | null;
  maxScore: string | null;
  rank: number | null;
  award: string | null;
  publishedAt: Date | null;
  subject: { id: number; name: string } | null;
  round: { id: number; name: string } | null;
};

type ParticipantRow = {
  id: number;
  fullName: string;
  country: string;
  registrationStatus: string;
  paymentStatus: string;
  user: { email: string; name: string } | null;
  subjects: { subject: { id: number; name: string } | null }[];
  results: ResultRow[];
};

type SortKey = "name" | "country" | `score_${number}` | `rank_${number}`;

function toDatetimeLocal(d: Date | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 16);
}

function SortBtn({
  label,
  k,
  sortKey,
  sortDir,
  onClick,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onClick: (k: SortKey) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(k)}
      className={`text-[10px] font-semibold uppercase tracking-[0.2em] hover:text-gate-gold transition-colors ${sortKey === k ? "text-gate-gold" : "text-foreground/50"}`}
    >
      {label}
      {sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
    </button>
  );
}

export function CycleParticipantsManager({
  participants,
  rounds,
  cycleId,
  cycleSubjects,
}: {
  participants: ParticipantRow[];
  rounds: RoundRow[];
  cycleId: number;
  cycleSubjects: SubjectRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterRound, setFilterRound] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "country" ? "asc" : "desc");
    }
  }

  const filtered = useMemo(() => {
    let list = participants;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.user?.email.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q),
      );
    }

    if (filterRound !== "all") {
      list = list.filter((p) =>
        p.results.some((r) => r.roundId === filterRound),
      );
    }

    return [...list].sort((a, b) => {
      let va: string | number = 0;
      let vb: string | number = 0;

      if (sortKey === "name") {
        va = a.fullName.toLowerCase();
        vb = b.fullName.toLowerCase();
      } else if (sortKey === "country") {
        va = a.country.toLowerCase();
        vb = b.country.toLowerCase();
      } else if (sortKey.startsWith("score_")) {
        const rId = parseInt(sortKey.replace("score_", ""));
        va = parseFloat(a.results.find((r) => r.roundId === rId)?.score ?? "0") || 0;
        vb = parseFloat(b.results.find((r) => r.roundId === rId)?.score ?? "0") || 0;
      } else if (sortKey.startsWith("rank_")) {
        const rId = parseInt(sortKey.replace("rank_", ""));
        va = a.results.find((r) => r.roundId === rId)?.rank ?? 9999;
        vb = b.results.find((r) => r.roundId === rId)?.rank ?? 9999;
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [participants, search, filterRound, sortKey, sortDir]);

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 border border-border bg-card px-4 py-3">
        <Input
          placeholder="Search name, email, country…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm w-52"
        />

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40">Round:</span>
          <button
            type="button"
            onClick={() => setFilterRound("all")}
            className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 border transition-colors ${filterRound === "all" ? "border-gate-gold text-gate-gold" : "border-border text-foreground/40 hover:border-gate-gold/40"}`}
          >
            All
          </button>
          {rounds.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setFilterRound(r.id)}
              className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 border transition-colors ${filterRound === r.id ? "border-gate-gold text-gate-gold" : "border-border text-foreground/40 hover:border-gate-gold/40"}`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <span className="ml-auto text-[10px] font-light text-foreground/40">
          {filtered.length} of {participants.length}
        </span>
      </div>

      {/* Table header */}
      <div className="border border-border bg-card">
        <div
          className="grid gap-3 px-4 py-2.5 bg-muted/30 border-b border-border"
          style={{ gridTemplateColumns: `2fr 1fr 1fr ${rounds.map(() => "1fr").join(" ")} 1fr 1fr 60px` }}
        >
          <SortBtn label="Name" k="name" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <SortBtn label="Country" k="country" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Subject</span>
          {rounds.map((r) => (
            <div key={r.id} className="flex flex-col gap-0.5">
              <SortBtn label={r.name} k={`score_${r.id}`} sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <button
                type="button"
                onClick={() => toggleSort(`rank_${r.id}`)}
                className={`text-[9px] font-semibold uppercase tracking-[0.15em] hover:text-gate-gold transition-colors text-left ${sortKey === `rank_${r.id}` ? "text-gate-gold" : "text-foreground/30"}`}
              >
                rank{sortKey === `rank_${r.id}` ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
              </button>
            </div>
          ))}
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Reg</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Pay</span>
          <span />
        </div>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-sm font-light text-foreground/40 text-center">
            No participants match the current filter.
          </p>
        )}

        {filtered.map((p) => {
          const subjectId = p.subjects[0]?.subject?.id ?? cycleSubjects[0]?.id ?? 0;
          const subjectName = p.subjects[0]?.subject?.name ?? "—";
          const isOpen = expanded === p.id;

          return (
            <div key={p.id} className="border-b border-border last:border-0">
              {/* Row */}
              <div
                className="grid gap-3 px-4 py-3 items-center hover:bg-muted/20 cursor-pointer transition-colors"
                style={{ gridTemplateColumns: `2fr 1fr 1fr ${rounds.map(() => "1fr").join(" ")} 1fr 1fr 60px` }}
                onClick={() => setExpanded(isOpen ? null : p.id)}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-light text-foreground truncate">{p.fullName}</p>
                  <p className="text-[10px] font-light text-foreground/40 truncate">{p.user?.email ?? "—"}</p>
                </div>
                <span className="text-xs font-light text-foreground/60 truncate">{p.country}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/50 truncate">{subjectName}</span>

                {rounds.map((r) => {
                  const res = p.results.find((x) => x.roundId === r.id);
                  if (!res) {
                    return (
                      <span key={r.id} className="text-[10px] font-light text-foreground/25">—</span>
                    );
                  }
                  return (
                    <div key={r.id} className="flex flex-col gap-0.5">
                      <span className="text-xs font-light text-foreground">
                        {res.score ?? "—"}{res.maxScore ? `/${res.maxScore}` : ""}
                      </span>
                      {res.rank && (
                        <span className="text-[9px] font-semibold text-foreground/40">#{res.rank}</span>
                      )}
                      {res.award && (
                        <span className={`text-[8px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-sm w-fit ${AWARD_COLOR[res.award] ?? ""}`}>
                          {AWARD_LABELS[res.award] ?? res.award}
                        </span>
                      )}
                    </div>
                  );
                })}

                <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${REG_COLOR[p.registrationStatus] ?? ""}`}>
                  {p.registrationStatus}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${PAY_COLOR[p.paymentStatus] ?? ""}`}>
                  {p.paymentStatus}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/participants/${p.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gate-gold hover:underline"
                  >
                    View
                  </Link>
                  <span className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${isOpen ? "text-foreground" : "text-foreground/30"}`}>
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expanded result editor */}
              {isOpen && (
                <div className="border-t border-border bg-muted/20 px-4 py-4 flex flex-col gap-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
                    Edit Results — {p.fullName}
                  </p>

                  {rounds.length === 0 && (
                    <p className="text-xs font-light text-foreground/40">No rounds defined for this cycle.</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rounds.map((r) => {
                      const existing = p.results.find((x) => x.roundId === r.id);
                      const effectiveSubjectId = existing?.subjectId ?? subjectId;

                      return (
                        <div key={r.id} className="border border-border bg-card p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
                              {r.name}
                            </p>
                            {existing && (
                              <form action={deleteResult}>
                                <input type="hidden" name="id" value={existing.id} />
                                <input type="hidden" name="cycleId" value={cycleId} />
                                <button
                                  type="submit"
                                  className="text-[9px] font-semibold uppercase tracking-[0.15em] text-red-400 hover:text-red-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Delete Result
                                </button>
                              </form>
                            )}
                          </div>

                          <form action={upsertResult} className="flex flex-col gap-3">
                            <input type="hidden" name="resultId" value={existing?.id ?? ""} />
                            <input type="hidden" name="participantId" value={p.id} />
                            <input type="hidden" name="cycleId" value={cycleId} />
                            <input type="hidden" name="roundId" value={r.id} />
                            <input type="hidden" name="subjectId" value={effectiveSubjectId} />

                            {cycleSubjects.length > 1 && (
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Subject</label>
                                <select
                                  name="subjectId"
                                  defaultValue={effectiveSubjectId}
                                  className="h-9 border border-border bg-input px-3 text-sm font-light text-foreground focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
                                >
                                  {cycleSubjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Score</label>
                                <Input name="score" defaultValue={existing?.score ?? ""} placeholder="e.g. 87.5" className="h-8 text-sm" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Max Score</label>
                                <Input name="maxScore" defaultValue={existing?.maxScore ?? ""} placeholder="e.g. 100" className="h-8 text-sm" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Rank</label>
                                <Input name="rank" type="number" min="1" defaultValue={existing?.rank ?? ""} placeholder="e.g. 3" className="h-8 text-sm" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Award</label>
                                <select
                                  name="award"
                                  defaultValue={existing?.award ?? ""}
                                  className="h-9 border border-border bg-input px-3 text-sm font-light text-foreground focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
                                >
                                  <option value="">— None —</option>
                                  <option value="gold">Certificate of Distinction</option>
                                  <option value="silver">Certificate of High Achievement</option>
                                  <option value="bronze">Certificate of Merit</option>
                                  <option value="honorable_mention">Honorable Mention</option>
                                  <option value="participation">Certificate of Participation</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Published At</label>
                              <Input
                                name="publishedAt"
                                type="datetime-local"
                                defaultValue={toDatetimeLocal(existing?.publishedAt)}
                                className="h-8 text-sm"
                              />
                            </div>

                            <Button type="submit" variant="gold" size="sm" className="w-fit">
                              {existing ? "Update Result" : "Save Result"}
                            </Button>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
