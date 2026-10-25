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
