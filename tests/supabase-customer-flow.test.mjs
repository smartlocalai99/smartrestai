import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("upserts the phone customer before completing login", async () => {
  const [auth, login] = await Promise.all([
    read("context/AuthContext.js"),
    read("pages/login.js"),
  ]);

  assert.match(auth, /const login = async \(phone\)/);
  assert.match(auth, /await upsertCustomer\(normalizedPhone\)/);
  assert.ok(auth.indexOf("await upsertCustomer") < auth.indexOf("setUser(nextUser)"));
  assert.match(login, /await login\(phone\)/);
  assert.match(login, /Unable to connect your account/);
  assert.match(login, /const VALID_OTP = "1234"/);
});
