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
  assert.match(pkg, /"type": "module"/);
  assert.match(example, /NEXT_PUBLIC_SUPABASE_URL=/);
  assert.match(client, /export function getSupabase/);
  assert.match(migration, /create table if not exists public\.customers/);
  assert.match(migration, /phone text primary key/);
  assert.match(migration, /create table if not exists public\.customer_addresses/);
  assert.match(migration, /create table if not exists public\.customer_orders/);
  assert.match(migration, /Development-only public client access/);
});
