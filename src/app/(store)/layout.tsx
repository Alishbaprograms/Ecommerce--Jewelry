import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BraceletLauncher } from "@/components/store/bracelet-launcher";
import { WhatsAppButton } from "@/components/store/whatsapp-button";
import { Tracker } from "@/components/store/tracker";
import { CartDrawer } from "@/components/store/cart-drawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Tracker />
      <Navbar />
      <CartDrawer />
      <BraceletLauncher />
      <WhatsAppButton />
      <main>{children}</main>
      <Footer />
    </>
  );
}
