export const RESTAURANT = {
  name: "MANDI KING",
  address:
    "Door No 1, Trunk Rd, near SBI Bank, beside 2nd Gandhi Statue, Ganagapeta, Kadapa, Andhra Pradesh 516001",
  coordinates: [78.82171, 14.47924],
};

export const CUSTOMER_POINT = [78.8271, 14.4835];

export function createVisualRoute() {
  const [startLng, startLat] = RESTAURANT.coordinates;
  const [endLng, endLat] = CUSTOMER_POINT;

  return {
    type: "Feature",
    properties: { kind: "visual-tracking-path" },
    geometry: {
      type: "LineString",
      coordinates: [
        [startLng, startLat],
        [startLng + 0.0014, startLat + 0.002],
        [endLng - 0.0012, endLat - 0.0008],
        [endLng, endLat],
      ],
    },
  };
}

export function createMapOptions(container) {
  return {
    container,
    style: "https://tiles.openfreemap.org/styles/positron",
    center: RESTAURANT.coordinates,
    zoom: 14.4,
    attributionControl: true,
    interactive: true,
  };
}
