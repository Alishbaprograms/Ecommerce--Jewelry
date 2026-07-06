"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const inputCls = "w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-foreground bg-background";

export default function SettingsPage() {
  const [general, setGeneral] = useState({
    storeName: "Zohraé",
    storeEmail: "hello@zohrae.com",
    storePhone: "",
    currency: "PKR",
    freeShippingThreshold: "50000",
  });

  function save() {
    toast.success("Settings saved");
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Configure your store preferences</p>
      </div>

      <div className="space-y-6">
        <section className="border border-border p-6 space-y-4">
          <h2 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">General</h2>
          {[
            { k: "storeName", label: "Store Name" },
            { k: "storeEmail", label: "Store Email" },
            { k: "storePhone", label: "Store Phone" },
            { k: "freeShippingThreshold", label: "Free Shipping Threshold (PKR)", type: "number" },
          ].map(({ k, label, type = "text" }) => (
            <div key={k}>
              <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-1.5">{label}</label>
              <input
                type={type}
                value={general[k as keyof typeof general]}
                onChange={(e) => setGeneral((g) => ({ ...g, [k]: e.target.value }))}
                className={inputCls}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-1.5">Currency</label>
            <select value={general.currency} onChange={(e) => setGeneral((g) => ({ ...g, currency: e.target.value }))} className={inputCls}>
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="AED">AED — UAE Dirham</option>
            </select>
          </div>
        </section>

        <Button onClick={save}>Save Settings</Button>
      </div>
    </div>
  );
}
