"use client";

import React from "react";
import { ProductShelf } from "./product-shelf";

export function BestSellers() {
  return (
    <ProductShelf
      title="Kid favourites 💖"
      subtitle="The pieces little ones keep asking for"
      filter="best-sellers"
      href="/best-sellers"
      tone="bg-muted"
    />
  );
}
