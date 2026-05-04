"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addResult } from "@/lib/actions/admin";

type Round = { id: number; name: string };
type Cycle = { id: number; name: string; rounds: Round[] };
type Participant = { id: number; fullName: string; country: string };
type Subject = { id: number; name: string };

interface ResultsFormProps {
  allParticipants: Participant[];
  allSubjects: Subject[];
  allCycles: Cycle[];
}

export function ResultsForm({ allParticipants, allSubjects, allCycles }: ResultsFormProps) {
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  const filteredRounds =
    selectedCycleId != null
      ? (allCycles.find((c) => c.id === selectedCycleId)?.rounds ?? [])
      : [];

  return (
    <form action={addResult} className="p-6 border-t border-border flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="participantId">Participant *</Label>
          <select
            id="participantId"
            name="participantId"
            required
            className="flex h-11 w-full border border-border bg-input px-3 py-2 text-sm font-light text-foreground focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
          >
            <option value="">Select participant...</option>
            {allParticipants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.country})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="subjectId">Subject *</Label>
          <select
            id="subjectId"
            name="subjectId"
            required
            className="flex h-11 w-full border border-border bg-input px-3 py-2 text-sm font-light text-foreground focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
          >
            <option value="">Select subject...</option>
            {allSubjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cycleId">Cycle *</Label>
          <select
            id="cycleId"
            name="cycleId"
            required
            className="flex h-11 w-full border border-border bg-input px-3 py-2 text-sm font-light text-foreground focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
            value={selectedCycleId ?? ""}
            onChange={(e) =>
              setSelectedCycleId(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Select cycle...</option>
            {allCycles.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="roundId">Round</Label>
          <select
            id="roundId"
            name="roundId"
            disabled={selectedCycleId == null}
            className="flex h-11 w-full border border-border bg-input px-3 py-2 text-sm font-light text-foreground focus-visible:outline-none focus-visible:border-gate-gold rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {selectedCycleId == null ? "Select a cycle first" : "No specific round"}
            </option>
            {filteredRounds.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="score">Score</Label>
          <Input id="score" name="score" placeholder="e.g. 78.5" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="maxScore">Max Score</Label>
          <Input id="maxScore" name="maxScore" placeholder="e.g. 100" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rank">Rank</Label>
          <Input id="rank" name="rank" type="number" min="1" placeholder="e.g. 3" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="award">Award</Label>
          <select
            id="award"
            name="award"
            className="flex h-11 w-full border border-border bg-input px-3 py-2 text-sm font-light text-foreground focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
          >
            <option value="">No award</option>
            <option value="gold">Gold Medal</option>
            <option value="silver">Silver Medal</option>
            <option value="bronze">Bronze Medal</option>
            <option value="honorable_mention">Honorable Mention</option>
            <option value="participation">Participation</option>
          </select>
        </div>
      </div>
      <div>
        <Button type="submit" variant="gold" size="md">Add Result</Button>
      </div>
    </form>
  );
}
