/**
 * End-to-end smoke test against a running server (npm run dev / npm start).
 * Drives the real flows: create trip (with destination) → join → availability
 * → budget → vote → results, and asserts the Google Places integration
 * actually returns live places for that destination.
 *
 * Run:  npm run dev          (in one terminal)
 *       npm run e2e          (in another)
 *
 * Needs GOOGLE_PLACES_API_KEY set for the Places assertions.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const DESTINATION = "เชียงใหม่";
const ACTIVITY = "Nature";
const WINDOW_START = "2026-09-01";
const WINDOW_END = "2026-09-21";
const FREE_DAYS = ["2026-09-04", "2026-09-05", "2026-09-06"];
const BUDGET_MIN = "4500";
const BUDGET_MAX = "9000";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
}

async function main() {
  const browser = await chromium.launch();

  /* —— Owner: create a trip (creator auto-joins as the first member) —— */
  const owner = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const op = await owner.newPage();
  await op.goto(`${BASE}/create`);
  await op.fill("#name", "E2E ทดสอบทริป");
  await op.fill("#destination", DESTINATION);
  await op.fill("#yourName", "เจ้าของ E2E");
  await op.fill("#durationDays", "3");
  await op.fill("#windowStart", WINDOW_START);
  await op.fill("#windowEnd", WINDOW_END);
  await op.click("button[type=submit]");
  await op.waitForURL(/\/trip\/.+owner=/, { timeout: 20000 });
  const tripId = op.url().match(/\/trip\/([^/?]+)/)![1];
  console.log("✓ trip created:", tripId);

  await op.waitForSelector("text=ลิงก์เจ้าของ");
  await op.waitForSelector(`text=จุดหมาย: ${DESTINATION}`);
  console.log("✓ owner sees the one-time owner link + destination in the header");

  const joinCode = (await op.locator("text=/^[ACDEFGHJKMNPQRTUVWXY34679]{6,8}$/").first().textContent())?.trim();
  assert(joinCode, "join code badge visible on the trip page");
  console.log("✓ join code badge shows:", joinCode);

  /* —— Member: join via the join link (colour auto-picks a free one) —— */
  const member = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await member.newPage();
  await mp.goto(`${BASE}/join/${joinCode}`);
  await mp.fill("#displayName", "สมชาย E2E");
  await mp.click("button[type=submit]");
  await mp.waitForURL(new RegExp(`/trip/${tripId}$`), { timeout: 20000 });
  await mp.waitForSelector("text=คุณคือ");
  console.log("✓ member joined and sees their profile card");

  /* —— Availability —— */
  await mp.goto(`${BASE}/trip/${tripId}/availability`);
  for (const day of FREE_DAYS) await mp.click(`[data-date="${day}"]`);
  await mp.click("text=บันทึกวันว่าง");
  await mp.waitForSelector("text=บันทึกวันว่างแล้ว", { timeout: 20000 });
  console.log("✓ availability saved");

  /* —— Budget (range) —— */
  await mp.goto(`${BASE}/trip/${tripId}/budget`);
  await mp.fill("#amount", BUDGET_MIN);
  await mp.fill("#amountMax", BUDGET_MAX);
  await mp.click("button[type=submit]");
  await mp.waitForSelector("text=บันทึกงบของฉันแล้ว", { timeout: 20000 });
  console.log("✓ budget range saved");

  /* —— Vote (activity only — region voting is gone) —— */
  await mp.goto(`${BASE}/trip/${tripId}/votes`);
  await mp.waitForSelector(`text=ทริปไป`);
  await mp.click(`button[role=radio]:has-text("${ACTIVITY}")`);
  await mp.waitForSelector(`text=นำ: ${ACTIVITY}`, { timeout: 20000 });
  console.log("✓ activity vote cast");

  /* —— Results: dates, live Places, and no budget leak —— */
  await mp.goto(`${BASE}/trip/${tripId}/results`);
  await mp.waitForSelector("text=ช่วงที่ดีที่สุด");
  await mp.waitForSelector("text=4–6 Sep");
  console.log("✓ best date window rendered");

  await mp.waitForSelector("text=ที่เที่ยวแนะนำ");
  // This heading only renders when the live search returned places — there is
  // no mock provider to fall back to, so any place here came from Google.
  await mp.waitForSelector(`text=แนว ${ACTIVITY} ใน ${DESTINATION}`, { timeout: 20000 });
  const placeNames = await mp
    .locator("section[aria-labelledby=places-heading] article h3")
    .allTextContents();
  assert(placeNames.length > 0, "live Google Places must return at least one place (is GOOGLE_PLACES_API_KEY set?)");
  console.log(`✓ live Google Places results (${placeNames.length} places):`);
  placeNames.forEach((n) => console.log(`    · ${n}`));

  // Photos are a separate paid SKU: if the key's project has no billing, Google
  // omits `photos` entirely and we fall back to a placeholder. Not a failure —
  // but worth flagging, since it's easy to mistake for a bug.
  const googlePhotos = await mp
    .locator('section[aria-labelledby=places-heading] img[src*="places.googleapis.com"]')
    .count();
  if (googlePhotos === 0) {
    console.log("  ⚠ no Google photos (placeholder art in use) — enable billing/Places Photos to get real images");
  } else {
    console.log(`✓ ${googlePhotos} live Google photos`);
  }

  /* —— Stays: live hotels + booking deep links with the winning dates —— */
  await mp.waitForSelector(`text=ที่พักใน${DESTINATION}`, { timeout: 20000 });
  const hotelNames = await mp.locator("section[aria-labelledby=stays-heading] article h3").allTextContents();
  assert(hotelNames.length > 0, "live Google hotel search must return at least one stay");
  console.log(`✓ live hotels (${hotelNames.length}):`);
  hotelNames.forEach((n) => console.log(`    · ${n}`));

  const agodaHref = await mp.locator('a:has-text("Agoda")').getAttribute("href");
  const bookingHref = await mp.locator('a:has-text("Booking")').getAttribute("href");
  assert(agodaHref?.includes("checkIn=2026-09-04"), `Agoda link carries the winning check-in (got: ${agodaHref})`);
  assert(agodaHref?.includes("checkOut=2026-09-06"), "Agoda link carries the winning check-out");
  assert(bookingHref?.includes("checkin=2026-09-04"), `Booking link carries the winning check-in (got: ${bookingHref})`);
  assert(bookingHref?.includes("group_adults=2"), "Booking link carries the party size (2 members)");
  console.log("✓ Agoda/Booking deep links carry the winning dates + party size");

  const memberHtml = await mp.content();
  assert(!memberHtml.includes("4,500"), "member results page must not contain an individual amount");
  assert(!memberHtml.includes("9,000"), "member results page must not contain an individual amount");
  console.log("✓ no individual budget amounts leaked to a member");

  /* —— Owner sees amounts; anonymous sees nothing —— */
  await op.goto(`${BASE}/trip/${tripId}`);
  await op.waitForSelector("text=฿4,500");
  console.log("✓ owner dashboard shows the individual amount");

  const anon = await browser.newContext();
  const ap = await anon.newPage();
  await ap.goto(`${BASE}/trip/${tripId}`);
  const anonHtml = await ap.content();
  assert(anonHtml.includes("ยังไม่ได้อยู่ในทริป"), "anonymous visitor is locked out");
  assert(!anonHtml.includes("4,500"), "anonymous page must not contain amounts");
  console.log("✓ anonymous visitor sees nothing private");

  await browser.close();
  console.log("\nE2E smoke: ALL PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
