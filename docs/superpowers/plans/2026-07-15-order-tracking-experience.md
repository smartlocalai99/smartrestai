# Order Tracking Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reference-matched Orders page that highlights the newest real customer order on a free OpenFreeMap map and lists all older orders below.

**Architecture:** Keep `/orders` as the loading/error/empty-state coordinator. Move deterministic order formatting and map geometry into testable ESM helpers, render the delivery and history UI in a focused customer component, and isolate browser-only MapLibre setup in its own component so server rendering stays safe.

**Tech Stack:** Next.js 16 Pages Router, React 19, Tailwind CSS 4, MapLibre GL JS with OpenFreeMap, Vitest, Testing Library, jsdom.

## Global Constraints

- Require no paid map service, API key, billing account, or secret.
- Use `Ravi Kumar` and `Your delivery partner` as temporary rider copy.
- Use the newest stored order as active and show all remaining orders under `Previous Orders`, newest first.
- Use real `order.items`, `order.deliveryAddress`, `order.status`, `order.placedAt`, and `order.total`; do not add demo order data.
- Treat the red route as visual tracking only; do not label it live navigation or traffic-aware routing.
- Keep loading, retry, authentication, and empty-order behavior.
- Do not add database migrations, geocoding, live rider tracking, working chat/calling, reorder, or order-detail actions.
- Before editing Next.js files, follow the checked-in guides under `node_modules/next/dist/docs/02-pages/` for CSS and client-only library loading.

## File Structure

- `lib/orderView.mjs`: Pure order sorting, status/date/money formatting, fallback selection, and item-row view models.
- `lib/orderTrackingMap.mjs`: Fixed restaurant coordinates, visual customer endpoint, route GeoJSON, and MapLibre options.
- `components/customer/OrderTrackingMap.js`: Client-only MapLibre lifecycle, markers, route layers, endpoint labels, and provider-failure fallback.
- `components/customer/OrderTrackingExperience.js`: Active delivery sheet and previous-order cards.
- `pages/orders.js`: Authenticated data-state coordinator that passes orders and the account phone to the experience.
- `pages/_app.js`: Global MapLibre stylesheet import, as required by the Pages Router.
- `test/orderView.test.mjs`: Unit coverage for order derivation.
- `test/orderTrackingMap.test.mjs`: Unit coverage for free-map configuration and visual route geometry.
- `test/OrderTrackingExperience.test.jsx`: Rendered behavior coverage for real active/history order content.
- `test/setup.js` and `vitest.config.mjs`: DOM test environment and `@/` alias.
- `package.json` and `package-lock.json`: Test commands and pinned dependencies.

---

### Task 1: Order view-model derivation

**Files:**
- Create: `lib/orderView.mjs`
- Create: `test/orderView.test.mjs`
- Create: `test/setup.js`
- Create: `vitest.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: persisted order objects from `OrdersContext` and optional authenticated account phone.
- Produces: `splitOrders(orders)`, `createOrderView(order, accountPhone)`, `formatOrderDate(value)`, and `formatRupees(value)`.

- [ ] **Step 1: Install the focused test toolchain and add test scripts**

Run:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom
```

Add these scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.mjs`:

```js
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
  },
});
```

Create `test/setup.js`:

```js
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write failing order-derivation tests**

Create `test/orderView.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import { createOrderView, splitOrders } from "../lib/orderView.mjs";

const order = (overrides = {}) => ({
  id: "ORDER1",
  status: "out_for_delivery",
  placedAt: "2026-07-15T12:30:00.000Z",
  totalItems: 2,
  total: 560,
  deliveryAddress: { line: "Ganagapeta, Kadapa", phone: "9876543210" },
  items: [
    {
      quantity: 2,
      sectionTitle: "Mandi",
      item: { id: 7, title: "Chicken Mandi", price: 260 },
    },
  ],
  ...overrides,
});

describe("splitOrders", () => {
  it("selects the newest order and keeps older orders newest first", () => {
    const older = order({ id: "OLD", placedAt: "2026-07-13T12:30:00.000Z" });
    const newest = order({ id: "NEW", placedAt: "2026-07-15T12:30:00.000Z" });
    const middle = order({ id: "MID", placedAt: "2026-07-14T12:30:00.000Z" });

    expect(splitOrders([older, newest, middle])).toEqual({
      activeOrder: newest,
      previousOrders: [middle, older],
    });
  });

  it("returns an empty active state for malformed input", () => {
    expect(splitOrders(null)).toEqual({ activeOrder: null, previousOrders: [] });
  });
});

describe("createOrderView", () => {
  it("uses real order values and calculates item line totals", () => {
    expect(createOrderView(order(), "9000000000")).toMatchObject({
      id: "ORDER1",
      statusLabel: "Out for delivery",
      address: "Ganagapeta, Kadapa",
      contact: "9876543210",
      total: 560,
      itemRows: [
        expect.objectContaining({ quantity: 2, title: "Chicken Mandi", lineTotal: 520 }),
      ],
    });
  });

  it("falls back safely when address, contact, status, and items are missing", () => {
    expect(
      createOrderView(
        order({ status: "kitchen_checked", deliveryAddress: null, items: null }),
        "9000000000"
      )
    ).toMatchObject({
      statusLabel: "Kitchen checked",
      address: "Delivery address unavailable",
      contact: "9000000000",
      itemRows: [],
    });
  });
});
```

- [ ] **Step 3: Run the tests and verify RED**

Run:

```bash
npm test -- test/orderView.test.mjs
```

Expected: FAIL because `lib/orderView.mjs` does not exist.

- [ ] **Step 4: Implement the minimal pure view helpers**

Create `lib/orderView.mjs`:

```js
const titleCaseStatus = (value) =>
  String(value || "preparing")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const finiteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export function formatRupees(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    finiteNumber(value)
  );
}

export function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function splitOrders(orders) {
  const sorted = Array.isArray(orders)
    ? [...orders].sort(
        (left, right) => new Date(right?.placedAt || 0) - new Date(left?.placedAt || 0)
      )
    : [];
  return { activeOrder: sorted[0] ?? null, previousOrders: sorted.slice(1) };
}

export function createOrderView(order = {}, accountPhone = "") {
  const itemRows = (Array.isArray(order.items) ? order.items : []).map((entry, index) => {
    const quantity = Math.max(0, finiteNumber(entry?.quantity));
    const unitPrice = finiteNumber(entry?.item?.price);
    return {
      key: entry?.item?.id ?? `${order.id || "order"}-${index}`,
      item: entry?.item ?? {},
      sectionTitle: entry?.sectionTitle ?? "",
      quantity,
      title: entry?.item?.title || "Item unavailable",
      unitPrice,
      lineTotal: quantity * unitPrice,
    };
  });
  const deliveryAddress = order.deliveryAddress || {};
  return {
    id: order.id || "Order",
    statusLabel: titleCaseStatus(order.status),
    placedAtLabel: formatOrderDate(order.placedAt),
    address: String(deliveryAddress.line || "").trim() || "Delivery address unavailable",
    contact:
      String(deliveryAddress.phone || "").trim() ||
      String(accountPhone || "").trim() ||
      "Contact unavailable",
    totalItems: finiteNumber(order.totalItems),
    total: finiteNumber(order.total),
    itemRows,
  };
}
```

- [ ] **Step 5: Run GREEN and commit**

Run:

```bash
npm test -- test/orderView.test.mjs
git add package.json package-lock.json vitest.config.mjs test/setup.js test/orderView.test.mjs lib/orderView.mjs
git commit -m "test: add order tracking view models"
```

Expected: all `orderView` tests PASS and the commit succeeds.

---

### Task 2: Free map configuration and client map

**Files:**
- Create: `lib/orderTrackingMap.mjs`
- Create: `test/orderTrackingMap.test.mjs`
- Create: `components/customer/OrderTrackingMap.js`
- Modify: `pages/_app.js`
- Modify: `styles/globals.css`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `destinationLabel: string`.
- Produces: `RESTAURANT`, `CUSTOMER_POINT`, `createVisualRoute()`, `createMapOptions(container)`, and `<OrderTrackingMap destinationLabel="..." />`.

- [ ] **Step 1: Install MapLibre**

Run:

```bash
npm install maplibre-gl
```

Expected: `maplibre-gl` appears under dependencies and the lockfile changes.

- [ ] **Step 2: Write failing map-contract tests**

Create `test/orderTrackingMap.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import {
  CUSTOMER_POINT,
  RESTAURANT,
  createMapOptions,
  createVisualRoute,
} from "../lib/orderTrackingMap.mjs";

describe("order tracking map", () => {
  it("uses the keyless OpenFreeMap style and Kadapa restaurant origin", () => {
    expect(createMapOptions("map-node")).toMatchObject({
      container: "map-node",
      style: "https://tiles.openfreemap.org/styles/positron",
      center: RESTAURANT.coordinates,
    });
    expect(RESTAURANT).toMatchObject({
      name: "MANDI KING",
      coordinates: [78.82171, 14.47924],
    });
  });

  it("creates a visual line from restaurant to the display-only customer point", () => {
    const route = createVisualRoute();
    expect(route.geometry.coordinates[0]).toEqual(RESTAURANT.coordinates);
    expect(route.geometry.coordinates.at(-1)).toEqual(CUSTOMER_POINT);
  });
});
```

- [ ] **Step 3: Run the map tests and verify RED**

Run:

```bash
npm test -- test/orderTrackingMap.test.mjs
```

Expected: FAIL because `lib/orderTrackingMap.mjs` does not exist.

- [ ] **Step 4: Implement map constants and geometry**

Create `lib/orderTrackingMap.mjs`:

```js
export const RESTAURANT = {
  name: "MANDI KING",
  address:
    "Door No 1, Trunk Rd, near SBI Bank, beside 2nd Gandhi Statue, Ganagapeta, Kadapa, Andhra Pradesh 516001",
  coordinates: [78.82171, 14.47924],
};

export const CUSTOMER_POINT = [78.8271, 14.4835];

export function createVisualRoute() {
  const [startLng, startLat] = RESTAURANT.coordinates;
  const [endLng, endLat] = CUSTOMER_POINT;
  return {
    type: "Feature",
    properties: { kind: "visual-tracking-path" },
    geometry: {
      type: "LineString",
      coordinates: [
        [startLng, startLat],
        [startLng + 0.0014, startLat + 0.002],
        [endLng - 0.0012, endLat - 0.0008],
        [endLng, endLat],
      ],
    },
  };
}

export function createMapOptions(container) {
  return {
    container,
    style: "https://tiles.openfreemap.org/styles/positron",
    center: RESTAURANT.coordinates,
    zoom: 14.4,
    attributionControl: true,
    interactive: true,
  };
}
```

- [ ] **Step 5: Run map-helper GREEN**

Run:

```bash
npm test -- test/orderTrackingMap.test.mjs
```

Expected: both tests PASS.

- [ ] **Step 6: Build the client-only map lifecycle**

Create `components/customer/OrderTrackingMap.js` with this behavior:

```js
import { useEffect, useRef, useState } from "react";
import {
  CUSTOMER_POINT,
  RESTAURANT,
  createMapOptions,
  createVisualRoute,
} from "@/lib/orderTrackingMap.mjs";

function markerElement(className, label) {
  const marker = document.createElement("div");
  marker.className = className;
  marker.setAttribute("aria-label", label);
  return marker;
}

export default function OrderTrackingMap({ destinationLabel }) {
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    let active = true;
    let map;

    import("maplibre-gl")
      .then(({ default: maplibregl }) => {
        if (!active || !containerRef.current) return;
        map = new maplibregl.Map(createMapOptions(containerRef.current));
        map.on("error", () => active && setFailed(true));
        map.on("load", () => {
          if (!active) return;
          map.addSource("delivery-route", { type: "geojson", data: createVisualRoute() });
          map.addLayer({
            id: "delivery-route-outline",
            type: "line",
            source: "delivery-route",
            paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.85 },
          });
          map.addLayer({
            id: "delivery-route",
            type: "line",
            source: "delivery-route",
            paint: { "line-color": "#b63b2d", "line-width": 5 },
          });
          new maplibregl.Marker({
            element: markerElement("order-map-marker order-map-marker--restaurant", RESTAURANT.name),
          })
            .setLngLat(RESTAURANT.coordinates)
            .addTo(map);
          new maplibregl.Marker({
            element: markerElement("order-map-marker order-map-marker--customer", "Customer address"),
          })
            .setLngLat(CUSTOMER_POINT)
            .addTo(map);
        });
      })
      .catch(() => active && setFailed(true));

    return () => {
      active = false;
      map?.remove();
    };
  }, []);

  return (
    <div
      className={`relative h-[290px] overflow-hidden bg-[#ebe7e2] ${failed ? "order-map-fallback" : ""}`}
      aria-label={`Delivery map from ${RESTAURANT.name} to ${destinationLabel}`}
    >
      <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between gap-3 text-[10px] font-black">
        <span className="max-w-[46%] rounded-full bg-white/95 px-3 py-2 shadow">MANDI KING</span>
        <span className="max-w-[46%] truncate rounded-full bg-white/95 px-3 py-2 shadow">{destinationLabel}</span>
      </div>
      <span className="sr-only">Visual route only. Live rider tracking is not available.</span>
    </div>
  );
}
```

Add the MapLibre stylesheet immediately after the existing global CSS import in `pages/_app.js`:

```js
import "maplibre-gl/dist/maplibre-gl.css";
```

Add marker and fallback styles to `styles/globals.css`:

```css
.order-map-marker {
  width: 22px;
  height: 22px;
  border: 4px solid white;
  border-radius: 9999px;
  box-shadow: 0 5px 14px rgb(56 22 14 / 24%);
}

.order-map-marker--restaurant { background: #128647; }
.order-map-marker--customer { background: #b63b2d; }
.order-map-fallback {
  background-image:
    linear-gradient(120deg, transparent 44%, #b63b2d 45%, #b63b2d 47%, transparent 48%),
    repeating-linear-gradient(0deg, #ece8e3 0 22px, #f7f4f1 22px 25px);
}
```

- [ ] **Step 7: Lint, build, and commit the map unit**

Run:

```bash
npx eslint components/customer/OrderTrackingMap.js lib/orderTrackingMap.mjs pages/_app.js
npm run build
git add package.json package-lock.json pages/_app.js styles/globals.css lib/orderTrackingMap.mjs test/orderTrackingMap.test.mjs components/customer/OrderTrackingMap.js
git commit -m "feat: add free order tracking map"
```

Expected: ESLint and build succeed, then the map commit succeeds.

---

### Task 3: Active delivery and previous-order UI

**Files:**
- Create: `components/customer/OrderTrackingExperience.js`
- Create: `test/OrderTrackingExperience.test.jsx`

**Interfaces:**
- Consumes: `orders: Order[]` and `accountPhone?: string`.
- Produces: `<OrderTrackingExperience orders={orders} accountPhone={phone} />`.
- Uses: `splitOrders`, `createOrderView`, `formatRupees`, `imageForItem`, and `OrderTrackingMap`.

- [ ] **Step 1: Write a failing rendered-behavior test**

Create `test/OrderTrackingExperience.test.jsx`:

```jsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OrderTrackingExperience from "@/components/customer/OrderTrackingExperience";

vi.mock("next/image", () => ({ default: (props) => <img {...props} /> }));
vi.mock("@/components/customer/OrderTrackingMap", () => ({
  default: ({ destinationLabel }) => <div aria-label={`map to ${destinationLabel}`} />,
}));

const makeOrder = (id, placedAt, title, address) => ({
  id,
  placedAt,
  status: "preparing",
  totalItems: 2,
  total: 560,
  deliveryAddress: { line: address, phone: "9876543210" },
  items: [
    { quantity: 2, sectionTitle: "Mandi", item: { id, title, price: 260 } },
  ],
});

describe("OrderTrackingExperience", () => {
  it("renders newest order details and older orders separately", () => {
    render(
      <OrderTrackingExperience
        accountPhone="9000000000"
        orders={[
          makeOrder("OLD", "2026-07-14T10:00:00.000Z", "Old Mandi", "Old address"),
          makeOrder("NEW", "2026-07-15T10:00:00.000Z", "Chicken Mandi", "Customer home"),
        ]}
      />
    );

    expect(screen.getByText("Ravi Kumar")).toBeInTheDocument();
    expect(screen.getByLabelText("map to Customer home")).toBeInTheDocument();
    expect(screen.getByText("2 Chicken Mandi")).toBeInTheDocument();
    expect(screen.getByText("₹520")).toBeInTheDocument();
    const history = screen.getByRole("region", { name: "Previous Orders" });
    expect(within(history).getByText("Old Mandi")).toBeInTheDocument();
    expect(within(history).queryByText("Chicken Mandi")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the component test and verify RED**

Run:

```bash
npm test -- test/OrderTrackingExperience.test.jsx
```

Expected: FAIL because `OrderTrackingExperience` does not exist.

- [ ] **Step 3: Implement the reference-matched order experience**

Create `components/customer/OrderTrackingExperience.js`. It must:

```jsx
import Image from "next/image";
import { IoBicycleOutline, IoLocationSharp, IoTimeOutline } from "react-icons/io5";
import OrderTrackingMap from "@/components/customer/OrderTrackingMap";
import { imageForItem } from "@/components/customer/ShopByCategories";
import {
  createOrderView,
  formatRupees,
  splitOrders,
} from "@/lib/orderView.mjs";

const RIDER = { name: "Ravi Kumar", role: "Your delivery partner" };

function PreviousOrderCard({ order, accountPhone }) {
  const view = createOrderView(order, accountPhone);
  return (
    <article className="rounded-[22px] border border-[#f0e9e0] bg-white p-4 shadow-[0_10px_24px_rgba(43,17,12,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#fff4de] px-2.5 py-1 text-[11px] font-black text-[#a56a10]">{view.statusLabel}</span>
        <time className="text-[11px] font-bold text-[#8b8580]">{view.placedAtLabel}</time>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex -space-x-3">
          {view.itemRows.slice(0, 3).map((row) => (
            <span key={row.key} className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-[#f4eee9]">
              <Image src={imageForItem(row.item, row.sectionTitle)} alt="" fill sizes="44px" className="object-cover" />
            </span>
          ))}
        </div>
        <p className="min-w-0 flex-1 text-[13px] font-bold text-[#5f554c]">{view.itemRows.map((row) => row.title).join(", ") || "Order items unavailable"}</p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#f4eee9] pt-3">
        <span className="text-[12px] font-semibold text-[#7d7169]">{view.totalItems} item{view.totalItems === 1 ? "" : "s"}</span>
        <span className="text-[15px] font-black text-[#241610]">₹{formatRupees(view.total)}</span>
      </div>
    </article>
  );
}

export default function OrderTrackingExperience({ orders, accountPhone = "" }) {
  const { activeOrder, previousOrders } = splitOrders(orders);
  if (!activeOrder) return null;
  const active = createOrderView(activeOrder, accountPhone);

  return (
    <div className="px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-2">
      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_45px_rgba(43,17,12,0.12)]">
        <OrderTrackingMap destinationLabel={active.address} />
        <div className="relative -mt-8 rounded-t-[30px] bg-white px-5 pb-5 pt-5">
          <div className="flex items-center gap-3 border-b border-[#eee8e2] pb-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f7eee8] text-[#b3402a]"><IoBicycleOutline className="h-6 w-6" /></span>
            <div className="min-w-0 flex-1"><p className="text-[16px] font-black text-[#241610]">{RIDER.name}</p><p className="text-[12px] font-semibold text-[#8b8580]">{RIDER.role}</p></div>
            <span className="text-[11px] font-bold text-[#8b8580]">{active.contact}</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#eee8e2] py-4">
            <div className="flex gap-2"><IoLocationSharp className="mt-0.5 h-5 w-5 shrink-0 text-[#b63b2d]" /><div><p className="text-[11px] font-bold text-[#a99a8c]">Delivery Address</p><p className="mt-1 text-[13px] font-black leading-5 text-[#241610]">{active.address}</p></div></div>
            <div className="flex gap-2"><IoTimeOutline className="mt-0.5 h-5 w-5 text-[#b63b2d]" /><div><p className="text-[11px] font-bold text-[#a99a8c]">Estimate Time</p><p className="mt-1 whitespace-nowrap text-[13px] font-black text-[#241610]">30–40 min</p></div></div>
          </div>
          <div className="pt-4"><div className="flex items-center justify-between"><h2 className="text-[18px] font-black text-[#241610]">Order Details</h2><span className="rounded-full bg-[#fff4de] px-2.5 py-1 text-[10px] font-black text-[#a56a10]">{active.statusLabel}</span></div>
            <div className="mt-3 space-y-2">{active.itemRows.map((row) => <div key={row.key} className="flex items-start justify-between gap-4 text-[13px]"><span className="font-semibold text-[#5f554c]">{row.quantity} {row.title}</span><span className="shrink-0 font-bold text-[#5f554c]">₹{formatRupees(row.lineTotal)}</span></div>)}{active.itemRows.length === 0 ? <p className="text-[13px] font-semibold text-[#8b8580]">Order items unavailable</p> : null}</div>
            <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#ddd4cc] pt-3 text-[15px] font-black text-[#241610]"><span>Total Amount</span><span>₹{formatRupees(active.total)}</span></div>
          </div>
        </div>
      </section>
      {previousOrders.length > 0 ? <section aria-label="Previous Orders" className="mt-7"><h2 className="mb-3 text-[18px] font-black text-[#241610]">Previous Orders</h2><div className="space-y-3">{previousOrders.map((order) => <PreviousOrderCard key={order.id} order={order} accountPhone={accountPhone} />)}</div></section> : null}
    </div>
  );
}
```

Formatting may be expanded across lines, but copy, data bindings, semantic regions, and visual hierarchy must remain as specified.

- [ ] **Step 4: Run component GREEN, lint, and commit**

Run:

```bash
npm test -- test/OrderTrackingExperience.test.jsx
npx eslint components/customer/OrderTrackingExperience.js test/OrderTrackingExperience.test.jsx
git add components/customer/OrderTrackingExperience.js test/OrderTrackingExperience.test.jsx
git commit -m "feat: add active and previous order experience"
```

Expected: component test and ESLint PASS, then the commit succeeds.

---

### Task 4: Orders route integration and end-to-end verification

**Files:**
- Modify: `pages/orders.js`

**Interfaces:**
- Consumes: `orders`, `isLoadingOrders`, `ordersError`, `refreshOrders` from `useOrders()` and `user.phone` from `useAuth()`.
- Produces: the finished authenticated `/orders` route.

- [ ] **Step 1: Record the pre-change browser failure**

Start the app and inspect `/orders` at a mobile viewport with at least two test orders available.

```bash
npm run dev
```

Expected before integration: the page contains the old repeated order cards and does not contain `Ravi Kumar`, a delivery map, or the `Previous Orders` region. This is the failing acceptance check.

- [ ] **Step 2: Replace the old card mapping with the experience component**

Update imports in `pages/orders.js` to remove `next/image` and `imageForItem`, then add:

```js
import OrderTrackingExperience from "@/components/customer/OrderTrackingExperience";
import { useAuth } from "@/context/AuthContext";
```

Delete the local `formatDate` and `OrderCard` implementations. Inside `Orders`, read the user:

```js
const { user } = useAuth();
```

Keep the existing `PageHead`, `AppShell`, `TabPageHeader`, error, loading, and empty states. Replace only the non-empty order list with:

```jsx
<OrderTrackingExperience orders={orders} accountPhone={user?.phone} />
```

- [ ] **Step 3: Run all automated verification**

Run:

```bash
npm test
npx eslint pages/orders.js components/customer/OrderTrackingExperience.js components/customer/OrderTrackingMap.js lib/orderView.mjs lib/orderTrackingMap.mjs test/orderView.test.mjs test/orderTrackingMap.test.mjs test/OrderTrackingExperience.test.jsx
npm run build
git diff --check
```

Expected: all tests pass, ESLint reports no errors, the production build succeeds, and `git diff --check` has no output.

- [ ] **Step 4: Verify the finished UI in the in-app browser**

At approximately `390 × 844`, verify:

- The newest order is the only active delivery.
- The map loads from OpenFreeMap without requesting an application API key.
- The map shows a red visual path, restaurant/customer markers, and the visual-route-only text alternative.
- `Ravi Kumar`, the stored delivery address/contact, `30–40 min`, actual ordered items, calculated line totals, stored total, and status are visible.
- The sheet overlaps the map and matches the supplied rounded reference silhouette.
- Older orders appear only inside `Previous Orders`.
- Long addresses wrap and the page has no horizontal overflow.
- The content clears the fixed bottom navigation.

At approximately `430 × 932`, repeat the overflow and spacing check. Simulate a blocked map request or offline map load and confirm order details remain visible over the fallback surface.

- [ ] **Step 5: Commit the route integration**

Run:

```bash
git add pages/orders.js
git commit -m "feat: redesign customer orders tracking"
git status --short
```

Expected: the commit succeeds and the worktree is clean.
