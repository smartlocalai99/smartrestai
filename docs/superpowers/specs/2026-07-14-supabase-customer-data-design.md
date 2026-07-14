# Supabase Customer Data Design

## Goal

Connect the customer application to Supabase for persistent customer profiles, delivery addresses, and order history. The existing four-digit `1234` OTP remains a temporary development login. A real OTP provider can replace it later without changing customer phone keys or existing customer data.

## Scope

- Install `@supabase/supabase-js`.
- Configure the supplied public Supabase URL and publishable key in ignored local environment variables.
- Add a reusable browser Supabase client that follows the repository's JavaScript conventions.
- Add a SQL migration for customer, address, and order tables.
- Create or refresh a customer record after successful temporary OTP login.
- Load, create, update, delete, and select default customer addresses through Supabase.
- Load customer order history and save newly placed orders through Supabase.
- Preserve the existing restaurant homepage, menu, cart, checkout, and temporary OTP experience.
- Keep the cart and other temporary UI state local.

Supabase Auth, server-side session refresh, real SMS delivery, and production authorization are outside this change.

## Architecture

### Supabase client

`utils/supabase.js` exports one browser client created from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. It validates that both variables exist and provides one shared integration point for the application.

No `proxy.js` or session middleware is added because the app does not yet use Supabase Auth sessions.

### Data access layer

Focused functions in `lib/customerData.js` isolate Supabase queries from React contexts. The module exposes operations for:

- upserting and fetching a customer by phone;
- listing and mutating addresses for a phone;
- listing and creating orders for a phone.

React components continue consuming context APIs instead of querying Supabase directly. This keeps the UI stable and makes the future Supabase Auth migration localized.

### Context integration

`AuthContext` keeps the existing local login session. After `1234` succeeds, login upserts the customer by phone. The stored user object retains the phone number as its stable identifier.

`AddressContext` and `OrdersContext` wait for authentication hydration, then fetch records belonging to the logged-in phone. Their write methods become asynchronous and update local UI state only after a successful database operation. Checkout and address screens show a busy state while writes are in progress and a readable error if persistence fails.

On the first authenticated load after this upgrade, existing locally stored addresses and orders are copied to Supabase when the remote collections are empty. Successful migration removes the legacy local collection so the same records are not uploaded twice.

## Database Schema

### `customers`

- `phone text primary key`: normalized ten-digit Indian mobile number.
- `name text null`: optional customer name for later profile completion.
- `email text null`: optional email for later profile completion.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

### `customer_addresses`

- `id uuid primary key default gen_random_uuid()`.
- `customer_phone text not null references customers(phone) on delete cascade`.
- `label text not null`.
- `address_line text not null`.
- `landmark text null`.
- `contact_phone text null`.
- `is_default boolean not null default false`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.

An index on `customer_phone` supports customer address loading. A partial unique index permits at most one default address per customer.

### `customer_orders`

- `id text primary key`: preserves the application's current visible order identifier.
- `customer_phone text not null references customers(phone) on delete restrict`.
- `items jsonb not null`: preserves the cart item snapshot needed by the current order-history UI.
- `total_items integer not null`.
- `subtotal numeric(10,2) not null`.
- `discount numeric(10,2) not null default 0`.
- `delivery_fee numeric(10,2) not null default 0`.
- `total numeric(10,2) not null`.
- `status text not null default 'preparing'`.
- `delivery_address jsonb not null`: immutable address snapshot at checkout.
- `payment_method jsonb null`: immutable payment selection snapshot.
- `placed_at timestamptz not null default now()`.

An index on `(customer_phone, placed_at desc)` supports order-history loading.

## Data Flow

1. The customer enters a phone number and verifies with temporary OTP `1234`.
2. `AuthContext.login(phone)` normalizes the phone, upserts `customers`, and stores the local login marker.
3. Address and order contexts fetch rows filtered by the authenticated phone.
4. Address changes are persisted first, then reflected in context state.
5. Checkout creates a complete order snapshot in Supabase before clearing the cart or showing confirmation.
6. The orders page renders the database-backed order list newest first.
7. Logout clears customer-derived in-memory state and returns to the home screen as it does today.

## Development Authorization

The migration enables row-level security and adds temporary development policies that allow the public publishable client to read and write these three tables. Because the temporary OTP does not produce an authenticated Supabase identity, these policies cannot securely prove phone ownership.

The migration labels these policies as development-only. Before production, real phone OTP authentication must be added and the policies replaced with rules based on the authenticated user's verified identity. The data model and phone relationships remain reusable during that migration.

## Error Handling

- Invalid or missing environment variables produce a clear configuration error.
- Failed login upserts prevent completion and show a retryable login message.
- Failed address writes preserve the previous UI state and show a readable error.
- Failed order creation keeps the cart intact and does not show order confirmation.
- Initial read failures show an empty/loading-safe UI plus an error state; they do not overwrite remote or legacy data.
- Migration operations use stable existing IDs where possible and conflict-safe inserts to prevent duplicates.

## Verification

- Unit tests cover phone normalization and Supabase row-to-app model mapping.
- Context tests cover login upsert, customer-specific loading, successful writes, and failed-write state preservation.
- Checkout tests confirm that the cart is cleared only after successful order persistence.
- Existing build and lint checks must pass.
- A manual Supabase verification covers two phone numbers to confirm their address and order results remain separated.

## Deployment Steps

1. Run the checked-in SQL migration in the target project's Supabase SQL Editor. A publishable key cannot perform schema creation.
2. Add the supplied URL and publishable key to local and deployed environment variables.
3. Deploy the application and verify customer creation, address persistence, order placement, logout, and repeat login.
4. Replace the development policies when real OTP authentication is implemented.
