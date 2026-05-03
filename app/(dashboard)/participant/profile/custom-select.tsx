"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

type Option = { value: string; label: string };

export function CustomSelect({
  name,
  defaultValue = "",
  options,
  placeholder = "Select...",
  searchable,
}: {
  name: string;
  defaultValue?: string;
  options: Option[];
  placeholder?: string;
  searchable?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

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
    if (open && searchable) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open, searchable]);

  return (
    <div ref={ref} className="relative w-full">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-card px-4 text-sm font-light transition-all duration-200 focus:outline-none ${
          open
            ? "border-gate-gold ring-2 ring-gate-gold/15"
            : "border-border hover:border-foreground/30"
        } ${selected ? "text-foreground" : "text-foreground/35"}`}
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 text-foreground/40 transition-transform duration-150 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-border">
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-light text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-gate-gold transition-colors"
              />
            </div>
          )}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-foreground/40">
                No results
              </p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    setValue(o.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-gate-gold/8 ${
                    o.value === value
                      ? "bg-gate-gold/10 text-gate-gold font-medium"
                      : "text-foreground font-light"
                  }`}
                >
                  <span>{o.label}</span>
                  {o.value === value && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-gate-gold" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
