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

test("loads and mutates addresses for the logged-in phone", async () => {
  const [context, page] = await Promise.all([
    read("context/AddressContext.js"),
    read("pages/addresses.js"),
  ]);

  assert.match(context, /useAuth\(\)/);
  assert.match(context, /const phone = user\?\.phone/);
  assert.match(context, /listAddresses\(phone\)/);
  assert.match(context, /await createAddress\(phone/);
  assert.match(context, /await updateCustomerAddress\(phone/);
  assert.match(context, /await deleteAddress\(phone/);
  assert.match(context, /await makeDefaultAddress\(phone/);
  assert.match(context, /isLoadingAddresses/);
  assert.match(context, /addressError/);
  assert.match(page, /const handleSave = async \(data\)/);
  assert.match(page, /await updateAddress\(sheet\.id, data\)/);
  assert.match(page, /await addAddress\(data\)/);
});

test("persists a complete order before clearing checkout", async () => {
  const [orders, checkout, history] = await Promise.all([
    read("context/OrdersContext.js"),
    read("pages/checkout.js"),
    read("pages/orders.js"),
  ]);

  assert.match(orders, /await createOrder\(phone, order\)/);
  assert.match(orders, /listOrders\(phone\)/);
  assert.match(checkout, /subtotal,/);
  assert.match(checkout, /discount,/);
  assert.match(checkout, /deliveryFee,/);
  assert.match(checkout, /deliveryAddress: defaultAddress/);
  assert.match(checkout, /paymentMethod: method/);
  assert.ok(checkout.indexOf("await placeOrder(order)") < checkout.indexOf("clearCart()"));
  assert.match(checkout, /Your cart is still safe/);
  assert.match(history, /isLoadingOrders/);
  assert.match(history, /refreshOrders/);
});
