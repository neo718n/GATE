"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveAnswer, submitExam, logTabSwitch } from "@/lib/actions/exam";
import { Flag, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MathContent } from "@/components/ui/math-content";

type Question = {
  id: number;
  type: "mcq" | "numeric" | "open";
  content: string;
  points: number;
  options: { id: string; text: string }[] | null;
};

type AnswerMap = Record<number, { answer: string | null; flagged: boolean }>;

interface ExamTakerProps {
  sessionId: number;
  examId: number;
  examTitle: string;
  deadlineAt: string | null;
  questions: Question[];
  initialAnswers: AnswerMap;
  isExam: boolean;
}

function useCountdown(deadlineAt: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!deadlineAt) return;
    const tick = () => {
      const diff = Math.max(0, new Date(deadlineAt).getTime() - Date.now());
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineAt]);

  return remaining;
}

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamTaker({
  sessionId,
  examId,
  examTitle,
  deadlineAt,
  questions,
  initialAnswers,
  isExam,
}: ExamTakerProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const router = useRouter();
  const remaining = useCountdown(deadlineAt);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleSubmitRef = useRef<(auto?: boolean) => Promise<void>>(async () => {});

  const q = questions[current];

  // Tab switch detection — logs to server and shows warning on return
  useEffect(() => {
    if (!isExam) return;
    const onVisibility = () => {
      if (document.hidden) {
        logTabSwitch(sessionId);
        setTabSwitchCount((c) => c + 1);
      } else {
        // User returned to the tab — show warning
        setShowTabWarning(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [sessionId, isExam]);

  // Auto-save every 30s
  const saveCurrentAnswer = useCallback(async (qId: number, ans: string | null, flagged: boolean) => {
    await saveAnswer(sessionId, qId, ans, flagged);
    setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, [sessionId]);

  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      const a = answers[q.id];
      if (a) saveCurrentAnswer(q.id, a.answer ?? null, a.flagged);
    }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [q.id, answers, saveCurrentAnswer]);

  // Auto-submit when time runs out — uses ref to avoid stale closure
  useEffect(() => {
    if (remaining === 0) handleSubmitRef.current(true);
  }, [remaining]);

  const setAnswer = (qId: number, answer: string | null) => {
    setAnswers((prev) => ({ ...prev, [qId]: { answer, flagged: prev[qId]?.flagged ?? false } }));
  };

  const toggleFlag = (qId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { answer: prev[qId]?.answer ?? null, flagged: !prev[qId]?.flagged },
    }));
  };

  const goNext = () => {
    const a = answers[q.id];
    saveCurrentAnswer(q.id, a?.answer ?? null, a?.flagged ?? false);
    if (current < questions.length - 1) setCurrent((c) => c + 1);
  };

  const goPrev = () => {
    const a = answers[q.id];
    saveCurrentAnswer(q.id, a?.answer ?? null, a?.flagged ?? false);
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (!auto && !submitConfirm) { setSubmitConfirm(true); return; }
    setSubmitting(true);
    await Promise.all(
      questions.map((qq) => {
        const a = answers[qq.id];
        return saveAnswer(sessionId, qq.id, a?.answer ?? null, a?.flagged ?? false);
      })
    );
    await submitExam(sessionId);
    router.push(`/participant/exams/${examId}/result`);
  }, [submitConfirm, questions, answers, sessionId, examId, router]);

  // Keep ref in sync so the auto-submit useEffect always calls the latest version
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const answeredCount = questions.filter((qq) => answers[qq.id]?.answer).length;
  const isWarning = remaining !== null && remaining < 5 * 60 * 1000;
  const isDanger = remaining !== null && remaining < 60 * 1000;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-5 md:-mx-8 -my-5 md:-my-8">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <p className="text-sm font-light text-foreground truncate max-w-xs">{examTitle}</p>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-[10px] text-foreground/35 hidden md:block">Saved {lastSaved}</span>
          )}
          {remaining !== null && (
            <span className={`text-sm font-mono font-medium tabular-nums ${isDanger ? "text-destructive animate-pulse" : isWarning ? "text-yellow-600" : "text-foreground"}`}>
              {formatTime(remaining)}
            </span>
          )}
          <Button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            variant="gold"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            Submit
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question navigation sidebar */}
        <div className="hidden md:flex flex-col w-52 shrink-0 border-r border-border bg-card/50 overflow-y-auto p-3 gap-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/40 px-2 pb-2">
            {answeredCount}/{questions.length} answered
          </p>
          {questions.map((qq, idx) => {
            const a = answers[qq.id];
            const isAnswered = !!a?.answer;
            const isFlagged = a?.flagged;
            const isCurrent = idx === current;
            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => {
                  const cur = answers[q.id];
                  saveCurrentAnswer(q.id, cur?.answer ?? null, cur?.flagged ?? false);
                  setCurrent(idx);
                }}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors text-xs ${
                  isCurrent
                    ? "bg-gate-gold/15 text-gate-gold font-medium"
                    : isAnswered
                    ? "text-green-700 hover:bg-green-50/10"
                    : "text-foreground/50 hover:bg-muted/30"
                }`}
              >
                <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isCurrent ? "bg-gate-gold text-white" :
                  isAnswered ? "bg-green-600/15 text-green-700" :
                  "bg-border/60 text-foreground/30"
                }`}>
                  {idx + 1}
                </span>
                <span className="truncate flex-1">Q{idx + 1}</span>
                {isFlagged && <Flag className="h-3 w-3 text-yellow-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Question content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                Question {current + 1} of {questions.length}
              </span>
              <span className="text-foreground/20">·</span>
              <span className="text-[10px] text-foreground/40">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
            </div>
            <button
              type="button"
              onClick={() => toggleFlag(q.id)}
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                answers[q.id]?.flagged ? "text-yellow-500" : "text-foreground/30 hover:text-yellow-500"
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              {answers[q.id]?.flagged ? "Flagged" : "Flag"}
            </button>
          </div>

          {/* Question text */}
          <MathContent
            html={q.content}
            className="text-base font-light text-foreground leading-relaxed [&_p]:mb-3 [&_img]:max-w-full [&_img]:rounded-lg prose prose-sm max-w-none"
          />

          {/* Answer input */}
          {q.type === "mcq" && q.options && (
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 px-4 py-3.5 border rounded-xl cursor-pointer transition-all ${
                    answers[q.id]?.answer === opt.id
                      ? "border-gate-gold bg-gate-gold/8"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${
                    answers[q.id]?.answer === opt.id
                      ? "border-gate-gold bg-gate-gold text-white"
                      : "border-border text-foreground/40"
                  }`}>
                    {opt.id}
                  </span>
                  <span className="text-sm font-light text-foreground">{opt.text}</span>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={answers[q.id]?.answer === opt.id}
                    onChange={() => setAnswer(q.id, opt.id)}
                  />
                </label>
              ))}
            </div>
          )}

          {q.type === "numeric" && (
            <div className="flex flex-col gap-2 max-w-xs">
              <label className="text-xs font-light text-foreground/60">Your answer</label>
              <input
                type="number"
                step="any"
                value={answers[q.id]?.answer ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value || null)}
                placeholder="Enter a number..."
                className="h-12 rounded-xl border border-border bg-card px-4 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all"
              />
            </div>
          )}

          {q.type === "open" && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-light text-foreground/60">Your answer</label>
              <textarea
                value={answers[q.id]?.answer ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value || null)}
                rows={6}
                placeholder="Write your answer here..."
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all resize-none"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button onClick={goPrev} disabled={current === 0} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={goNext} variant="outline" size="sm">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => handleSubmit(false)} variant="gold" size="sm" disabled={submitting}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> Submit Exam
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab-switch warning overlay */}
      {showTabWarning && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="border border-yellow-400 bg-card p-8 max-w-sm w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="font-serif text-2xl font-light text-yellow-600">Tab switch detected</p>
              <p className="text-sm font-light text-foreground/70">
                Leaving the exam window is recorded and may affect your result.
              </p>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-[0.15em]">
                {tabSwitchCount} switch{tabSwitchCount !== 1 ? "es" : ""} recorded this session
              </p>
            </div>
            <Button
              onClick={() => setShowTabWarning(false)}
              variant="outline"
              size="sm"
              className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
            >
              I understand — continue exam
            </Button>
          </div>
        </div>
      )}

      {/* Submit confirmation overlay */}
      {submitConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="border border-border bg-card p-8 max-w-sm w-full flex flex-col gap-5">
            <div>
              <p className="font-serif text-2xl font-light text-foreground">Submit exam?</p>
              <p className="text-sm font-light text-foreground/60 mt-2">
                {answeredCount} of {questions.length} questions answered.
                {answeredCount < questions.length && (
                  <span className="text-yellow-600"> {questions.length - answeredCount} unanswered.</span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleSubmit(true)} variant="gold" size="md" disabled={submitting} className="flex-1">
                {submitting ? "Submitting…" : "Yes, Submit"}
              </Button>
              <Button onClick={() => setSubmitConfirm(false)} variant="outline" size="md" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
