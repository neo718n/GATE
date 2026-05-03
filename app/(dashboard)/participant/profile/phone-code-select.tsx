"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type PhoneCode = {
  country: string;
  dial: string;
  flag: string;
  iso: string;
};

export function PhoneCodeSelect({
  codes,
  defaultValue,
}: {
  codes: PhoneCode[];
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = codes.find((c) => c.dial === value) ?? codes[0];

  const filtered = search
    ? codes.filter(
        (c) =>
          c.country.toLowerCase().includes(search.toLowerCase()) ||
          c.iso.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search)
      )
    : codes;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <input type="hidden" name="phoneCode" value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-12 rounded-xl border border-border bg-card px-3 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all duration-200 flex items-center gap-1.5 min-w-[90px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://flagcdn.com/w20/${selected.iso.toLowerCase()}.png`}
          alt={selected.iso}
          width={20}
          height={15}
          className="rounded-sm object-cover shrink-0"
        />
        <ChevronDown
          className={`h-3.5 w-3.5 text-foreground/40 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-light text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-gate-gold transition-colors"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-foreground/40">No results</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.dial}
                  type="button"
                  onClick={() => {
                    setValue(c.dial);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-gate-gold/8 ${
                    c.dial === value
                      ? "bg-gate-gold/10"
                      : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/w20/${c.iso.toLowerCase()}.png`}
                    alt={c.iso}
                    width={20}
                    height={15}
                    className="rounded-sm object-cover shrink-0"
                  />
                  <span
                    className={`text-[11px] font-semibold w-7 shrink-0 tracking-wide ${
                      c.dial === value ? "text-gate-gold" : "text-foreground"
                    }`}
                  >
                    {c.iso}
                  </span>
                  <span className="text-xs font-light text-foreground/60 truncate flex-1">
                    {c.country}
                  </span>
                  <span className="text-[10px] text-foreground/35 shrink-0 ml-1">
                    {c.dial.replace(/\s*\(.*\)/, "")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
