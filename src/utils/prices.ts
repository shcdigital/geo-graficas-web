// src/utils/prices.ts
// Helper to get price from category code

import prices from "../data/prices.json";

export function getPrice(category: string): string {
  const price = (prices as Record<string, number>)[category];
  if (price === undefined) return category; // fallback to show category code
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}