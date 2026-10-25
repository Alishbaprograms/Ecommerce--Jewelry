"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, Undo2 } from "lucide-react";
import { whatsappLink } from "@/lib/shop-config";
import { track } from "@/lib/track";
import { Button } from "@/components/ui/button";
import { BEADS, MAX_BEADS, decodeBracelet, encodeBracelet, type Bead } from "@/lib/bracelet";
import { BeadShape, BraceletView } from "@/components/store/bracelet-view";

function shareUrl(beads: Bead[]) {
  return `${window.location.origin}/bracelet?d=${encodeBracelet(beads)}`;
}

export function BraceletDesigner({ onShopClick }: { onShopClick?: () => void }) {
  const [beads, setBeads] = useState<Bead[]>([]);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  function add(bead: Bead) {
    setBeads((prev) => (prev.length >= MAX_BEADS ? prev : [...prev, bead]));
  }

  function finish() {
    track("bracelet_done", { beads: encodeBracelet(beads), count: beads.length });
    setDone(true);
  }

  function sendWhatsApp() {
    track("bracelet_whatsapp");
    const text = `Look at the bracelet I designed at Zohraé! 💖 ${shareUrl(beads)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  function sendToZohrae() {
    track("bracelet_ask");
    track("whatsapp_click", { where: "bracelet" });
    window.open(
      whatsappLink(`Hi Zohraé! My little one designed this bracelet 💖 ${shareUrl(beads)} Can you make it?`),
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copyLink() {
    track("bracelet_copy");
    try {
      await navigator.clipboard.writeText(shareUrl(beads));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", shareUrl(beads));
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <h2 className="font-serif text-2xl">Look what I made! 🎉</h2>
        <BraceletView beads={beads} className="w-56 h-56 mx-auto" />
        <p className="text-sm text-muted-foreground">Show it to a grown-up, or send it to them on WhatsApp.</p>
        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={sendWhatsApp}>Send to WhatsApp</Button>
          <Button size="lg" variant="secondary" onClick={sendToZohrae}>Ask Zohraé to make this</Button>
          <Button asChild size="lg" variant="outline" onClick={() => { track("bracelet_shop"); onShopClick?.(); }}>
            <Link href="/collections/bead-bracelets">Shop bead bracelets</Link>
          </Button>
          <div className="flex gap-2 justify-center pt-1">
            <button onClick={copyLink} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Link copied" : "Copy link"}
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              onClick={() => { setBeads([]); setDone(false); }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Make another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="font-serif text-2xl">Design your bracelet</h2>
        <p className="text-sm text-muted-foreground">Tap the beads to thread them on.</p>
      </div>
      <BraceletView beads={beads} className="w-56 h-56 mx-auto" />
      <p className="text-center text-xs text-muted-foreground">{beads.length} / {MAX_BEADS} beads</p>
      <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
        {BEADS.map((bead) => (
          <button
            key={bead.code}
            onClick={() => add(bead)}
            disabled={beads.length >= MAX_BEADS}
            aria-label={`Add ${bead.label} bead`}
            className="aspect-square rounded-2xl bg-muted flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
          >
            <BeadShape bead={bead} size={30} />
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setBeads((p) => p.slice(0, -1))} disabled={!beads.length}>
          <Undo2 className="h-4 w-4 mr-1" /> Undo
        </Button>
        <Button size="lg" onClick={finish} disabled={beads.length < 3}>
          Show my mum
        </Button>
      </div>
      {beads.length > 0 && beads.length < 3 && (
        <p className="text-center text-xs text-muted-foreground">Add a few more beads first.</p>
      )}
    </div>
  );
}

export { decodeBracelet };
