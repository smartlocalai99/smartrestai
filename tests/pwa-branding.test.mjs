import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("uses Mandi Kings as the installed app identity", async () => {
  const manifest = JSON.parse(await readSource("public/manifest.webmanifest"));
  const documentSource = await readSource("pages/_document.js");

  assert.equal(manifest.name, "Mandi Kings");
  assert.equal(manifest.short_name, "Mandi Kings");
  assert.match(manifest.description, /Mandi Kings/);
  assert.equal(manifest.background_color, "#32120d");
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

test("provides logo splash artwork for matching and fallback iPhones", async () => {
  const documentSource = await readSource("pages/_document.js");
  assert.match(
    documentSource,
    /<link\s+rel="apple-touch-startup-image"\s+href="\/splash\/iphone-1290x2796\.png"\s+\/>/
  );

  const splashPaths = [
    ...documentSource.matchAll(/href="(\/splash\/iphone-[^"]+\.png)"/g),
  ].map((match) => match[1]);
  assert.equal(splashPaths.length, 9);
  assert.equal(new Set(splashPaths).size, 8);

  await Promise.all(
    [...new Set(splashPaths)].map(async (path) => {
      const info = await stat(new URL(`../public${path}`, import.meta.url));
      assert.ok(info.size > 0, `${path} must not be empty`);
    })
  );
});

test("refreshes cached PWA branding assets", async () => {
  const source = await readSource("public/sw.js");
  assert.match(source, /const CACHE_NAME = "smartrest-v5"/);
  assert.match(source, /"\/splash\/iphone-1290x2796\.png"/);
});
