import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BraceletView } from "@/components/store/bracelet-view";
import { decodeBracelet } from "@/lib/bracelet";

export const metadata: Metadata = {
  title: "A bracelet designed at Zohraé",
  description: "Someone designed this bead bracelet at Zohraé. Design your own!",
};

export default async function SharedBraceletPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const beads = decodeBracelet(d);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-sm mx-auto text-center space-y-5">
        <h1 className="font-serif text-3xl">{beads.length ? "Look what I made! 🎉" : "Design a bracelet"}</h1>
        {beads.length > 0 ? (
          <BraceletView beads={beads} className="w-64 h-64 mx-auto" />
        ) : (
          <p className="text-muted-foreground">Tap the 📿 button on the left of any page to design your own bracelet.</p>
        )}
        <div className="flex flex-col gap-2">
          <Button asChild size="lg">
            <Link href="/collections/bead-bracelets">Shop bead bracelets</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Back to the shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
