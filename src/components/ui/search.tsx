"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SearchSuggestion = {
  type: 'course' | 'location' | 'page';
  id: number;
  title: string;
  url: string;
  location?: string | null;
};

type SearchProps = {
  placeholder?: string;
  className?: string;
};

export default function Search({ placeholder = "Search...", className }: SearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Enter" && open && query) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, query, router]);

  const groupedSuggestions = suggestions.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, SearchSuggestion[]>);

  return (
    <div ref={rootRef} className={cn("relative flex items-center", className)}>
      <button
        aria-expanded={open}
        aria-label={open ? "Close search" : "Open search"}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center text-blue-600 p-2 rounded-md hover:bg-red-600 hover:text-white transition"
      >
        {open ? <XIcon className="h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
      </button>

      <div
        className={cn(
          "origin-top-right absolute right-0 top-full mt-2 w-[300px] md:w-96 rounded-md bg-white shadow-lg border z-50 transition-all",
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
              if (e.key === "Enter" && query) {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                setOpen(false);
              }
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
            aria-label="Search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Clear search"
            >
              <XIcon className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {query.length >= 2 && (
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : suggestions.length > 0 ? (
              <>
                {Object.entries(groupedSuggestions).map(([type, items]) => (
                  <div key={type} className="py-2">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">{type}s</div>
                    {items.map((item) => (
                      <Link
                        key={`${item.type}-${item.id}`}
                        href={item.url}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        <div className="font-medium text-gray-900">{item.title}</div>
                        {item.location && <div className="text-xs text-gray-500">{item.location}</div>}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm text-blue-600 hover:bg-gray-50 border-t font-medium"
                >
                  View all results →
                </Link>
              </>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No suggestions found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
