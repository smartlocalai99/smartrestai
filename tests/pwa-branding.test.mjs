import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("uses Mandi Kings as the installed app identity", async () => {
  const manifest = JSON.parse(await readSource("public/manifest.webmanifest"));
  const documentSource = await readSource("pages/_document.js");

  assert.equal(manifest.name, "Mandi Kings");
  assert.equal(manifest.short_name, "Mandi Kings");
  assert.match(manifest.description, /Mandi Kings/);
  assert.equal(manifest.background_color, "#ffffff");
  assert.equal(manifest.theme_color, "#32120d");
  assert.match(documentSource, /name="application-name" content="Mandi Kings"/);
  assert.match(documentSource, /name="apple-mobile-web-app-title" content="Mandi Kings"/);
  // "black-translucent" lets the page's own top background (the brand
  // colour) show through behind the status bar instead of an opaque bar.
  assert.match(
    documentSource,
    /name="apple-mobile-web-app-status-bar-style" content="black-translucent"/
  );
});

test("uses one centered login banner loader without a custom iOS startup layer", async () => {
  const [documentSource, brandedSplash, startupGate, globalStyles] = await Promise.all([
    readSource("pages/_document.js"),
    readSource("components/customer/BrandedSplash.jsx"),
    readSource("components/customer/StartupGate.jsx"),
    readSource("styles/globals.css"),
  ]);

  assert.doesNotMatch(documentSource, /apple-touch-startup-image/);
  assert.match(brandedSplash, /src="\/bannerlogin\.png"/);
  assert.doesNotMatch(brandedSplash, /src="\/applogo\.jpeg"/);
  assert.match(globalStyles, /\.startup-splash \{[\s\S]*?background: #fff;/);
  assert.match(globalStyles, /\.startup-splash__logo \{[\s\S]*?object-fit: contain;/);
  assert.match(startupGate, /phase !== "hidden"/);
});

test("refreshes cached PWA branding assets", async () => {
  const source = await readSource("public/sw.js");
  assert.match(source, /const CACHE_NAME = "smartrest-v8"/);
  assert.match(source, /"\/applogo\.jpeg"/);
  assert.match(source, /"\/bannerlogin\.png"/);
  assert.doesNotMatch(source, /"\/splash\/iphone-/);
});
