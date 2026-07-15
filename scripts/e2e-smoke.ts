/**
 * End-to-end smoke test against a running server (npm start / npm dev).
 * Drives the real flows: create trip → join → availability → budget → votes → results.
 * Run: npx tsx scripts/e2e-smoke.ts
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
}

async function main() {
  const browser = await chromium.launch();

  /* —— Owner: create a trip —— */
  const owner = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const op = await owner.newPage();
  await op.goto(BASE);
  await op.fill("#name", "E2E ทดสอบทริป");
  await op.fill("#durationDays", "3");
  await op.fill("#windowStart", "2026-09-01");
  await op.fill("#windowEnd", "2026-09-21");
  await op.click("button[type=submit]");
  await op.waitForURL(/\/trip\/.+owner=/, { timeout: 15000 });
  const tripUrl = op.url();
  const tripId = tripUrl.match(/\/trip\/([^/?]+)/)![1];
  console.log("✓ trip created:", tripId);

  await op.waitForSelector("text=Save your owner link");
  const joinPath = await op
    .locator("text=/Join code/i")
    .first()
    .textContent();
  const joinCode = joinPath?.match(/([ACDEFGHJKMNPQRTUVWXY34679]{7})/)?.[1];
  assert(joinCode, `join code visible on dashboard (got: ${joinPath})`);
  console.log("✓ owner dashboard shows join code:", joinCode);

  /* —— Member: join via the join link —— */
  const member = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await member.newPage();
  await mp.goto(`${BASE}/join/${joinCode}`);
  await mp.fill("#displayName", "สมชาย E2E");
  await mp.click("button[type=submit]");
  await mp.waitForURL(new RegExp(`/trip/${tripId}$`), { timeout: 15000 });
  await mp.waitForSelector("text=aboard as");
  console.log("✓ member joined and sees the route line");

  /* —— Availability: tap three days and save —— */
  await mp.goto(`${BASE}/trip/${tripId}/availability`);
  for (const day of ["2026-09-04", "2026-09-05", "2026-09-06"]) {
    await mp.click(`[data-date="${day}"]`);
  }
  await mp.click("text=Save my free days");
  await mp.waitForSelector("text=Saved ✓", { timeout: 15000 });
  console.log("✓ availability saved");

  /* —— Budget —— */
  await mp.goto(`${BASE}/trip/${tripId}/budget`);
  await mp.fill("#amount", "4500");
  await mp.click("button[type=submit]");
  await mp.waitForSelector("text=1 of 1 budgets in", { timeout: 15000 });
  console.log("✓ budget saved; group sees counts only");

  /* —— Votes —— */
  await mp.goto(`${BASE}/trip/${tripId}/votes`);
  await mp.click('button[role=radio]:has-text("Northern Thailand")');
  await mp.waitForSelector("text=leaning", { timeout: 15000 });
  await mp.click('button[role=radio]:has-text("Beach")');
  await mp.waitForTimeout(800);
  console.log("✓ votes cast");

  /* —— Results: stubs render, no amounts leak —— */
  await mp.goto(`${BASE}/trip/${tripId}/results`);
  await mp.waitForSelector("text=Best dates");
  await mp.waitForSelector("text=4–6 Sep");
  const memberHtml = await mp.content();
  assert(!memberHtml.includes("4,500"), "member results page must not contain the amount");
  console.log("✓ results show the best window as a ticket stub, no amounts leaked");

  /* —— Owner sees the amount; anonymous does not —— */
  await op.goto(`${BASE}/trip/${tripId}`);
  await op.waitForSelector("text=฿4,500");
  console.log("✓ owner dashboard shows the individual amount");

  const anon = await browser.newContext();
  const ap = await anon.newPage();
  await ap.goto(`${BASE}/trip/${tripId}`);
  const anonHtml = await ap.content();
  assert(anonHtml.includes("not in this trip"), "anonymous visitor is locked out");
  assert(!anonHtml.includes("4,500"), "anonymous page must not contain amounts");
  console.log("✓ anonymous visitor sees nothing private");

  await browser.close();
  console.log("\nE2E smoke: ALL PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
