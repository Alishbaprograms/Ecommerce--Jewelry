"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Heart, MapPin, User, Bell, LogOut, ShoppingBag, Star, Plus, Trash2, X,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const navItems = [
  { label: "My Orders", icon: Package, tab: "orders" },
  { label: "Wishlist", icon: Heart, tab: "wishlist" },
  { label: "Addresses", icon: MapPin, tab: "addresses" },
  { label: "Profile", icon: User, tab: "profile" },
  { label: "Notifications", icon: Bell, tab: "notifications" },
];

const STATUS_COLORS = {
  PENDING: "warning", CONFIRMED: "secondary", PROCESSING: "secondary",
  SHIPPED: "success", DELIVERED: "success", CANCELLED: "destructive",
} as const;

type Order = {
  id: string; orderNumber: string; total: string;
  status: keyof typeof STATUS_COLORS; createdAt: string;
  items: Array<{ productName: string; quantity: number }>;
};

type Address = {
  id: string; label: string; firstName: string; lastName: string;
  line1: string; line2?: string; city: string; state: string;
  postalCode: string; country: string; isDefault: boolean; phone?: string;
};

function AddressForm({ onClose, onSave }: { onClose: () => void; onSave: (data: Omit<Address, "id">) => void }) {
  const [form, setForm] = useState({
    label: "Home", firstName: "", lastName: "", phone: "",
    line1: "", line2: "", city: "", state: "", postalCode: "", country: "PK", isDefault: false,
  });

  function set(k: string, v: string | boolean) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div className="border border-border p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">New Address</h3>
        <button onClick={onClose}><X className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { k: "label", label: "Label", col: 2 },
          { k: "firstName", label: "First Name" },
          { k: "lastName", label: "Last Name" },
          { k: "phone", label: "Phone", col: 2 },
          { k: "line1", label: "Address Line 1", col: 2 },
          { k: "line2", label: "Address Line 2 (optional)", col: 2 },
          { k: "city", label: "City" },
          { k: "state", label: "Province" },
          { k: "postalCode", label: "Postal Code" },
          { k: "country", label: "Country" },
        ].map(({ k, label, col }) => (
          <div key={k} className={col === 2 ? "col-span-2" : ""}>
            <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-1">{label}</label>
            <input
              value={String(form[k as keyof typeof form])}
              onChange={(e) => set(k, e.target.value)}
              className="w-full border border-input px-3 py-2 text-sm focus:outline-none focus:border-foreground"
            />
          </div>
        ))}
        <label className="col-span-2 flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} />
          Set as default address
        </label>
      </div>
      <div className="flex gap-3 mt-4">
        <Button onClick={() => onSave(form)}>Save Address</Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { data: session, refetch: refetchSession } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("orders");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [profileReady, setProfileReady] = useState(false);

  React.useEffect(() => {
    if (session && !profileReady) {
      setProfileForm({ name: session.user.name ?? "", phone: (session.user as { phone?: string }).phone ?? "" });
      setProfileReady(true);
    }
  }, [session, profileReady]);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["account-orders"],
    queryFn: async () => {
      const res = await fetch("/api/account/orders");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "orders",
  });

  const { data: addressesData, isLoading: addressesLoading } = useQuery({
    queryKey: ["account-addresses"],
    queryFn: async () => {
      const res = await fetch("/api/account/addresses");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "addresses",
  });

  const addAddress = useMutation({
    mutationFn: async (data: Omit<Address, "id">) => {
      const res = await fetch("/api/account/addresses", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-addresses"] });
      setShowAddressForm(false);
      toast.success("Address saved");
    },
    onError: () => toast.error("Failed to save address"),
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-addresses"] });
      toast.success("Address removed");
    },
  });

  const saveProfile = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/account/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { refetchSession(); toast.success("Profile updated"); },
    onError: () => toast.error("Failed to update profile"),
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
          <Button asChild className="mt-4"><Link href="/login">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    activeTab === item.tab ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground hover:bg-muted"
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
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                {/* ORDERS */}
                {activeTab === "orders" && (
                  <div>
                    <h2 className="font-serif text-2xl font-light mb-6">My Orders</h2>
                    {ordersLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border border-border p-6 space-y-3">
                            <Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/4" />
                          </div>
                        ))}
                      </div>
                    ) : ordersData?.orders?.length === 0 ? (
                      <div className="text-center py-16 border border-border">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
                        <p className="font-serif text-xl mb-2">No orders yet</p>
                        <p className="text-muted-foreground text-sm mb-6">Start shopping to see your orders here.</p>
                        <Button asChild><Link href="/collections">Shop Now</Link></Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ordersData?.orders?.map((order: Order) => (
                          <div key={order.id} className="border border-border p-6 hover:border-foreground/30 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatPrice(Number(order.total))}</p>
                                <Badge variant={STATUS_COLORS[order.status] ?? "secondary"} className="mt-1">{order.status}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(" · ")}
                            </p>
                            <div className="flex gap-3 mt-4">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/account/orders/${order.id}`}>View Details</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ADDRESSES */}
                {activeTab === "addresses" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-2xl font-light">Saved Addresses</h2>
                      <Button size="sm" onClick={() => setShowAddressForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />Add Address
                      </Button>
                    </div>

                    {showAddressForm && (
                      <AddressForm onClose={() => setShowAddressForm(false)} onSave={(d) => addAddress.mutate(d)} />
                    )}

                    {addressesLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
                      </div>
                    ) : addressesData?.addresses?.length === 0 ? (
                      <div className="text-center py-16 border border-border">
                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
                        <p className="font-serif text-xl mb-2">No saved addresses</p>
                        <p className="text-muted-foreground text-sm">Add an address for faster checkout.</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {addressesData?.addresses?.map((addr: Address) => (
                          <div key={addr.id} className="border border-border p-5 relative">
                            {addr.isDefault && (
                              <span className="absolute top-3 right-3 text-[10px] tracking-widest uppercase bg-foreground text-background px-2 py-0.5">Default</span>
                            )}
                            <p className="font-medium mb-1">{addr.label}</p>
                            <address className="not-italic text-sm text-muted-foreground space-y-0.5">
                              <p>{addr.firstName} {addr.lastName}</p>
                              <p>{addr.line1}</p>
                              {addr.line2 && <p>{addr.line2}</p>}
                              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                              <p>{addr.country}</p>
                            </address>
                            <button
                              onClick={() => deleteAddress.mutate(addr.id)}
                              className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* PROFILE */}
                {activeTab === "profile" && (
                  <div>
                    <h2 className="font-serif text-2xl font-light mb-6">Profile Settings</h2>
                    <div className="border border-border p-6 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Full Name</label>
                          <input
                            value={profileForm.name}
                            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full border border-input px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Email</label>
                          <input
                            value={session.user.email}
                            disabled
                            className="w-full border border-input px-4 py-2.5 text-sm bg-muted text-muted-foreground cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Phone</label>
                          <input
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                            className="w-full border border-input px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
                            placeholder="+92 300 0000000"
                          />
                        </div>
                      </div>
                      <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
                        {saveProfile.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* WISHLIST */}
                {activeTab === "wishlist" && (
                  <div>
                    <h2 className="font-serif text-2xl font-light mb-6">My Wishlist</h2>
                    <div className="text-center py-16 border border-border">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
                      <p className="font-serif text-xl mb-2">Your wishlist is empty</p>
                      <p className="text-muted-foreground text-sm mb-6">Save pieces you love while you browse.</p>
                      <Button asChild><Link href="/collections">Explore Collections</Link></Button>
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {activeTab === "notifications" && (
                  <div>
                    <h2 className="font-serif text-2xl font-light mb-6">Notifications</h2>
                    <div className="border border-border p-6 text-center py-16">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
                      <p className="font-serif text-xl mb-2">You're all caught up</p>
                      <p className="text-muted-foreground text-sm">We'll notify you about orders and exclusive offers.</p>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
