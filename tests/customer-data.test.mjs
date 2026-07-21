import assert from "node:assert/strict";
import test from "node:test";
import {
  addressFromRow,
  addressToRow,
  listAddresses,
  normalizePhone,
  orderFromRow,
  orderToRow,
} from "../lib/customerData.mjs";

function createQueryClient(response) {
  const calls = [];
  const builder = {
    select(value) {
      calls.push(["select", value]);
      return this;
    },
    eq(column, value) {
      calls.push(["eq", column, value]);
      return this;
    },
    order(column, options) {
      calls.push(["order", column, options]);
      return Promise.resolve(response);
    },
  };

  return {
    calls,
    client: {
      from(table) {
        calls.push(["from", table]);
        return builder;
      },
    },
  };
}

test("normalizes Indian phone input to ten digits", () => {
  assert.equal(normalizePhone("+91 98765-43210"), "9876543210");
  assert.equal(normalizePhone("9876543210"), "9876543210");
  assert.throws(() => normalizePhone("1234"), /ten-digit/);
});

test("maps address fields in both directions", () => {
  const address = {
    id: "31dbdd40-ff08-4593-8658-69ea85aa612e",
    label: "Home",
    line: "Trunk Rd",
    landmark: "SBI",
    phone: "9876543210",
    isDefault: true,
    lat: 14.47924,
    lng: 78.82171,
  };

  assert.deepEqual(addressFromRow(addressToRow("9999999999", address)), address);
});

test("defaults address coordinates to null when not captured", () => {
  const address = {
    id: "31dbdd40-ff08-4593-8658-69ea85aa612e",
    label: "Home",
    line: "Trunk Rd",
    landmark: "SBI",
    phone: "9876543210",
    isDefault: true,
    lat: null,
    lng: null,
  };

  assert.deepEqual(addressFromRow(addressToRow("9999999999", address)), address);
});

test("maps complete order snapshots in both directions", () => {
  const order = {
    id: "ABC123",
    items: [],
    totalItems: 2,
    subtotal: 400,
    discount: 40,
    deliveryFee: 25,
    total: 385,
    status: "preparing",
    deliveryAddress: {},
    paymentMethod: {},
    placedAt: "2026-07-14T10:00:00.000Z",
    orderedAt: "2026-07-14T10:00:00.000Z",
    pickedUpAt: "2026-07-14T10:20:00.000Z",
    deliveredAt: null,
  };

  assert.deepEqual(orderFromRow(orderToRow("9999999999", order)), order);
});

test("maps legacy order gaps to safe database defaults", () => {
  const row = orderToRow("9999999999", {
    id: "OLD123",
    items: [{ quantity: 1 }],
    totalItems: 1,
    total: 250,
    placedAt: "2026-07-14T10:00:00.000Z",
  });

  assert.equal(row.subtotal, 250);
  assert.equal(row.discount, 0);
  assert.equal(row.delivery_fee, 0);
  assert.deepEqual(row.delivery_address, {});
  assert.equal(row.status, "preparing");
  assert.equal(row.ordered_at, "2026-07-14T10:00:00.000Z");
  assert.equal(row.picked_up_at, null);
  assert.equal(row.delivered_at, null);
});

test("loads only addresses belonging to the normalized customer phone", async () => {
  const { client, calls } = createQueryClient({
    data: [
      {
        id: "a1",
        label: "Home",
        address_line: "Trunk Rd",
        landmark: null,
        contact_phone: null,
        is_default: true,
      },
    ],
    error: null,
  });

  const addresses = await listAddresses("+91 98765 43210", client);

  assert.equal(addresses[0].line, "Trunk Rd");
  assert.deepEqual(calls, [
    ["from", "customer_addresses"],
    ["select", "*"],
    ["eq", "customer_phone", "9876543210"],
    ["order", "created_at", { ascending: true }],
  ]);
});

test("surfaces Supabase read failures", async () => {
  const offline = { message: "offline" };
  const { client } = createQueryClient({ data: null, error: offline });
  await assert.rejects(() => listAddresses("9876543210", client), offline);
});
