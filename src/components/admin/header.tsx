"use client";

import React from "react";
import { Search, Bell } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="search"
          placeholder="Search products, orders, customers..."
          className="h-9 w-64 pl-9 pr-4 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-medium">
            {session?.user?.name?.[0] ?? "A"}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium leading-none">{session?.user?.name ?? "Admin"}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{(session?.user as { role?: string })?.role ?? "Admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
