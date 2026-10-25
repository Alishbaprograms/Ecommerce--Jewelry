"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";
import type { Insights } from "@/lib/insights";

const RANGES = [
  { id: "1", label: "Today" },
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
];
const TABS = ["Games", "Shop activity"] as const;

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 mt-2">{value}</p>
      {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
    </div>
  );
}

function Card({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <h3 className="font-semibold text-zinc-900">{title}</h3>
      {note && <p className="text-xs text-zinc-500 mt-0.5">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Bars({ rows, empty = "Nothing yet" }: { rows: { label: string; value: number; color?: string }[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.every((r) => r.value === 0)) return <p className="text-sm text-zinc-400">{empty}</p>;
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 text-zinc-600 truncate">{r.label}</span>
          <div className="flex-1 h-3 rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: r.color ?? "#d6336c" }} />
          </div>
          <span className="w-10 text-right tabular-nums text-zinc-900">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

function tips(d: Insights): string[] {
  const out: string[] = [];
  const g = d.games;
  if (g.started >= 10) {
    if (g.finishRate < 60) out.push(`Only ${g.finishRate}% of rounds are finished, so many players quit part-way. The game may be too hard at the start or the round too long.`);
    const total = g.tiers.none + g.tiers.bronze + g.tiers.silver + g.tiers.gold;
    if (total >= 10 && g.tiers.none / total > 0.7) out.push("Most players don't reach Bronze. Consider lowering the first prize, or slowing the game down.");
    if (total >= 10 && (g.tiers.gold + g.tiers.silver) / total > 0.4) out.push("Many players reach Silver or Gold. The game may be too easy for the prize.");
  }
  if (g.codes.issued >= 5 && g.codes.redemptionRate < 25) out.push(`Only ${g.codes.redemptionRate}% of won codes get used. Remind winners, or lower the minimum spend.`);
  if (d.bracelet.done >= 5 && d.bracelet.done > 0 && d.bracelet.shop / d.bracelet.done < 0.15) out.push("Few finished bracelets lead to the shop. Try a clearer 'Shop bead bracelets' button or a product shown on the result screen.");
  if (d.attention.chestHintShown >= 20 && d.attention.chestClicksFromHint / d.attention.chestHintShown < 0.05) out.push("The shaking treasure box bubble rarely gets tapped. Try different wording or a different time delay.");
  return out;
}

export default function InsightsPage() {
  const [range, setRange] = useState("7");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Games");

  const { data, isLoading, isError } = useQuery<Insights>({
    queryKey: ["admin-insights", range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/insights?range=${range}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const g = data?.games;
  const hourRows = g?.hours ?? [];
  const hourMax = Math.max(1, ...hourRows);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Insights</h1>
          <p className="text-zinc-500 text-sm mt-1">
            How people use the games and the shop. Counts are anonymous.
            {data?.trackingStartedAt && ` Tracking started ${new Date(data.trackingStartedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}.`}
          </p>
        </div>
        <div className="flex gap-1 bg-white border border-zinc-200 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-sm rounded-md ${range === r.id ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 ${tab === t ? "border-zinc-900 text-zinc-900 font-medium" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading...</p>}
      {isError && <p className="text-sm text-red-600">Could not load insights.</p>}

      {data && g && tab === "Games" && (
        <div className="space-y-6">
          {tips(data).length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
              <p className="font-semibold">Things to look at</p>
              {tips(data).map((t) => <p key={t}>• {t}</p>)}
            </div>
          )}

          <section className="space-y-3">
            <h2 className="font-semibold text-zinc-900">Catch the Jewels</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Rounds played" value={g.started} hint={`${g.players} different players`} />
              <Stat label="Finished" value={`${g.finishRate}%`} hint={`${g.finished} of ${g.started} rounds`} />
              <Stat label="Average score" value={g.avgScore} hint={`Best: ${g.bestScore}`} />
              <Stat label="Rounds per player" value={g.replaysPerPlayer} hint="Higher means they come back for more" />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <Card title="How far players get" note={`Bronze ${g.thresholds.bronze}+ · Silver ${g.thresholds.silver}+ · Gold ${g.thresholds.gold}+ gems`}>
                <Bars
                  rows={[
                    { label: "No prize", value: g.tiers.none, color: "#d4d4d8" },
                    { label: "Bronze", value: g.tiers.bronze, color: "#d97706" },
                    { label: "Silver", value: g.tiers.silver, color: "#94a3b8" },
                    { label: "Gold", value: g.tiers.gold, color: "#eab308" },
                  ]}
                  empty="No finished rounds yet"
                />
              </Card>
              <Card title="Discount codes from the game" note="Won in the game, then used on a real order">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-zinc-500">Codes won</p><p className="text-xl font-bold">{g.codes.issued}</p></div>
                  <div><p className="text-zinc-500">Codes used</p><p className="text-xl font-bold">{g.codes.used} <span className="text-sm font-normal text-zinc-500">({g.codes.redemptionRate}%)</span></p></div>
                  <div><p className="text-zinc-500">Sales from code orders</p><p className="text-xl font-bold">{formatPrice(g.codes.revenue)}</p></div>
                  <div><p className="text-zinc-500">Discount given</p><p className="text-xl font-bold">{formatPrice(g.codes.discountGiven)}</p></div>
                </div>
              </Card>
            </div>
            <Card title="When people play" note="Rounds started, by hour of the day (Pakistan time)">
              {hourRows.every((h) => h === 0) ? (
                <p className="text-sm text-zinc-400">No rounds yet</p>
              ) : (
                <div>
                  <div className="flex items-end gap-1 h-24">
                    {hourRows.map((n, h) => (
                      <div key={h} title={`${h}:00 · ${n} rounds`} className="flex-1 rounded-t bg-[#d6336c]/80" style={{ height: `${Math.max(4, (n / hourMax) * 100)}%`, opacity: n ? 1 : 0.15 }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span></div>
                </div>
              )}
            </Card>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-zinc-900">Bracelet designer</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Opened" value={data.bracelet.opened} hint={`${pct(data.attention.braceletOpensFromHint, data.attention.braceletHintShown)} of bubble views`} />
              <Stat label="Designs finished" value={data.bracelet.done} hint={`${pct(data.bracelet.done, data.bracelet.opened)} of opens · avg ${data.bracelet.avgBeads} beads`} />
              <Stat label="Shared on WhatsApp" value={data.bracelet.whatsapp} hint={`${data.bracelet.copy} copied the link`} />
              <Stat label="Asked us to make it" value={data.bracelet.ask} hint={`${data.bracelet.shop} tapped Shop bead bracelets`} />
            </div>
            <Card title="Favourite bead colours" note="Across all finished bracelets: useful for choosing what to stock">
              <Bars rows={data.bracelet.colours.map((c) => ({ label: c.name, value: c.count, color: c.color }))} empty="No finished bracelets yet" />
            </Card>
          </section>
        </div>
      )}

      {data && tab === "Shop activity" && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="font-semibold text-zinc-900">Shopping funnel</h2>
            <Card title="From visit to order" note="Unique visitors at each step. Orders come from real orders, not cancelled.">
              <Bars
                rows={[
                  { label: "Visited", value: data.funnel.visits },
                  { label: "Viewed a product", value: data.funnel.viewedProduct },
                  { label: "Added to box", value: data.funnel.addedToCart },
                  { label: "Started checkout", value: data.funnel.startedCheckout },
                  { label: "Placed an order", value: data.funnel.orders },
                ]}
              />
              <p className="text-xs text-zinc-500 mt-4">
                {pct(data.funnel.addedToCart, data.funnel.viewedProduct)} of product viewers add to the box ·{" "}
                {pct(data.funnel.startedCheckout, data.funnel.addedToCart)} of those start checkout.
              </p>
            </Card>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-zinc-900">Attention</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Treasure box bubble" value={pct(data.attention.chestClicksFromHint, data.attention.chestHintShown)} hint={`${data.attention.chestClicksFromHint} taps from ${data.attention.chestHintShown} views`} />
              <Stat label="Treasure box taps" value={data.attention.chestClicks} hint="Total, including without the bubble" />
              <Stat label="WhatsApp taps" value={Object.values(data.attention.whatsapp).reduce((a, b) => a + b, 0)} />
              <Stat label="Bracelet charm taps" value={data.attention.braceletOpens} />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <Card title="Where people tap WhatsApp">
                <Bars
                  rows={Object.entries(data.attention.whatsapp).map(([k, v]) => ({
                    label: { floating: "Floating button", footer: "Footer", order_confirmation: "After an order", bracelet: "Bracelet designer" }[k] ?? k,
                    value: v,
                  }))}
                />
              </Card>
              <Card title="Category tiles tapped on the homepage">
                <Bars rows={data.attention.tiles.map((t) => ({ label: t.slug.replace(/-/g, " "), value: t.count }))} />
              </Card>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
