import { describe, expect, it } from "vitest";
import { createOrderView, splitOrders } from "../lib/orderView.mjs";

const order = (overrides = {}) => ({
  id: "ORDER1",
  status: "out_for_delivery",
  placedAt: "2026-07-15T12:30:00.000Z",
  orderedAt: "2026-07-15T12:30:00.000Z",
  pickedUpAt: "2026-07-15T12:50:00.000Z",
  deliveredAt: null,
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
  it("keeps the newest live order current and sorts all other orders as history", () => {
    const older = order({
      id: "OLD",
      status: "delivered",
      placedAt: "2026-07-13T12:30:00.000Z",
    });
    const current = order({ id: "CURRENT", placedAt: "2026-07-15T12:30:00.000Z" });
    const newerDelivered = order({
      id: "DELIVERED",
      status: "delivered",
      placedAt: "2026-07-16T12:30:00.000Z",
    });

    expect(splitOrders([older, current, newerDelivered])).toEqual({
      activeOrder: current,
      previousOrders: [newerDelivered, older],
    });
  });

  it("returns previous orders directly when every order is finished", () => {
    const delivered = order({ id: "DELIVERED", status: "delivered" });
    const cancelled = order({
      id: "CANCELLED",
      status: "cancelled",
      placedAt: "2026-07-14T12:30:00.000Z",
    });

    expect(splitOrders([cancelled, delivered])).toEqual({
      activeOrder: null,
      previousOrders: [delivered, cancelled],
    });
  });

  it("never labels another live order as previous history", () => {
    const newestLive = order({ id: "LIVE-2", placedAt: "2026-07-16T12:30:00.000Z" });
    const olderLive = order({ id: "LIVE-1", placedAt: "2026-07-15T12:30:00.000Z" });
    const delivered = order({
      id: "DELIVERED",
      status: "delivered",
      placedAt: "2026-07-14T12:30:00.000Z",
    });

    expect(splitOrders([olderLive, delivered, newestLive])).toEqual({
      activeOrder: newestLive,
      previousOrders: [delivered],
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

  it("builds the three milestone timeline from status and stored timestamps", () => {
    const view = createOrderView(order(), "9000000000");

    expect(view.timelineSteps).toEqual([
      expect.objectContaining({ label: "Ordered", isComplete: true, isCurrent: false }),
      expect.objectContaining({ label: "Picked up", isComplete: true, isCurrent: true }),
      expect.objectContaining({ label: "Delivered", isComplete: false, timeLabel: "Pending" }),
    ]);
    expect(view.timelineSteps[0].timeLabel).not.toBe("Completed");
    expect(view.timelineSteps[1].timeLabel).not.toBe("Completed");
  });

  it("does not invent missing timestamps for legacy completed milestones", () => {
    const delivered = createOrderView(
      order({ status: "delivered", pickedUpAt: null, deliveredAt: null })
    );

    expect(delivered.timelineSteps).toEqual([
      expect.objectContaining({ label: "Ordered", isComplete: true }),
      expect.objectContaining({ label: "Picked up", isComplete: true, timeLabel: "Completed" }),
      expect.objectContaining({ label: "Delivered", isComplete: true, timeLabel: "Completed" }),
    ]);
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
