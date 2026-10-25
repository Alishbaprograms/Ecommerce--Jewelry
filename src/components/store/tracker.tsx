"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

// Records one "visit" per browser session so the Insights funnel has a starting number.
export function Tracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("zohrae-visit")) return;
      sessionStorage.setItem("zohrae-visit", "1");
    } catch {}
    track("visit");
  }, []);
  return null;
}
