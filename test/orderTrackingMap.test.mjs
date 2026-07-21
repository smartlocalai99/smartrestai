import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  CUSTOMER_POINT,
  RESTAURANT,
  createFallbackMapUrl,
  createMapEndpoints,
  createMapOptions,
  createVisualRoute,
} from "../lib/orderTrackingMap.mjs";

describe("order tracking map", () => {
  it("prefers restaurant profile and saved customer coordinates", () => {
    expect(
      createMapEndpoints({
        restaurant: {
          name: "Mandi Kings Kitchen",
          addressLine: "Trunk Road",
          lat: 14.48,
          lng: 78.82,
        },
        destination: { line: "Customer home", lat: 14.49, lng: 78.83 },
      })
    ).toEqual({
      restaurant: {
        name: "Mandi Kings Kitchen",
        address: "Trunk Road",
        coordinates: [78.82, 14.48],
        isFallback: false,
      },
      customer: {
        label: "Customer home",
        coordinates: [78.83, 14.49],
        isFallback: false,
      },
    });
  });

  it("falls back safely when profile or address coordinates are invalid", () => {
    const endpoints = createMapEndpoints({
      restaurant: { lat: "bad", lng: 78.82 },
      destination: { line: "Text-only address", lat: null, lng: null },
    });

    expect(endpoints.restaurant.coordinates).toEqual(RESTAURANT.coordinates);
    expect(endpoints.customer.coordinates).toEqual(CUSTOMER_POINT);
    expect(endpoints.customer).toMatchObject({
      label: "Text-only address",
      isFallback: true,
    });
  });

  it("uses the keyless OpenFreeMap style and Kadapa restaurant origin", () => {
    const endpoints = createMapEndpoints();
    expect(createMapOptions("map-node", endpoints)).toMatchObject({
      container: "map-node",
      style: "https://tiles.openfreemap.org/styles/positron",
      center: RESTAURANT.coordinates,
    });
  });

  it("creates a visual line from restaurant to customer", () => {
    const endpoints = createMapEndpoints();
    const route = createVisualRoute(endpoints);

    expect(route.geometry.coordinates[0]).toEqual(RESTAURANT.coordinates);
    expect(route.geometry.coordinates.at(-1)).toEqual(CUSTOMER_POINT);
  });

  it("provides a real OpenStreetMap fallback", () => {
    const fallbackUrl = createFallbackMapUrl(createMapEndpoints());

    expect(fallbackUrl).toContain("https://www.openstreetmap.org/export/embed.html?");
    expect(fallbackUrl).toContain("bbox=");
    expect(fallbackUrl).toContain(`marker=${CUSTOMER_POINT[1]}%2C${CUSTOMER_POINT[0]}`);
  });

  it("keeps the fallback eager and uses the app logo for the restaurant", async () => {
    const source = await readFile("components/customer/OrderTrackingMap.js", "utf8");

    expect(source).toMatch(/<iframe[\s\S]*?src=\{createFallbackMapUrl\(endpoints\)\}/);
    expect(source).not.toMatch(/\{failed \? \([\s\S]*?<iframe/);
    expect(source).toContain('src="/applogo.jpeg"');
    expect(source).toContain('alt={`${endpoints.restaurant.name} restaurant`}');
  });
});
