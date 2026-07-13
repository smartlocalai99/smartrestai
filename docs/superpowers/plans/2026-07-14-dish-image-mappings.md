# Dish Image Mappings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the supplied Paneer Butter Masala and Continental Mini Spl. Platter images on their existing customer-menu cards.

**Architecture:** Extend the component's existing image registry, then add dish-specific checks at the start of `imageForItem`. Exact checks run before the generic category fallbacks so unrelated dishes keep their current images.

**Tech Stack:** Next.js 16.2.10 Pages Router, React 19.2.4, JavaScript, `next/image`, ESLint 9.

## Global Constraints

- Use `/pannerbuttermasala.jpg` for both Paneer Butter Masala menu entries.
- Use `/minispecialplatter.webp` for Continental Mini Spl. Platter.
- Do not add duplicate dishes or change menu copy, prices, layout, or other image rules.
- Preserve all existing uncommitted changes in `components/customer/ShopByCategories.jsx`.
- Follow `node_modules/next/dist/docs/02-pages/01-getting-started/04-images.md` for the installed Next.js version.

---

### Task 1: Add exact dish image mappings

**Files:**
- Modify: `components/customer/ShopByCategories.jsx:18-35,248-266`
- Use existing assets: `public/pannerbuttermasala.jpg`, `public/minispecialplatter.webp`

**Interfaces:**
- Consumes: `imageForItem(item, sectionTitle = "")`, where `item.title` and `sectionTitle` are strings.
- Produces: `/pannerbuttermasala.jpg` for Paneer Butter Masala titles and `/minispecialplatter.webp` for Continental Mini Spl. Platter; existing return values remain unchanged for other inputs.

- [ ] **Step 1: Verify the mappings are initially absent**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs');
const source = fs.readFileSync('components/customer/ShopByCategories.jsx', 'utf8');
if (!source.includes('paneerButterMasala: "/pannerbuttermasala.jpg"')) throw new Error('Paneer image registry mapping is absent');
if (!source.includes('miniSpecialPlatter: "/minispecialplatter.webp"')) throw new Error('Mini platter image registry mapping is absent');
NODE
```

Expected: FAIL with `Paneer image registry mapping is absent`.

- [ ] **Step 2: Add the assets to the image registry**

Add these properties before the closing brace of `images`:

```js
  paneerButterMasala: "/pannerbuttermasala.jpg",
  miniSpecialPlatter: "/minispecialplatter.webp",
```

- [ ] **Step 3: Add exact rules before generic fallbacks**

Add these rules immediately after the `text` declaration in `imageForItem`:

```js
  if (/paneer butter masala/.test(text)) return images.paneerButterMasala;
  if (/continental mini spl\. platter/.test(text)) return images.miniSpecialPlatter;
```

This ordering ensures the mini curry meal and standalone paneer curry both use the paneer asset, while the platter rule wins before unrelated generic fallbacks.

- [ ] **Step 4: Verify both registry entries and selector rules are present**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs');
const source = fs.readFileSync('components/customer/ShopByCategories.jsx', 'utf8');
const required = [
  'paneerButterMasala: "/pannerbuttermasala.jpg"',
  'miniSpecialPlatter: "/minispecialplatter.webp"',
  'if (/paneer butter masala/.test(text)) return images.paneerButterMasala;',
  'if (/continental mini spl\\. platter/.test(text)) return images.miniSpecialPlatter;',
];
for (const fragment of required) {
  if (!source.includes(fragment)) throw new Error(`Missing mapping: ${fragment}`);
}
NODE
```

Expected: exit code 0 with no output.

- [ ] **Step 5: Run targeted lint**

Run:

```bash
npx eslint components/customer/ShopByCategories.jsx
```

Expected: exit code 0 with no errors.

- [ ] **Step 6: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js reports a successful production build and exits with code 0.

- [ ] **Step 7: Review the scoped diff without committing user work**

Run:

```bash
git diff -- components/customer/ShopByCategories.jsx
git status --short -- public/pannerbuttermasala.jpg public/minispecialplatter.webp
```

Expected: the component diff contains both new registry properties and both exact selector rules; both supplied assets remain present. Do not commit the component automatically because it already contains unrelated uncommitted user changes.
