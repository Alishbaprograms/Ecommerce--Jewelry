// The only events the site records. Add a name here before tracking a new one.
export const EVENT_NAMES = [
  "visit",
  "game_start",
  "game_end",
  "bracelet_hint_shown",
  "bracelet_open",
  "bracelet_done",
  "bracelet_whatsapp",
  "bracelet_ask",
  "bracelet_shop",
  "bracelet_copy",
  "chest_hint_shown",
  "chest_click",
  "whatsapp_click",
  "category_tile_click",
  "product_view",
  "add_to_cart",
  "checkout_start",
  "review_open",
  "review_submit",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];
