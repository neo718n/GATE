"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Link2, Loader2, Plus, QrCode, Users } from "lucide-react";
import { toast } from "sonner";
import { repCreateLink, repToggleLink } from "@/lib/actions/applications";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/client";

const T = {
  en: {
    created: "Link created — copy it and share with your students",
    copiedToast: "Link copied",
    newLink: "New registration link",
    lead: "Give each link a name (a school, a city or a group chat) so you can see where students came from. Everyone who fills it in appears in your Students list — no payment step.",
    create: "Create link",
    noLinks: "No links yet",
    noLinksLead: "Create your first link above and share it in your students' WhatsApp or Telegram group.",
    createdOn: "Created",
    copied: "Copied",
    copy: "Copy",
    qr: "Download QR code",
    accepting: "Accepting registrations",
    paused: "Paused — the link shows a closed message",
    dateLocale: "en-GB",
  },
  ru: {
    created: "Ссылка создана — скопируйте её и отправьте ученикам",
    copiedToast: "Ссылка скопирована",
    newLink: "Новая ссылка для регистрации",
    lead: "Дайте каждой ссылке название (школа, город или чат группы), чтобы видеть, откуда пришли ученики. Все, кто заполнит форму, появятся в разделе «Ученики» — без шага оплаты.",
    create: "Создать ссылку",
    noLinks: "Ссылок пока нет",
    noLinksLead: "Создайте первую ссылку выше и отправьте её в WhatsApp- или Telegram-чат с учениками.",
    createdOn: "Создана",
    copied: "Скопировано",
    copy: "Копировать",
    qr: "Скачать QR-код",
    accepting: "Приём заявок открыт",
    paused: "На паузе — по ссылке видно, что регистрация закрыта",
    dateLocale: "ru-RU",
  },
};

export type LinkRow = { id: number; label: string; url: string; active: boolean; count: number; createdAt: string };

// QR is rendered in the browser — the link never goes to a third-party service.
async function downloadQr(row: LinkRow) {
  const QR = await import("qrcode");
  const dataUrl = await QR.toDataURL(row.url, { width: 800, margin: 2, color: { dark: "#0b1f3a", light: "#ffffff" } });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `gate-registration-${row.label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
  a.click();
}

export function LinksManager({ links }: { links: LinkRow[] }) {
  const router = useRouter();
  const t = T[useLocale()];
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const create = () =>
    start(async () => {
      await repCreateLink(label);
      setLabel("");
      toast.success(t.created);
      router.refresh();
    });

  const copy = async (row: LinkRow) => {
    await navigator.clipboard.writeText(row.url);
    setCopied(row.id);
    toast.success(t.copiedToast);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[1.75rem] bg-ink p-6 text-ivory md:p-8">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-gold-2">{t.newLink}</span>
          <p className="max-w-xl text-[14px] leading-relaxed text-ivory/75">
            {t.lead}

          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Gymnasium Mitte — Berlin"
            maxLength={80}
            className="h-12 flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 text-[15px] text-white outline-none placeholder:text-white/40 focus:border-gate-gold-2"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gate-gold px-6 text-[14px] font-semibold text-ink transition-colors hover:bg-gate-gold-2 disabled:opacity-70"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t.create}
          </button>
        </form>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border border-dashed border-ink/15 px-6 py-14 text-center">
          <Link2 className="h-8 w-8 text-ink-3" />
          <p className="font-serif text-2xl text-ink">{t.noLinks}</p>
          <p className="max-w-sm text-[13px] text-ink-3">{t.noLinksLead}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <AnimatePresence initial={false}>
            {links.map((l) => (
              <motion.li
                key={l.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex flex-col gap-4 rounded-[1.75rem] border bg-white p-5", l.active ? "border-line" : "border-dashed border-ink/15 opacity-70")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-[15px] font-semibold text-ink">{l.label}</span>
                    <span className="text-[12px] text-ink-3">
                      {t.createdOn} {new Date(l.createdAt).toLocaleDateString(t.dateLocale, { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gate-gold/15 px-3 py-1 text-[12px] font-semibold text-gate-gold">
                    <Users className="h-3.5 w-3.5" /> {l.count}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-ivory p-2 pl-4">
                  <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink-2">{l.url}</span>
                  <button
                    type="button"
                    onClick={() => copy(l)}
                    disabled={!l.active}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3 text-[12px] font-semibold text-ivory disabled:opacity-40"
                  >
                    {copied === l.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === l.id ? t.copied : t.copy}
                  </button>
                  <button
                    type="button"
                    aria-label={t.qr}
                    disabled={!l.active}
                    onClick={() => downloadQr(l)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ink/10 bg-white text-ink disabled:opacity-40"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-ink-3">{l.active ? t.accepting : t.paused}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={l.active}
                    onClick={() =>
                      start(async () => {
                        await repToggleLink(l.id, !l.active);
                        router.refresh();
                      })
                    }
                    className={cn("relative h-7 w-12 rounded-full transition-colors", l.active ? "bg-gate-gold" : "bg-ink/15")}
                  >
                    <motion.span layout className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow", l.active ? "right-1" : "left-1")} />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
