"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    const redirect = params.get("redirect");
    router.push(redirect && redirect.startsWith("/admin") ? redirect : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 p-8 space-y-5 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Shop Admin</h1>
        <p className="text-sm text-zinc-500 mt-1">Enter the admin password to manage the shop.</p>
      </div>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full h-11 px-4 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-zinc-900"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading || !password}>
        {loading ? "Checking..." : "Open Admin"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
