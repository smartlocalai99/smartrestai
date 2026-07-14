# Floating Menu Navigator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating Zomato-style Menu button that opens every collapsible category with a count, navigates to and expands the selected section, and makes the normal footer solid white.

**Architecture:** Extract category-entry and collapse-state helpers into a pure ES module tested with Node's built-in test runner. Keep visual and interaction state inside `ShopByCategories.jsx`, using the existing menu data as the single source of category titles/counts, and simplify `BottomNav.js` to solid-white styling.

**Tech Stack:** Next.js 16.2.10 Pages Router, React 19.2.4, Tailwind CSS 4, React Icons 5, Node.js `node:test`, ESLint 9.

## Global Constraints

- Preserve all existing menu, image, cart, search, Veg mode, and user changes.
- Every existing category remains individually collapsible and initially open.
- The floating Menu panel lists Recommended and all menu categories with total item counts.
- Selecting a category closes the panel, expands the category, and smoothly scrolls it into view.
- The normal four-item footer becomes solid white; the green checkout footer remains unchanged.
- Do not stage or commit implementation files unless explicitly requested.

---

### Task 1: Add testable menu-navigation state helpers

**Files:**
- Create: `components/customer/menuNavigation.mjs`
- Create: `tests/menu-navigation.test.mjs`

**Interfaces:**
- Produces: `sectionId(title) => string`.
- Produces: `createMenuNavigatorEntries(recommendedItems, sections) => Array<{ title: string, count: number }>`.
- Produces: `createInitialOpenSections(entries) => Record<string, boolean>`.
- Produces: `expandSection(openSections, title) => Record<string, boolean>`.

- [ ] **Step 1: Write the failing helper tests**

Create `tests/menu-navigation.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  createInitialOpenSections,
  createMenuNavigatorEntries,
  expandSection,
  sectionId,
} from "../components/customer/menuNavigation.mjs";

const recommendedItems = [{ id: "one" }, { id: "two" }];
const sections = [
  { heading: "Chicken Mandi", items: [{}, {}, {}] },
  { heading: "Rotis", items: [{}, {}] },
];

test("creates one navigator row per collapsible category with counts", () => {
  assert.deepEqual(createMenuNavigatorEntries(recommendedItems, sections), [
    { title: "Recommended", count: 2 },
    { title: "Chicken Mandi", count: 3 },
    { title: "Rotis", count: 2 },
  ]);
});

test("starts every category open and expands a selected category immutably", () => {
  const entries = createMenuNavigatorEntries(recommendedItems, sections);
  const initial = createInitialOpenSections(entries);
  assert.deepEqual(initial, {
    Recommended: true,
    "Chicken Mandi": true,
    Rotis: true,
  });

  const collapsed = { ...initial, Rotis: false };
  const expanded = expandSection(collapsed, "Rotis");
  assert.equal(expanded.Rotis, true);
  assert.equal(collapsed.Rotis, false);
});

test("creates stable section ids", () => {
  assert.equal(sectionId("Extra & Add Ons"), "section-extra-add-ons");
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/menu-navigation.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `menuNavigation.mjs`.

- [ ] **Step 3: Implement the pure helper module**

Create `components/customer/menuNavigation.mjs`:

```js
export const sectionId = (heading) =>
  `section-${heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;

export const createMenuNavigatorEntries = (recommendedItems, sections) => [
  { title: "Recommended", count: recommendedItems.length },
  ...sections.map((section) => ({
    title: section.heading,
    count: section.items.length,
  })),
];

export const createInitialOpenSections = (entries) =>
  Object.fromEntries(entries.map((entry) => [entry.title, true]));

export const expandSection = (openSections, title) => ({
  ...openSections,
  [title]: true,
});
```

- [ ] **Step 4: Run the helper tests and verify GREEN**

Run: `node --test tests/menu-navigation.test.mjs`

Expected: PASS, 3 tests passed and 0 failed.

---

### Task 2: Add the floating Menu panel and controlled collapsible sections

**Files:**
- Modify: `components/customer/ShopByCategories.jsx:1-640`
- Test: `tests/menu-navigation.test.mjs`

**Interfaces:**
- Consumes: the helper functions from Task 1 and the existing `recommendedItems`/`menuSections` data.
- Produces: a fixed floating Menu button, category panel with counts, and controlled category expansion.

- [ ] **Step 1: Import helpers and make ordered categories a shared data source**

Import `createInitialOpenSections`, `createMenuNavigatorEntries`, `expandSection`, and `sectionId`. Move `orderedMenuSections` outside the component after `regularMenuSections`, then create:

```js
const menuNavigatorEntries = createMenuNavigatorEntries(
  recommendedItems,
  orderedMenuSections
);
```

Remove the old local `sectionId` function and the duplicate `orderedMenuSections` declaration inside the component.

- [ ] **Step 2: Convert CollapsibleSection to controlled state**

Replace its internal `useState` with props:

```jsx
function CollapsibleSection({
  title,
  children,
  isOpen,
  onToggle,
  titleSize = "text-[22px]",
}) {
  return (
    <section id={sectionId(title)} className="scroll-mt-[150px]">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={`mb-3 flex w-full items-center justify-between gap-3 text-left ${titleSize} font-semibold leading-tight text-[#202020]`}
      >
        <span>{title}</span>
        <LuChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      {isOpen ? children : null}
    </section>
  );
}
```

- [ ] **Step 3: Add the floating navigator component**

Import `LuX` from `react-icons/lu`, then add this focused component:

```jsx
function MenuNavigator({ entries, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const rightEdge = "max(1.25rem, calc((100vw - 430px) / 2 + 1.25rem))";

  const selectCategory = (title) => {
    setIsOpen(false);
    onSelect(title);
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close menu categories"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/25"
        />
      ) : null}

      {isOpen ? (
        <nav
          id="menu-category-navigator"
          aria-label="Menu categories"
          style={{ right: rightEdge }}
          className="fixed bottom-[calc(10.75rem+env(safe-area-inset-bottom))] z-50 max-h-[62vh] w-[min(320px,calc(100vw-2.5rem))] overflow-hidden rounded-[24px] border border-white/10 bg-[#232329] p-3 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-lg font-black">Menu</p>
            <button
              type="button"
              aria-label="Close menu categories"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
            >
              <LuX className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[calc(62vh-3.5rem)] overflow-y-auto">
            {entries.map((entry) => (
              <button
                type="button"
                key={entry.title}
                onClick={() => selectCategory(entry.title)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold active:bg-white/10"
              >
                <span>{entry.title}</span>
                <span className="text-white/60">{entry.count}</span>
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="menu-category-navigator"
        onClick={() => setIsOpen((current) => !current)}
        style={{ right: rightEdge }}
        className="fixed bottom-[calc(6.75rem+env(safe-area-inset-bottom))] z-50 inline-flex h-14 items-center gap-2 rounded-[20px] border border-white/15 bg-[#303039] px-5 text-lg font-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.3)]"
      >
        <LuUtensils className="h-6 w-6" />
        Menu
      </button>
    </>
  );
}
```

- [ ] **Step 4: Control section state and navigation in PopularChoices**

Initialize state and handlers:

```js
const [openSections, setOpenSections] = useState(() =>
  createInitialOpenSections(menuNavigatorEntries)
);

const toggleSection = (title) => {
  setOpenSections((current) => ({
    ...current,
    [title]: !current[title],
  }));
};

const navigateToSection = (title) => {
  setOpenSections((current) => expandSection(current, title));
  requestAnimationFrame(() => {
    document.getElementById(sectionId(title))?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
};
```

Pass `isOpen` and `onToggle` to Recommended and every regular `CollapsibleSection`, then render:

```jsx
<MenuNavigator entries={menuNavigatorEntries} onSelect={navigateToSection} />
```

- [ ] **Step 5: Run tests and targeted lint**

Run: `node --test tests/menu-navigation.test.mjs tests/menu-image-mappings.test.mjs`

Expected: PASS, 6 tests passed and 0 failed.

Run: `npx eslint components/customer/ShopByCategories.jsx components/customer/menuNavigation.mjs tests/menu-navigation.test.mjs`

Expected: exit code 0 with no errors.

---

### Task 3: Make the normal footer solid white

**Files:**
- Modify: `components/customer/BottomNav.js:52-75`
- Modify: `tests/menu-navigation.test.mjs`

**Interfaces:**
- Preserves: `BottomNav({ checkoutSummary })` and the green `CheckoutButton` branch.
- Changes: only the normal four-item navigation appearance.

- [ ] **Step 1: Add a failing footer-style regression test**

Append to `tests/menu-navigation.test.mjs`:

```js
import { readFile } from "node:fs/promises";

test("uses a solid white normal footer without glass overlays", async () => {
  const source = await readFile(
    new URL("../components/customer/BottomNav.js", import.meta.url),
    "utf8"
  );

  assert.match(source, /bg-white shadow/);
  assert.doesNotMatch(source, /backdrop-blur|bg-gradient-to-b/);
});
```

- [ ] **Step 2: Run the footer test and verify RED**

Run: `node --test tests/menu-navigation.test.mjs`

Expected: FAIL because the current footer uses `bg-white/[0.42]`, `backdrop-blur`, and a gradient overlay.

- [ ] **Step 3: Simplify the normal footer styling**

Use this normal-nav class and remove the three decorative overlay spans:

```jsx
className="absolute inset-x-4 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 grid grid-cols-4 overflow-hidden rounded-[30px] border border-[#ebe5e1] bg-white px-2 py-2 shadow-[0_16px_36px_rgba(33,23,18,0.16)]"
```

Keep the existing four navigation buttons unchanged.

- [ ] **Step 4: Run all focused tests and verify GREEN**

Run: `node --test tests/menu-navigation.test.mjs tests/menu-image-mappings.test.mjs`

Expected: PASS, 7 tests passed and 0 failed.

- [ ] **Step 5: Run final verification**

Run targeted ESLint on both changed components and both test/helper modules, run `npm run build`, verify the floating Menu panel and category navigation at mobile width, verify every category/count appears exactly once, and run `git diff --check`.
