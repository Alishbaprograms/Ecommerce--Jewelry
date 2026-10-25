"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";

export function AdminHeader({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="h-14 sm:h-16 bg-white border-b border-zinc-200 flex items-center justify-between gap-3 px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="lg:hidden -ml-1 p-2 rounded-md text-zinc-700 hover:bg-zinc-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm text-zinc-500">Shop admin</p>
      </div>
      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 whitespace-nowrap"
      >
        View shop <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </header>
  );
}
