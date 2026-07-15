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
