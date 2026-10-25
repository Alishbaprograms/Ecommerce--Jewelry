"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/shop-config";
import dynamic from "next/dynamic";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const total = searchParams.get("total");

  const [windowSize, setWindowSize] = React.useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = React.useState(true);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          colors={["#C9A84C", "#1a1a1a", "#ffffff", "#D4AF37"]}
          numberOfPieces={150}
          recycle={false}
        />
      )}

      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-6" strokeWidth={1.5} />
          </motion.div>

          <h1 className="font-serif text-4xl font-light mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for your order. We'll confirm your order shortly and get it on its way.
          </p>

          {orderNumber && (
            <div className="bg-muted py-3 px-6 inline-block mb-8 mt-4">
              <p className="text-xs tracking-widest uppercase text-muted-foreground">Order Number</p>
              <p className="font-mono font-medium mt-1">{orderNumber}</p>
            </div>
          )}

          {total && (
            <p className="text-sm mb-8">
              Please keep <span className="font-semibold">Rs. {Number(total).toLocaleString("en-PK")}</span> ready in cash when your order arrives.
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { Icon: Mail, label: "We'll call to confirm" },
              { Icon: Package, label: "Packed with care" },
              { Icon: Truck, label: "Pay cash on delivery" },
            ].map(({ Icon, label }) => (
              <div key={label} className="text-center">
                <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Questions about your order?{" "}
            <a
              href={whatsappLink(`Hi Zohraé! I have a question about my order ${orderNumber ?? ""}`.trim())}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline"
            >
              Message us on WhatsApp
            </a>
          </p>

          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/collections">Continue Shopping</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
