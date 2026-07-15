import { describe, expect, it } from "vitest";
import {
  CUSTOMER_POINT,
  RESTAURANT,
  createMapOptions,
  createVisualRoute,
} from "../lib/orderTrackingMap.mjs";

describe("order tracking map", () => {
  it("uses the keyless OpenFreeMap style and Kadapa restaurant origin", () => {
    expect(createMapOptions("map-node")).toMatchObject({
      container: "map-node",
      style: "https://tiles.openfreemap.org/styles/positron",
      center: RESTAURANT.coordinates,
    });
    expect(RESTAURANT).toMatchObject({
      name: "MANDI KING",
      coordinates: [78.82171, 14.47924],
    });
  });

  it("creates a visual line from restaurant to the display-only customer point", () => {
    const route = createVisualRoute();

    expect(route.geometry.coordinates[0]).toEqual(RESTAURANT.coordinates);
    expect(route.geometry.coordinates.at(-1)).toEqual(CUSTOMER_POINT);
  });
});
