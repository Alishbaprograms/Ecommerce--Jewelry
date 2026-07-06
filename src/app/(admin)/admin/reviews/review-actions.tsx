"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReviewActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function update(newStatus: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { toast.success(`Review ${newStatus.toLowerCase()}`); router.refresh(); }
    else toast.error("Failed to update review");
  }

  if (status === "APPROVED") {
    return <Button size="sm" variant="outline" onClick={() => update("REJECTED")}>Reject</Button>;
  }
  if (status === "REJECTED") {
    return <Button size="sm" variant="outline" onClick={() => update("APPROVED")}>Approve</Button>;
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => update("APPROVED")}>Approve</Button>
      <Button size="sm" variant="outline" onClick={() => update("REJECTED")}>Reject</Button>
    </div>
  );
}
