"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchProps = {
  placeholder?: string;
  className?: string;
  onSearch?: (q: string) => void | Promise<void>;
};

export default function Search({ placeholder = "Search...", className, onSearch }: SearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Enter" && open) {
        onSearch?.(query);
      }
    }

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, query, onSearch]);

  return (
    <div ref={rootRef} className={cn("relative flex items-center", className)}>
      <button
        aria-expanded={open}
        aria-label={open ? "Close search" : "Open search"}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition"
      >
        {open ? <XIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4" />}
      </button>

      <div
        className={cn(
          "origin-top-right absolute right-0 mt-2 w-[260px] md:w-80 rounded-md bg-white shadow-lg border z-50 transition-all",
          open ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          <SearchIcon className="h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch?.(query);
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
            aria-label="Search"
          />
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false); // also close when user cancels
            }}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Usage:
// import Search from '@/components/ui/search'
// <Search onSearch={(q)=> console.log('search', q)} />
