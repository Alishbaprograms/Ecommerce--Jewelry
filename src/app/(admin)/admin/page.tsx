import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { AdminDashboardClient } from "./dashboard-client";
import { startOfDay, startOfMonth, subDays, subMonths } from "date-fns";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const last30Start = subDays(now, 30);
  const last60Start = subDays(now, 60);

  const [
    todayOrders,
    todayRevenue,
    monthOrders,
    monthRevenue,
    totalCustomers,
    pendingOrders,
    lowStockVariants,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    db.order.count({ where: { createdAt: { gte: todayStart }, deletedAt: null } }),
    db.order.aggregate({
      where: { createdAt: { gte: todayStart }, paymentStatus: "PAID", deletedAt: null },
      _sum: { total: true },
    }),
    db.order.count({ where: { createdAt: { gte: monthStart }, deletedAt: null } }),
    db.order.aggregate({
      where: { createdAt: { gte: monthStart }, paymentStatus: "PAID", deletedAt: null },
      _sum: { total: true },
    }),
    db.user.count({ where: { role: "CUSTOMER", deletedAt: null } }),
    db.order.count({ where: { status: "PENDING", deletedAt: null } }),
    db.productVariant.count({ where: { stock: { lte: 5, gt: 0 }, deletedAt: null } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { deletedAt: null },
      include: {
        user: { select: { name: true } },
        items: { take: 1, select: { productName: true } },
      },
    }),
    db.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return {
    todayOrders,
    todayRevenue: Number(todayRevenue._sum.total ?? 0),
    monthOrders,
    monthRevenue: Number(monthRevenue._sum.total ?? 0),
    totalCustomers,
    pendingOrders,
    lowStockVariants,
    recentOrders: JSON.parse(JSON.stringify(recentOrders, (_, v) =>
      typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
    )),
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      _sum: {
        quantity: p._sum.quantity,
        totalPrice: p._sum.totalPrice?.toString() ?? null,
      },
    })),
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  return <AdminDashboardClient stats={stats} />;
}
