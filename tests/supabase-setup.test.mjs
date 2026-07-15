import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
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
  assert.match(
    migration,
    /grant select, insert, update, delete on table public\.customers to anon, authenticated, service_role/
  );
  assert.match(
    migration,
    /grant select, insert, update, delete on table public\.customer_addresses to anon, authenticated, service_role/
  );
  assert.match(
    migration,
    /grant select, insert, update, delete on table public\.customer_orders to anon, authenticated, service_role/
  );
  assert.match(migration, /Development-only public client access/);
});

test("hardens the shared timestamp trigger function", async () => {
  const migrationsDirectory = new URL("../supabase/migrations/", import.meta.url);
  const migrationFiles = await readdir(migrationsDirectory);
  const migrations = await Promise.all(
    migrationFiles
      .filter((file) => file.endsWith(".sql"))
      .map((file) => readFile(new URL(file, migrationsDirectory), "utf8"))
  );
  const sql = migrations.join("\n");

  assert.match(sql, /alter function public\.set_updated_at\(\) set search_path = ''/);
  assert.match(
    sql,
    /revoke execute on function public\.set_updated_at\(\) from public, anon, authenticated/
  );
});
