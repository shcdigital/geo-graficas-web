// src/utils/prices.ts
// Helper to get price from category code

import pricesData from "../data/prices.json";

const prices = (pricesData as { categories: Record<string, number> }).categories;

export function getPrice(category: string): string {
  const price = (prices as Record<string, number>)[category];
  if (price === undefined) return category; // fallback to show category code
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}