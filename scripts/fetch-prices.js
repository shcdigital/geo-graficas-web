// scripts/fetch-prices.js
// Fetches prices from geo-graficas-pay worker at build time
// Outputs to src/data/prices.json for Astro components to import

const PRICES_URL = process.env.PRICES_URL || "https://geo-graficas-pay.pablo-berthold.workers.dev/prices";
const OUTPUT_PATH = "src/data/prices.json";

async function fetchPrices() {
  try {
    console.log(`Fetching prices from ${PRICES_URL}...`);
    const response = await fetch(PRICES_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const prices = data.prices || {};

    // Validate structure
    const expectedCategories = ["Cat-A", "Cat-B", "Cat-C", "Cat-D", "Cat-E", "Cat-F", "Cat-G", "Cat-H", "Cat-I", "Cat-J"];
    const missing = expectedCategories.filter(cat => !prices[cat]);
    if (missing.length > 0) {
      console.warn(`Warning: missing prices for ${missing.join(", ")}`);
    }

    // Write to file
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const outputFile = path.join(__dirname, "..", OUTPUT_PATH);

    fs.writeFileSync(outputFile, JSON.stringify(prices, null, 2));
    console.log(`✅ Prices saved to ${OUTPUT_PATH}`);
    console.log("Prices:", JSON.stringify(prices, null, 2));

  } catch (error) {
    console.error("❌ Failed to fetch prices:", error.message);
    console.log("Using fallback prices...");

    // Fallback prices (should match products.json)
    const fallbackPrices = {
      "Cat-A": 1000,
      "Cat-B": 4500,
      "Cat-C": 8500,
      "Cat-D": 12000,
      "Cat-E": 15000,
      "Cat-F": 20000,
      "Cat-G": 25000,
      "Cat-H": 30000,
      "Cat-I": 40000,
      "Cat-J": 50000,
    };

    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const outputFile = path.join(__dirname, "..", OUTPUT_PATH);

    fs.writeFileSync(outputFile, JSON.stringify(fallbackPrices, null, 2));
    console.log(`✅ Fallback prices saved to ${OUTPUT_PATH}`);

    // Don't fail build - allow fallback
  }
}

fetchPrices();