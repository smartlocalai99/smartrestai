# Supabase CLI Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link this repository to Supabase project `uvrngxhovpzlxevkigoc` and deploy checked-in SQL migrations through repeatable npm commands.

**Architecture:** The local Supabase CLI is installed as a development dependency and initialized in the existing `supabase/` directory. Package scripts wrap link, dry-run, and push commands while authentication and the database password stay in local credential storage or process environment variables.

**Tech Stack:** Supabase CLI, npm scripts, PostgreSQL migrations, Node test runner.

## Global Constraints

- Never commit a Supabase access token or database password.
- Link only to project `uvrngxhovpzlxevkigoc`.
- Always run the dry-run command before the first push.
- Never run `supabase db reset --linked`.
- Preserve `supabase/migrations/202607140001_customer_data.sql` unchanged unless the dry run identifies a SQL compatibility error.

---

### Task 1: Add the local CLI and deployment commands

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `supabase/config.toml`
- Modify: `.gitignore`
- Test: `tests/supabase-cli.test.mjs`

**Interfaces:**
- Consumes: npm and the existing `supabase/migrations/` directory.
- Produces: `npm run db:link`, `npm run db:push:dry`, and `npm run db:push`.

- [ ] **Step 1: Write the failing configuration test**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("provides linked Supabase migration commands", async () => {
  const [pkg, config, gitignore] = await Promise.all([
    read("package.json"),
    read("supabase/config.toml"),
    read(".gitignore"),
  ]);
  const parsed = JSON.parse(pkg);
  assert.ok(parsed.devDependencies.supabase);
  assert.equal(parsed.scripts["db:link"], "supabase link --project-ref uvrngxhovpzlxevkigoc");
  assert.equal(parsed.scripts["db:push:dry"], "supabase db push --linked --dry-run");
  assert.equal(parsed.scripts["db:push"], "supabase db push --linked");
  assert.match(config, /project_id = "smartrestaicustomer"/);
  assert.match(gitignore, /supabase\/\.temp\//);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/supabase-cli.test.mjs`

Expected: FAIL because `supabase/config.toml` and package scripts do not exist.

- [ ] **Step 3: Install and initialize the CLI**

Run:

```bash
npm install --save-dev supabase
npx supabase init
```

Expected: the local CLI is installed and `supabase/config.toml` is created without deleting the existing migration.

- [ ] **Step 4: Add package scripts and CLI temporary-file ignore**

Add these exact scripts to `package.json`:

```json
"db:link": "supabase link --project-ref uvrngxhovpzlxevkigoc",
"db:push:dry": "supabase db push --linked --dry-run",
"db:push": "supabase db push --linked"
```

Add `/supabase/.temp/` to `.gitignore`. Do not add any token or database password.

- [ ] **Step 5: Run the configuration test and CLI version check**

Run:

```bash
node --test tests/supabase-cli.test.mjs
npx supabase --version
```

Expected: the test passes and the installed CLI prints its version.

- [ ] **Step 6: Commit repository setup**

```bash
git add package.json package-lock.json .gitignore supabase/config.toml tests/supabase-cli.test.mjs
git commit -m "feat: add Supabase migration deployment commands"
```

---

### Task 2: Authenticate, link, dry-run, and push

**Files:**
- Read: `supabase/migrations/202607140001_customer_data.sql`
- Local untracked state: Supabase CLI authentication and `supabase/.temp/`

**Interfaces:**
- Consumes: authenticated Supabase CLI session and the project's database password.
- Produces: linked project metadata and applied remote migration `202607140001`.

- [ ] **Step 1: Authenticate without storing secrets in Git**

Run: `npx supabase login`

Expected: the CLI reports successful login. If the machine cannot complete interactive login, the user sets `SUPABASE_ACCESS_TOKEN` in their terminal environment and reruns the command that failed.

- [ ] **Step 2: Link the hosted project**

Run: `npm run db:link`

Expected: after the database-password prompt, the CLI prints `Finished supabase link.`

- [ ] **Step 3: Preview pending migrations**

Run: `npm run db:push:dry`

Expected: the dry run lists `202607140001_customer_data.sql` and exits successfully.

- [ ] **Step 4: Apply the migration**

Run: `npm run db:push`

Expected: the CLI reports that migration `202607140001_customer_data.sql` was applied successfully.

- [ ] **Step 5: Confirm migration idempotency**

Run: `npm run db:push:dry`

Expected: the linked project reports no pending migrations or that it is up to date.

---

### Task 3: Verify remote schema and application build

**Files:**
- Read: `.env.local`
- Read: `supabase/migrations/202607140001_customer_data.sql`

**Interfaces:**
- Consumes: deployed migration and the existing publishable application credentials.
- Produces: evidence that all three tables are remotely available and the app remains buildable.

- [ ] **Step 1: Query each remote table through PostgREST**

Load `.env.local` into the shell and issue `GET` requests with the publishable key for:

```text
/rest/v1/customers?select=phone&limit=1
/rest/v1/customer_addresses?select=id&limit=1
/rest/v1/customer_orders?select=id&limit=1
```

Expected: each request returns HTTP 200; an empty JSON array is valid.

- [ ] **Step 2: Run the complete automated test suite**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass with zero failures.

- [ ] **Step 3: Run targeted lint and the production build**

Run:

```bash
npx eslint utils/supabase.js lib/customerData.mjs context/AuthContext.js context/AddressContext.js context/OrdersContext.js pages/login.js pages/addresses.js pages/checkout.js pages/orders.js tests/supabase-setup.test.mjs tests/customer-data.test.mjs tests/supabase-customer-flow.test.mjs tests/supabase-cli.test.mjs
npm run build
```

Expected: targeted lint exits with no errors and the Next.js production build succeeds.

- [ ] **Step 4: Inspect final repository state**

Run: `git status --short && git diff --check`

Expected: no uncommitted tracked changes and no credential files staged or tracked.
