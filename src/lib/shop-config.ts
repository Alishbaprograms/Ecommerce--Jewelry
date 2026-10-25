// Shop-wide checkout rules. Change these numbers to change shipping at checkout.
export const SHIPPING_FLAT = 250; // Rs. charged per order
export const FREE_SHIPPING_OVER = 5000; // orders with a subtotal at or above this ship free

export function calcShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
}

// Zohraé's WhatsApp number, digits only with country code (used for wa.me links).
export const WHATSAPP_NUMBER = "923008253129";
export const WHATSAPP_DISPLAY = "+92 300 8253129";

export function whatsappLink(message?: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

// Catch the Jewels rewards. The most gems caught in a round decides the tier; one tier per round.
// Each win creates a one-time coupon. Change the numbers here to change the offer.
export const REWARD_TIERS = [
  { name: "Gold", minCatches: 30, discount: 200, minSpend: 1800 },
  { name: "Silver", minCatches: 20, discount: 150, minSpend: 1500 },
  { name: "Bronze", minCatches: 10, discount: 100, minSpend: 1000 },
] as const;
export const ROUND_SECONDS = 30;
export const COUPON_VALID_DAYS = 7;
// More gems than this can't fall in one round, so a bigger score is fake.
export const MAX_POSSIBLE_CATCHES = 55;

export function tierFor(catches: number) {
  return REWARD_TIERS.find((t) => catches >= t.minCatches) ?? null;
}
