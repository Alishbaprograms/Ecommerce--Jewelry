"use client";

import React from "react";
import { ProductShelf } from "./product-shelf";

export function NewArrivals() {
  return (
    <ProductShelf
      title="Just in ✨"
      subtitle="Fresh little finds, straight from the box"
      filter="new-arrivals"
      href="/new-arrivals"
    />
  );
}
