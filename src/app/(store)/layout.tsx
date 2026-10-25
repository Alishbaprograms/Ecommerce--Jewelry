import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BraceletLauncher } from "@/components/store/bracelet-launcher";
import { CartDrawer } from "@/components/store/cart-drawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <BraceletLauncher />
      <main>{children}</main>
      <Footer />
    </>
  );
}
