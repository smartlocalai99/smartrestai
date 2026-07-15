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
  assert.equal(
    parsed.scripts["db:link"],
    "supabase link --project-ref uvrngxhovpzlxevkigoc"
  );
  assert.equal(parsed.scripts["db:push:dry"], "supabase db push --linked --dry-run");
  assert.equal(parsed.scripts["db:push"], "supabase db push --linked");
  assert.match(config, /project_id = "smartrestaicustomer"/);
  assert.match(gitignore, /supabase\/\.temp\//);
});
