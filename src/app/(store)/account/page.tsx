"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package,
  Heart,
  MapPin,
  User,
  Bell,
  Settings,
  LogOut,
  ShoppingBag,
  Star,
  Gift,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "My Orders", icon: Package, tab: "orders" },
  { label: "Wishlist", icon: Heart, tab: "wishlist" },
  { label: "Addresses", icon: MapPin, tab: "addresses" },
  { label: "Profile", icon: User, tab: "profile" },
  { label: "Notifications", icon: Bell, tab: "notifications" },
];

const STATUS_COLORS = {
  PENDING: "warning",
  CONFIRMED: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "destructive",
} as const;

export default function AccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["account-orders"],
    queryFn: async () => {
      const res = await fetch("/api/account/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: activeTab === "orders",
  });

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <p className="font-serif text-2xl mb-2">Please sign in</p>
          <Button asChild className="mt-4">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-light">My Account</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="border border-border p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center text-lg font-serif">
                  {session.user.name?.[0]}
                </div>
                <div>
                  <p className="font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-400" />
                <span className="text-muted-foreground">Loyalty Points:</span>
                <span className="font-medium">{(session.user as { loyaltyPoints?: number }).loyaltyPoints ?? 0}</span>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                    activeTab === item.tab
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              ))}
              <Separator className="my-2" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "orders" && (
              <div>
                <h2 className="font-serif text-2xl font-light mb-6">My Orders</h2>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border border-border p-6 space-y-3">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : ordersData?.orders?.length === 0 ? (
                  <div className="text-center py-16 border border-border">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
                    <p className="font-serif text-xl mb-2">No orders yet</p>
                    <p className="text-muted-foreground text-sm mb-6">Start shopping to see your orders here.</p>
                    <Button asChild>
                      <Link href="/collections">Shop Now</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordersData?.orders?.map((order: {
                      id: string;
                      orderNumber: string;
                      total: string;
                      status: keyof typeof STATUS_COLORS;
                      createdAt: string;
                      items: Array<{ productName: string; quantity: number; imageUrl?: string }>;
                    }) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-border p-6 hover:border-foreground/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(Number(order.total))}</p>
                            <Badge variant={STATUS_COLORS[order.status] ?? "secondary"} className="mt-1">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.map((item) => `${item.productName} ×${item.quantity}`).join(" · ")}
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/account/orders/${order.id}`}>View Details</Link>
                          </Button>
                          {order.status === "DELIVERED" && (
                            <Button variant="ghost" size="sm">Write a Review</Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="font-serif text-2xl font-light mb-6">Profile Settings</h2>
                <div className="border border-border p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Name</label>
                      <input
                        defaultValue={session.user.name}
                        className="w-full border border-input px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Email</label>
                      <input
                        defaultValue={session.user.email}
                        type="email"
                        className="w-full border border-input px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
                      />
                    </div>
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="font-serif text-2xl font-light mb-6">My Wishlist</h2>
                <p className="text-muted-foreground">Your saved items will appear here.</p>
                <Button asChild className="mt-4">
                  <Link href="/collections">Explore Collections</Link>
                </Button>
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <h2 className="font-serif text-2xl font-light mb-6">Saved Addresses</h2>
                <Button>
                  <MapPin className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h2 className="font-serif text-2xl font-light mb-6">Notifications</h2>
                <p className="text-muted-foreground">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
