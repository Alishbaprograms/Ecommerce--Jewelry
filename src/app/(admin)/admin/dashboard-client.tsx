"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  BarChart2,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  stats: {
    todayOrders: number;
    todayRevenue: number;
    monthOrders: number;
    monthRevenue: number;
    totalCustomers: number;
    pendingOrders: number;
    lowStockVariants: number;
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      total: string;
      status: string;
      createdAt: string;
      user: { name: string };
      items: Array<{ productName: string }>;
    }>;
    topProducts: Array<{
      productId: string;
      productName: string;
      _sum: { quantity: number | null; totalPrice: string | null };
    }>;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "warning",
  CONFIRMED: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "default",
  delay = 0,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  color?: "default" | "gold" | "success" | "warning" | "danger";
  delay?: number;
}) {
  const bgColors = {
    default: "bg-white",
    gold: "bg-amber-50",
    success: "bg-emerald-50",
    warning: "bg-amber-50",
    danger: "bg-rose-50",
  };

  const iconColors = {
    default: "text-zinc-500",
    gold: "text-amber-600",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-rose-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${bgColors[color]} rounded-xl border border-zinc-200 p-6`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-zinc-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-xs text-emerald-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-white shadow-sm ${iconColors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export function AdminDashboardClient({ stats }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatPrice(stats.todayRevenue)}
          subtitle="Today"
          icon={DollarSign}
          color="gold"
          delay={0}
        />
        <StatCard
          title="Today's Orders"
          value={String(stats.todayOrders)}
          icon={ShoppingCart}
          delay={0.05}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatPrice(stats.monthRevenue)}
          subtitle="This month"
          icon={BarChart2}
          color="success"
          delay={0.1}
        />
        <StatCard
          title="Total Customers"
          value={String(stats.totalCustomers)}
          icon={Users}
          delay={0.15}
        />
        <StatCard
          title="Pending Orders"
          value={String(stats.pendingOrders)}
          subtitle="Awaiting fulfillment"
          icon={Clock}
          color={stats.pendingOrders > 10 ? "warning" : "default"}
          delay={0.2}
        />
        <StatCard
          title="Monthly Orders"
          value={String(stats.monthOrders)}
          icon={Package}
          delay={0.25}
        />
        <StatCard
          title="Low Stock"
          value={String(stats.lowStockVariants)}
          subtitle="Variants need restocking"
          icon={AlertTriangle}
          color={stats.lowStockVariants > 5 ? "danger" : "default"}
          delay={0.3}
        />
        <StatCard
          title="Avg Order Value"
          value={stats.monthOrders > 0
            ? formatPrice(stats.monthRevenue / stats.monthOrders)
            : formatPrice(0)
          }
          icon={TrendingUp}
          color="gold"
          delay={0.35}
        />
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl border border-zinc-200"
        >
          <div className="flex items-center justify-between p-6 border-b border-zinc-100">
            <h2 className="font-semibold text-zinc-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors">
              View all →
            </a>
          </div>
          <div className="divide-y divide-zinc-100">
            {stats.recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500 text-center">No orders yet</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-medium">
                      {order.user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.user.name}</p>
                      <p className="text-xs text-zinc-500">{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(Number(order.total))}</p>
                    <Badge variant={(statusColors[order.status] ?? "secondary") as "warning" | "secondary" | "success" | "destructive"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Top products */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-xl border border-zinc-200"
        >
          <div className="flex items-center justify-between p-6 border-b border-zinc-100">
            <h2 className="font-semibold text-zinc-900">Top Products</h2>
            <a href="/admin/analytics" className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors">
              Analytics →
            </a>
          </div>
          <div className="divide-y divide-zinc-100">
            {stats.topProducts.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500 text-center">No sales data yet</p>
            ) : (
              stats.topProducts.map((product, i) => (
                <div key={product.productId} className="flex items-center gap-3 p-4">
                  <span className="text-xs font-bold text-zinc-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.productName}</p>
                    <p className="text-xs text-zinc-500">{product._sum.quantity ?? 0} sold</p>
                  </div>
                  <p className="text-sm font-medium text-emerald-600">
                    {formatPrice(Number(product._sum.totalPrice ?? 0))}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      {(stats.pendingOrders > 0 || stats.lowStockVariants > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" />
            Action Required
          </h3>
          <div className="space-y-1 text-sm text-amber-700">
            {stats.pendingOrders > 0 && (
              <p>• <strong>{stats.pendingOrders}</strong> orders are pending fulfillment</p>
            )}
            {stats.lowStockVariants > 0 && (
              <p>• <strong>{stats.lowStockVariants}</strong> product variants are running low on stock</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
