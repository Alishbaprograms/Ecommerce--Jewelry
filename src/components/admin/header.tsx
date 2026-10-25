"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
      <p className="text-sm text-zinc-500">Shop admin</p>
      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900"
      >
        View shop <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </header>
  );
}
