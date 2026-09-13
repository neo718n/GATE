"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COUNTRIES, flagUrl, getCountryByIso, type CountryInfo } from "@/lib/phone-codes";

type Props = {
  name: string;
  defaultIso: string;
  variant: "dial" | "country";
  className?: string;
  id?: string;
};

export function CountryCombobox({ name, defaultIso, variant, className, id }: Props) {
  const [iso, setIso] = useState(defaultIso);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = getCountryByIso(iso);

  const filtered = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.iso2.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search),
      )
    : COUNTRIES;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setActiveIndex(0);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Keep the keyboard-highlighted option scrolled into view.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function close() {
    setOpen(false);
    setSearch("");
    setActiveIndex(0);
  }

  function select(c: CountryInfo) {
    setIso(c.iso2);
    close();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      close();
      return;
    }
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = filtered[activeIndex];
      if (choice) select(choice);
    }
  }

  const label =
    variant === "dial"
      ? `Phone country code: ${selected.name} ${selected.dial}`
      : `Country: ${selected.name}`;

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} onKeyDown={onKeyDown}>
      <input type="hidden" name={name} value={iso} />
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-label={label}
        onClick={() => {
          setActiveIndex(0);
          setOpen((o) => !o);
        }}
        className={
          variant === "dial"
            ? "h-12 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all duration-200 flex items-center gap-1.5 shrink-0 min-w-[104px]"
            : "h-12 w-full rounded-xl border border-border bg-card px-4 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all duration-200 flex items-center gap-2.5"
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagUrl(selected.iso2)}
          alt=""
          width={20}
          height={15}
          className="rounded-[2px] object-cover shrink-0"
        />
        <span className={variant === "dial" ? "text-[13px] font-semibold" : "flex-1 text-left truncate"}>
          {variant === "dial" ? selected.dial : selected.name}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-foreground/40 transition-transform duration-150 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-[calc(100%+6px)] left-0 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search country..."
              aria-label="Search country"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-light text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-gate-gold transition-colors"
            />
          </div>
          <div ref={listRef} id={listboxId} role="listbox" aria-label="Countries" className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-foreground/40">No results</p>
            ) : (
              filtered.map((c, i) => (
                <button
                  key={c.iso2}
                  type="button"
                  role="option"
                  aria-selected={c.iso2 === iso}
                  data-index={i}
                  tabIndex={-1}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => select(c)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                    i === activeIndex ? "bg-gate-gold/10" : ""
                  } ${c.iso2 === iso ? "font-medium" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flagUrl(c.iso2)}
                    alt=""
                    width={20}
                    height={15}
                    className="rounded-[2px] object-cover shrink-0"
                  />
                  <span className="text-xs font-light text-foreground/75 truncate flex-1">{c.name}</span>
                  <span className="text-[10px] text-foreground/35 shrink-0 ml-1">{c.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
