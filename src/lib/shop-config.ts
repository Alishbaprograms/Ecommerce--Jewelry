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

// Catch the Jewels. A round lasts ROUND_SECONDS and starts slow, then speeds up. See the game component.
// The most gems caught decides the tier; one tier per round. Each win creates a one-time coupon.
// Change the numbers here to change the offer.
export const ROUND_SECONDS = 45;
export const REWARD_TIERS = [
  { name: "Gold", minCatches: 55, discount: 200, minSpend: 1800 },
  { name: "Silver", minCatches: 40, discount: 150, minSpend: 1500 },
  { name: "Bronze", minCatches: 25, discount: 100, minSpend: 1000 },
] as const;
export const COUPON_VALID_DAYS = 7;
// About 83 gems fall in a full round (see spawn timing in the game), so a bigger score is fake.
export const MAX_POSSIBLE_CATCHES = 85;
// Coupon codes look like SPARKLE-200-K7M2X: a word, the Rs. amount, then 5 random characters.
export const COUPON_WORDS = ["SPARKLE", "GLITTER", "TWINKLE", "RAINBOW", "TREASURE", "STARLIGHT", "BLOOM", "SHINY"];

export function tierFor(catches: number) {
  return REWARD_TIERS.find((t) => catches >= t.minCatches) ?? null;
}
