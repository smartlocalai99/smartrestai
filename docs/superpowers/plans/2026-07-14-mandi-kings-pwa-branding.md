# Mandi Kings PWA Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the installed PWA use the Mandi Kings name, existing logo splash artwork, and `#32120d` behind iPhone status icons.

**Architecture:** Keep the existing icon and splash assets unchanged. Update the manifest, Apple metadata, status-bar mode, splash fallback link, and service-worker cache as one PWA metadata change protected by a focused source-and-asset regression test.

**Tech Stack:** Next.js 16.2.10 Pages Router, Web App Manifest, Apple PWA metadata, service worker, Node test runner, ESLint.

## Global Constraints

- Installed app name and short name must be exactly `Mandi Kings`.
- PWA theme and background color must remain exactly `#32120d`.
- Existing page titles ending in `SmartRest` must remain unchanged.
- Existing logo, icons, and eight device-specific splash images must be reused without regeneration.
- Push `main` to `origin` only after tests, lint, and production build pass.

---

### Task 1: Update and deliver Mandi Kings PWA metadata

**Files:**
- Create: `tests/pwa-branding.test.mjs`
- Modify: `public/manifest.webmanifest`
- Modify: `pages/_document.js`
- Modify: `public/sw.js`

**Interfaces:**
- Consumes: existing `/apple-touch-icon.png`, PWA icons, and `/splash/iphone-*.png` assets.
- Produces: install metadata named `Mandi Kings`, a generic iOS splash fallback, `black-translucent` status-bar mode, and service-worker cache `smartrest-v4`.

- [ ] **Step 1: Write the failing PWA branding regression test**

Create `tests/pwa-branding.test.mjs`:

```js
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
  assert.match(source, /const CACHE_NAME = "smartrest-v4"/);
  assert.match(source, /"\/splash\/iphone-1290x2796\.png"/);
});
```

- [ ] **Step 2: Run the new test and confirm the intended failure**

Run: `node --test tests/pwa-branding.test.mjs`

Expected: FAIL because the manifest and Apple metadata still use `SmartRest`, the status style is `black`, the fallback link is missing, and the cache is `smartrest-v3`.

- [ ] **Step 3: Update the manifest identity**

Apply this exact manifest change:

```diff
-  "name": "SmartRest AI",
-  "short_name": "SmartRest",
-  "description": "Order fresh mandi, tandoori, rotis, and desserts from SmartRest.",
+  "name": "Mandi Kings",
+  "short_name": "Mandi Kings",
+  "description": "Order fresh mandi, tandoori, rotis, and desserts from Mandi Kings.",
```

- [ ] **Step 4: Update Apple install, status-bar, and splash metadata**

Apply these exact changes in `pages/_document.js`:

```diff
-        <meta name="application-name" content="SmartRest" />
+        <meta name="application-name" content="Mandi Kings" />
@@
-        <meta name="apple-mobile-web-app-title" content="SmartRest" />
-        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
+        <meta name="apple-mobile-web-app-title" content="Mandi Kings" />
+        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
@@
         {/* iOS splash screens (shown while the installed PWA is launching) */}
+        <link
+          rel="apple-touch-startup-image"
+          href="/splash/iphone-1290x2796.png"
+        />
```

- [ ] **Step 5: Refresh the service-worker cache and include the splash fallback**

Apply these exact changes in `public/sw.js`:

```diff
-const CACHE_NAME = "smartrest-v3";
+const CACHE_NAME = "smartrest-v4";
@@
-  "/apple-touch-icon.png"
+  "/apple-touch-icon.png",
+  "/splash/iphone-1290x2796.png"
```

- [ ] **Step 6: Run focused and project verification**

Run: `node --test tests/*.test.mjs`

Expected: all Node tests pass.

Run: `npx eslint pages/_document.js tests/pwa-branding.test.mjs`

Expected: exit code 0 with no lint errors.

Run: `npm run build`

Expected: Next.js production build succeeds and includes all customer routes.

- [ ] **Step 7: Inspect final metadata and asset references**

Run:

```bash
node --input-type=module -e 'import { readFile } from "node:fs/promises"; const m=JSON.parse(await readFile("public/manifest.webmanifest", "utf8")); console.log(m.name, m.short_name, m.theme_color)'
rg -n "Mandi Kings|black-translucent|apple-touch-startup-image" pages/_document.js public/manifest.webmanifest
git diff --check
git status --short
```

Expected: output shows `Mandi Kings Mandi Kings #32120d`, the Apple metadata and nine startup-image links are present, and only planned files are pending.

- [ ] **Step 8: Commit and push the verified implementation**

Run:

```bash
git add pages/_document.js public/manifest.webmanifest public/sw.js tests/pwa-branding.test.mjs docs/superpowers/plans/2026-07-14-mandi-kings-pwa-branding.md
git commit -m "feat: brand installed PWA as Mandi Kings"
git push origin main
git status --short
```

Expected: push updates `origin/main`, and the final status is clean.
