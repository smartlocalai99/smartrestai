# Supabase Customer Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist customer profiles, delivery addresses, and order history in Supabase while retaining the temporary `1234` OTP and phone-number login identity.

**Architecture:** A shared browser client feeds a focused `lib/customerData.mjs` repository module. Existing React contexts keep their public role but load and mutate customer-scoped Supabase rows, while checkout awaits order persistence before clearing the cart. A checked-in SQL migration creates the schema and explicitly temporary development RLS policies.

**Tech Stack:** Next.js 16.2.10 Pages Router, React 19.2.4, JavaScript/JSX, `@supabase/supabase-js`, Node test runner, PostgreSQL/Supabase.

## Global Constraints

- Keep `1234` as the temporary four-digit OTP.
- Use a normalized ten-digit phone number as `customers.phone` primary key.
- Do not replace `pages/index.js` or add the sample `todos` UI.
- Do not add Supabase Auth, `proxy.js`, or session-refresh middleware.
- Keep cart, favorites, and payment selection as local UI state.
- Treat public-client RLS policies as development-only and document their replacement before production.
- Follow the repository's JavaScript conventions; do not introduce TypeScript.

---

### Task 1: Supabase dependency, environment, client, and schema

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create locally (ignored): `.env.local`
- Create: `.env.example`
- Create: `utils/supabase.js`
- Create: `supabase/migrations/202607140001_customer_data.sql`
- Test: `tests/supabase-setup.test.mjs`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Produces: `getSupabase()` returning the shared client; database tables `customers`, `customer_addresses`, and `customer_orders`.

- [ ] **Step 1: Write the failing setup test**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("declares the Supabase client and customer schema", async () => {
  const [pkg, example, client, migration] = await Promise.all([
    read("package.json"),
    read(".env.example"),
    read("utils/supabase.js"),
    read("supabase/migrations/202607140001_customer_data.sql"),
  ]);

  assert.match(pkg, /"@supabase\/supabase-js"/);
  assert.match(example, /NEXT_PUBLIC_SUPABASE_URL=/);
  assert.match(client, /export function getSupabase/);
  assert.match(migration, /create table if not exists public\.customers/);
  assert.match(migration, /phone text primary key/);
  assert.match(migration, /create table if not exists public\.customer_addresses/);
  assert.match(migration, /create table if not exists public\.customer_orders/);
  assert.match(migration, /Development-only public client access/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/supabase-setup.test.mjs`

Expected: FAIL because `.env.example`, the client helper, migration, and dependency do not exist.

- [ ] **Step 3: Install the client dependency and create local environment files**

Run: `npm install @supabase/supabase-js`

Write `.env.local` with the supplied project URL and publishable key. Write `.env.example` without secrets:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- [ ] **Step 4: Add the lazy shared client**

Create `utils/supabase.js`:

```js
import { createClient } from "@supabase/supabase-js";

let client;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not configured.");
  client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
```

- [ ] **Step 5: Add the SQL migration**

Create `supabase/migrations/202607140001_customer_data.sql` with the complete schema:

```sql
create extension if not exists pgcrypto;

create table if not exists public.customers (
  phone text primary key check (phone ~ '^[0-9]{10}$'),
  name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_phone text not null references public.customers(phone) on delete cascade,
  label text not null,
  address_line text not null,
  landmark text,
  contact_phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customer_addresses_one_default
  on public.customer_addresses(customer_phone) where is_default;
create index if not exists customer_addresses_phone_idx
  on public.customer_addresses(customer_phone);

create table if not exists public.customer_orders (
  id text primary key,
  customer_phone text not null references public.customers(phone) on delete restrict,
  items jsonb not null,
  total_items integer not null check (total_items > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  discount numeric(10,2) not null default 0 check (discount >= 0),
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'preparing',
  delivery_address jsonb not null,
  payment_method jsonb,
  placed_at timestamptz not null default now()
);

create index if not exists customer_orders_phone_placed_idx
  on public.customer_orders(customer_phone, placed_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();
drop trigger if exists customer_addresses_set_updated_at on public.customer_addresses;
create trigger customer_addresses_set_updated_at before update on public.customer_addresses
for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_orders enable row level security;

-- Development-only public client access. Replace when real OTP auth is enabled.
create policy "Development-only public client access" on public.customers
  for all to anon, authenticated using (true) with check (true);
create policy "Development-only public client access" on public.customer_addresses
  for all to anon, authenticated using (true) with check (true);
create policy "Development-only public client access" on public.customer_orders
  for all to anon, authenticated using (true) with check (true);
```

- [ ] **Step 6: Run the setup test**

Run: `node --test tests/supabase-setup.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit the setup**

```bash
git add package.json package-lock.json .env.example utils/supabase.js supabase/migrations/202607140001_customer_data.sql tests/supabase-setup.test.mjs
git commit -m "feat: add Supabase customer data foundation"
```

---

### Task 2: Customer data repository and model mapping

**Files:**
- Create: `lib/customerData.mjs`
- Test: `tests/customer-data.test.mjs`

**Interfaces:**
- Consumes: `getSupabase()` from `utils/supabase.js`.
- Produces: `normalizePhone`, `upsertCustomer`, `listAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `makeDefaultAddress`, `listOrders`, and `createOrder`.

- [ ] **Step 1: Write failing pure-model tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  addressFromRow,
  addressToRow,
  normalizePhone,
  orderFromRow,
  orderToRow,
} from "../lib/customerData.mjs";

test("normalizes Indian phone input to ten digits", () => {
  assert.equal(normalizePhone("+91 98765-43210"), "9876543210");
  assert.throws(() => normalizePhone("1234"), /ten-digit/);
});

test("maps address fields in both directions", () => {
  const app = { id: "a1", label: "Home", line: "Trunk Rd", landmark: "SBI", phone: "9876543210", isDefault: true };
  assert.deepEqual(addressFromRow(addressToRow("9999999999", app)), app);
});

test("maps complete order snapshots in both directions", () => {
  const order = { id: "ABC123", items: [], totalItems: 2, subtotal: 400, discount: 40, deliveryFee: 25, total: 385, status: "preparing", deliveryAddress: {}, paymentMethod: {}, placedAt: "2026-07-14T10:00:00.000Z" };
  assert.deepEqual(orderFromRow(orderToRow("9999999999", order)), order);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run: `node --test tests/customer-data.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement pure mappings and repository queries**

Implement camelCase-to-snake_case mappers. Every query accepts an optional final `client = getSupabase()` argument for deterministic tests. Throw `error` returned by Supabase rather than swallowing it. Required query behavior:

```js
export async function upsertCustomer(phone, client = getSupabase()) {
  const normalized = normalizePhone(phone);
  const { data, error } = await client
    .from("customers")
    .upsert({ phone: normalized, updated_at: new Date().toISOString() }, { onConflict: "phone" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

Use these exact remaining signatures so contexts and tests agree:

```js
export function normalizePhone(phone) {}
export function addressToRow(customerPhone, address) {}
export function addressFromRow(row) {}
export function orderToRow(customerPhone, order) {}
export function orderFromRow(row) {}
export async function listAddresses(phone, client = getSupabase()) {}
export async function createAddress(phone, address, client = getSupabase()) {}
export async function updateAddress(phone, id, address, client = getSupabase()) {}
export async function deleteAddress(phone, id, client = getSupabase()) {}
export async function makeDefaultAddress(phone, id, client = getSupabase()) {}
export async function listOrders(phone, client = getSupabase()) {}
export async function createOrder(phone, order, client = getSupabase()) {}
```

`listAddresses` filters `customer_phone`, orders by `created_at`, and maps rows. `listOrders` filters `customer_phone`, orders by `placed_at` descending, and maps rows. Write operations return mapped saved records. `makeDefaultAddress` first clears the current default for the same customer and then sets the requested row; if the second update fails, refetching restores accurate UI state.

- [ ] **Step 4: Add fake-client query tests**

Add a chainable fake Supabase client recording table names, filters, order calls, and payloads. Assert each repository function filters by the normalized customer phone and throws a supplied `{ message: "offline" }` error.

- [ ] **Step 5: Run repository tests**

Run: `node --test tests/customer-data.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit the repository**

```bash
git add lib/customerData.mjs tests/customer-data.test.mjs
git commit -m "feat: add Supabase customer data repository"
```

---

### Task 3: Persist login-created customers

**Files:**
- Modify: `context/AuthContext.js:1-47`
- Modify: `pages/login.js:289-320`
- Test: `tests/supabase-customer-flow.test.mjs`

**Interfaces:**
- Consumes: `upsertCustomer(phone)` and `normalizePhone(phone)`.
- Produces: asynchronous `login(phone): Promise<void>` plus `authError` and `isLoggingIn` context values.

- [ ] **Step 1: Write the failing login integration source test**

```js
test("upserts the phone customer before completing login", async () => {
  const [auth, login] = await Promise.all([read("context/AuthContext.js"), read("pages/login.js")]);
  assert.match(auth, /await upsertCustomer\(normalizedPhone\)/);
  assert.match(auth, /const login = async \(phone\)/);
  assert.match(login, /await login\(phone\)/);
  assert.match(login, /Unable to connect your account/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/supabase-customer-flow.test.mjs`

Expected: FAIL because login is synchronous and does not upsert.

- [ ] **Step 3: Make authentication persistence asynchronous**

In `AuthContext`, normalize the phone, set `isLoggingIn`, await `upsertCustomer`, then set/persist `{ phone: normalizedPhone }`. On failure, retain the logged-out state, set `authError` to `"Unable to connect your account. Please try again."`, rethrow for the screen, and clear `isLoggingIn` in `finally`. Clear `authError` on each new attempt and on logout.

- [ ] **Step 4: Await login in the OTP screen**

Change `handleVerified` to `async`, await `login(phone)`, and navigate only on success. Show `authError` below the verification controls and allow retry without re-entering the phone number. Keep the accepted code exactly `1234`.

- [ ] **Step 5: Run login and existing customer-flow tests**

Run: `node --test tests/supabase-customer-flow.test.mjs tests/customer-flow-menu-polish.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit login persistence**

```bash
git add context/AuthContext.js pages/login.js tests/supabase-customer-flow.test.mjs
git commit -m "feat: create Supabase customers on login"
```

---

### Task 4: Database-backed delivery addresses

**Files:**
- Modify: `context/AddressContext.js:1-71`
- Modify: `pages/addresses.js:250-350`
- Test: `tests/supabase-customer-flow.test.mjs`

**Interfaces:**
- Consumes: `useAuth().user.phone` and address repository functions.
- Produces: `addresses`, `defaultAddress`, `isLoadingAddresses`, `addressError`, and asynchronous address mutations.

- [ ] **Step 1: Add failing address-flow assertions**

Assert that `AddressContext` imports `useAuth` and all address repository operations, calls `listAddresses(user.phone)`, and exposes loading/error state. Assert `pages/addresses.js` awaits `addAddress`/`updateAddress` before closing the sheet or redirecting.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/supabase-customer-flow.test.mjs`

Expected: FAIL on missing repository calls.

- [ ] **Step 3: Replace address localStorage writes with Supabase operations**

On authenticated hydration, call `listAddresses(phone)`. If remote results are empty, parse `smartrest_addresses`, upload each legacy address in sequence, refetch, then remove the storage key. Never upload legacy data when remote rows already exist. Reset state to empty on logout.

Each mutation must set a busy flag, clear the prior error, await its repository function, and update/refetch state only after success. On failure, retain existing state and set `"Could not save your address. Please try again."` or the matching delete/default message.

- [ ] **Step 4: Make the address page await mutations**

Make `handleSave` asynchronous. Disable the save button and card mutation buttons while a write is active. Keep the sheet open and render `addressError` on failure; close/redirect/show the saved toast only after success. Show a compact loading state before rendering the empty-address UI.

- [ ] **Step 5: Run focused and address-navigation tests**

Run: `node --test tests/supabase-customer-flow.test.mjs tests/customer-flow-menu-polish.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit address persistence**

```bash
git add context/AddressContext.js pages/addresses.js tests/supabase-customer-flow.test.mjs
git commit -m "feat: persist customer addresses in Supabase"
```

---

### Task 5: Database-backed order history and safe checkout

**Files:**
- Modify: `context/OrdersContext.js:1-38`
- Modify: `pages/checkout.js:177-215`
- Modify: `pages/orders.js:1-85`
- Test: `tests/supabase-customer-flow.test.mjs`

**Interfaces:**
- Consumes: `useAuth().user.phone`, `createOrder`, `listOrders`, checkout totals, selected address, and payment method.
- Produces: `orders`, `placeOrder(order): Promise<object>`, `isLoadingOrders`, and `ordersError`.

- [ ] **Step 1: Add failing order and checkout assertions**

```js
test("persists a complete order before clearing checkout", async () => {
  const [orders, checkout] = await Promise.all([read("context/OrdersContext.js"), read("pages/checkout.js")]);
  assert.match(orders, /await createOrder\(user\.phone, order\)/);
  assert.match(checkout, /subtotal,/);
  assert.match(checkout, /discount,/);
  assert.match(checkout, /deliveryFee,/);
  assert.match(checkout, /deliveryAddress: defaultAddress/);
  assert.match(checkout, /paymentMethod: method/);
  assert.ok(checkout.indexOf("await placeOrder(order)") < checkout.indexOf("clearCart()"));
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/supabase-customer-flow.test.mjs`

Expected: FAIL because checkout does not await persistence or include the complete snapshot.

- [ ] **Step 3: Replace order localStorage writes with Supabase operations**

Load `listOrders(phone)` after authentication. If remote history is empty, migrate `smartrest_orders` with conflict-safe IDs, then remove the legacy key after a successful refetch. Reset orders on logout. `placeOrder` awaits `createOrder`, prepends the returned mapped row, and rethrows failures after setting `"Could not place your order. Your cart is still safe."`.

- [ ] **Step 4: Persist checkout before confirmation**

Remove the artificial `setTimeout`. Build an order with `id`, `items`, `totalItems`, `subtotal`, `discount`, `deliveryFee`, `total`, `status: "preparing"`, `deliveryAddress: defaultAddress`, `paymentMethod: method`, and `placedAt`. Await `placeOrder(order)` before `clearCart()` and `setPlacedOrder(savedOrder)`. On failure, keep cart and checkout visible and show `ordersError` above the checkout button.

- [ ] **Step 5: Add order-history loading and error states**

Use `isLoadingOrders` to avoid flashing the empty state while loading. Render the readable `ordersError` with a retry action that invokes a new `refreshOrders()` context method.

- [ ] **Step 6: Run focused and full Node tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS.

- [ ] **Step 7: Commit order persistence**

```bash
git add context/OrdersContext.js pages/checkout.js pages/orders.js tests/supabase-customer-flow.test.mjs
git commit -m "feat: persist customer orders in Supabase"
```

---

### Task 6: Final verification and database handoff

**Files:**
- Modify if verification reveals issues: files touched in Tasks 1-5 only.
- Reference: `supabase/migrations/202607140001_customer_data.sql`

**Interfaces:**
- Consumes: completed client, schema, repository, contexts, and screens.
- Produces: a buildable integration and exact SQL Editor handoff.

- [ ] **Step 1: Run all automated tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit code 0. If unrelated pre-existing warnings exist, record them without changing unrelated files.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Next.js production build completes successfully.

- [ ] **Step 4: Perform the two-phone manual flow after applying SQL**

Run the migration in the Supabase SQL Editor, start with `npm run dev`, then verify:

1. Log in as phone A using `1234`, save an address, place an order, log out.
2. Log in as phone B using `1234`; confirm phone A's address and order do not appear.
3. Save different data for phone B, log out, and log back in as phone A.
4. Confirm phone A's Supabase-backed address and order return.
5. Simulate a failed order insert and confirm the cart remains populated.

- [ ] **Step 5: Inspect final changes and commit any verification fixes**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and only intentional changes. If fixes were needed:

Stage only the files reported by `git status --short`, then run `git commit -m "fix: complete Supabase customer data verification"`.
