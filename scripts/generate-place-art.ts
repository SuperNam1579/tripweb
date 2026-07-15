/**
 * Generates the local placeholder artwork for mock places
 * (public/places/{placeId}.svg): a quiet topo-line motif in the app palette.
 * Run once with: npx tsx scripts/generate-place-art.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { mockProvider } from "../lib/places/mockProvider";

const OUT = path.join(__dirname, "..", "public", "places");

function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function svgFor(placeId: string, name: string): string {
  const h = hash(placeId);
  const paths: string[] = [];
  for (let i = 0; i < 4; i++) {
    const y0 = 18 + i * 16 + ((h >> (i * 4)) % 8);
    const c1 = 20 + ((h >> (i * 3)) % 30);
    const c2 = 52 - ((h >> (i * 5)) % 30);
    paths.push(
      `<path d="M-4 ${y0} C 24 ${y0 - c1 / 2}, 48 ${y0 + c2 / 2}, 100 ${y0 - 6}" fill="none" stroke="#3E7A6E" stroke-opacity="0.45" stroke-width="1.5"/>`,
    );
  }
  const nx = 22 + (h % 52);
  const ny = 26 + ((h >> 7) % 40);
  const initial = name.replace(/^(Wat|Ko|Doi|Ban)\s+/i, "").charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" role="img" aria-label="">
<rect width="96" height="96" fill="#14312B"/>
${paths.join("\n")}
<path d="M${nx} ${ny} C ${nx + 14} ${ny + 10}, ${nx + 6} ${ny + 26}, ${nx + 20} ${ny + 34}" fill="none" stroke="#E8A33D" stroke-width="2" stroke-dasharray="4 3"/>
<circle cx="${nx}" cy="${ny}" r="4" fill="#E8A33D"/>
<circle cx="${nx + 20}" cy="${ny + 34}" r="3" fill="#F6F3ED"/>
<text x="12" y="84" font-family="monospace" font-size="13" fill="#F6F3ED" fill-opacity="0.85">${initial}</text>
</svg>`;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const regions = [
    "Northern Thailand", "Isaan", "Andaman Coast", "Gulf Islands", "Central",
  ];
  const seen = new Set<string>();
  for (const region of regions) {
    // limit high enough to pull the full catalog for the region
    const places = await mockProvider.searchPlaces(region, "", { limit: 100 });
    for (const p of places) {
      if (seen.has(p.placeId)) continue;
      seen.add(p.placeId);
      writeFileSync(path.join(OUT, `${p.placeId}.svg`), svgFor(p.placeId, p.name));
    }
  }
  console.log(`Wrote ${seen.size} SVGs to public/places`);
}

main();
