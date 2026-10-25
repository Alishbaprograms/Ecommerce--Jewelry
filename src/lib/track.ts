import type { EventName } from "@/lib/events";

const SESSION_KEY = "zohrae-sid";

// A random anonymous id kept in this browser. It is not tied to a name, phone or email.
function sessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/** Fire-and-forget usage event. Never throws and never blocks the page. */
export function track(name: EventName, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ name, sessionId: sessionId(), props });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch {}
}
