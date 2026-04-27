"use client";

import { useState, useRef } from "react";
import { sendNotification } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Cycle {
  id: number;
  name: string;
  year: number;
}

export function NotificationForm({ cycles }: { cycles: Cycle[] }) {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setError(null);
    setSuccess(null);
    setPending(true);

    try {
      const formData = new FormData(formRef.current);
      await sendNotification(formData);
      setSuccess("Notification sent successfully.");
      formRef.current.reset();
      setFilter("all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 border border-gate-fog bg-white p-6"
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gate-800">
        Compose Notification
      </h2>

      {success && (
        <p className="text-xs text-green-700 border border-green-200 bg-green-50 px-4 py-3">
          {success}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 border border-red-200 bg-red-50 px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label>Recipients</Label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm font-light text-gate-800 cursor-pointer">
            <input
              type="radio"
              name="recipientFilter"
              value="all"
              checked={filter === "all"}
              onChange={() => setFilter("all")}
              className="accent-gate-gold"
            />
            All verified users
          </label>
          <label className="flex items-center gap-2 text-sm font-light text-gate-800 cursor-pointer">
            <input
              type="radio"
              name="recipientFilter"
              value="cycle"
              checked={filter === "cycle"}
              onChange={() => setFilter("cycle")}
              className="accent-gate-gold"
            />
            By cycle
          </label>
        </div>
      </div>

      {filter === "cycle" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="cycleId">Cycle</Label>
          <select
            id="cycleId"
            name="cycleId"
            className="h-9 border border-gate-800/20 bg-white px-3 text-sm font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
          >
            <option value="">— select cycle —</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.year})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="e.g. Important update about Round II"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Message</Label>
        <textarea
          id="body"
          name="body"
          rows={6}
          required
          placeholder="Write your message here..."
          className="w-full border border-gate-800/20 bg-white px-3 py-2 text-sm font-light text-gate-800 placeholder:text-gate-800/30 focus-visible:outline-none focus-visible:border-gate-gold resize-none"
        />
      </div>

      <Button type="submit" variant="gold" size="md" disabled={pending} className="w-fit">
        {pending ? "Sending…" : "Send Notification"}
      </Button>
    </form>
  );
}
