import React from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { subDays, startOfDay, format } from "date-fns";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analytics — Admin" };

async function getAnalytics() {
  const now = new Date();
  const days = Array.from({ length: 30 }, (_, i) => subDays(now, 29 - i));

  const [revenueByDay, topProducts, ordersByStatus, recentRevenue, totalRevenue, totalOrders, totalCustomers] = await Promise.all([
    Promise.all(days.map(async (day) => {
      const start = startOfDay(day);
      const end = new Date(start.getTime() + 86400000);
      const agg = await db.order.aggregate({
        where: { createdAt: { gte: start, lt: end }, paymentStatus: "PAID", deletedAt: null },
        _sum: { total: true },
        _count: true,
      });
      return { date: format(day, "MMM d"), revenue: Number(agg._sum.total ?? 0), orders: agg._count };
    })),
    db.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.order.aggregate({
      where: { createdAt: { gte: subDays(now, 30) }, paymentStatus: "PAID", deletedAt: null },
      _sum: { total: true },
    }),
    db.order.aggregate({ where: { paymentStatus: "PAID", deletedAt: null }, _sum: { total: true } }),
    db.order.count({ where: { deletedAt: null } }),
    db.user.count({ where: { role: "CUSTOMER", deletedAt: null } }),
  ]);

  return {
    revenueByDay,
    topProducts: topProducts.map((p) => ({
      name: p.productName,
      quantity: p._sum.quantity ?? 0,
      revenue: Number(p._sum.totalPrice ?? 0),
    })),
    ordersByStatus,
    recentRevenue: Number(recentRevenue._sum.total ?? 0),
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
    totalOrders,
    totalCustomers,
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  const maxRevenue = Math.max(...data.revenueByDay.map((d) => d.revenue), 1);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Store performance overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: formatPrice(data.totalRevenue) },
          { label: "Last 30 Days", value: formatPrice(data.recentRevenue) },
          { label: "Total Orders", value: data.totalOrders.toLocaleString() },
          { label: "Total Customers", value: data.totalCustomers.toLocaleString() },
        ].map((k) => (
          <div key={k.label} className="border border-border rounded-xl p-5 bg-zinc-50">
            <p className="font-serif text-2xl font-light">{k.value}</p>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart (30 days) */}
        <div className="lg:col-span-2 border border-border p-6">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-6">Revenue — Last 30 Days</h2>
          <div className="flex items-end gap-1 h-40">
            {data.revenueByDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-foreground/80 group-hover:bg-foreground transition-colors rounded-t-sm"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? "2px" : "0" }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {formatPrice(d.revenue)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{data.revenueByDay[0]?.date}</span>
            <span>{data.revenueByDay[data.revenueByDay.length - 1]?.date}</span>
          </div>
        </div>

        {/* Order status */}
        <div className="border border-border p-6">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-6">Orders by Status</h2>
          <div className="space-y-3">
            {data.ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{s.status.toLowerCase()}</span>
                <span className="font-medium">{s._count}</span>
              </div>
            ))}
            {data.ordersByStatus.length === 0 && (
              <p className="text-muted-foreground text-sm">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="mt-6 border border-border p-6">
        <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-6">Top Products by Units Sold</h2>
        {data.topProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {data.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4">
                <span className="text-2xl font-serif font-light text-muted-foreground w-8">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.quantity} units sold</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(p.revenue)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
