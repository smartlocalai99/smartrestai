export const RESTAURANT = {
  name: "MANDI KING",
  address:
    "Door No 1, Trunk Rd, near SBI Bank, beside 2nd Gandhi Statue, Ganagapeta, Kadapa, Andhra Pradesh 516001",
  coordinates: [78.82171, 14.47924],
};

export const CUSTOMER_POINT = [78.8271, 14.4835];

const validCoordinate = (value, min, max) => {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
};

const coordinatesFrom = (value, fallback) => {
  const lat = validCoordinate(value?.lat, -90, 90);
  const lng = validCoordinate(value?.lng, -180, 180);
  return lat == null || lng == null ? fallback : [lng, lat];
};

export function createMapEndpoints({ destination = {}, restaurant = {} } = {}) {
  const restaurantCoordinates = coordinatesFrom(restaurant, RESTAURANT.coordinates);
  const customerCoordinates = coordinatesFrom(destination, CUSTOMER_POINT);

  return {
    restaurant: {
      name: String(restaurant.name || "").trim() || RESTAURANT.name,
      address:
        String(restaurant.addressLine || restaurant.address || "").trim() ||
        RESTAURANT.address,
      coordinates: restaurantCoordinates,
      isFallback: restaurantCoordinates === RESTAURANT.coordinates,
    },
    customer: {
      label:
        String(destination.line || destination.label || "").trim() ||
        "Delivery address unavailable",
      coordinates: customerCoordinates,
      isFallback: customerCoordinates === CUSTOMER_POINT,
    },
  };
}

export function createVisualRoute(endpoints = createMapEndpoints()) {
  const [startLng, startLat] = endpoints.restaurant.coordinates;
  const [endLng, endLat] = endpoints.customer.coordinates;

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

export function createFallbackMapUrl(endpoints = createMapEndpoints()) {
  const [restaurantLng, restaurantLat] = endpoints.restaurant.coordinates;
  const [customerLng, customerLat] = endpoints.customer.coordinates;
  const padding = 0.003;
  const params = new URLSearchParams({
    bbox: [
      Math.min(restaurantLng, customerLng) - padding,
      Math.min(restaurantLat, customerLat) - padding,
      Math.max(restaurantLng, customerLng) + padding,
      Math.max(restaurantLat, customerLat) + padding,
    ].join(","),
    layer: "mapnik",
    marker: `${customerLat},${customerLng}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

export function createMapOptions(container, endpoints = createMapEndpoints()) {
  return {
    container,
    style: "https://tiles.openfreemap.org/styles/positron",
    center: endpoints.restaurant.coordinates,
    zoom: 14.4,
    attributionControl: { compact: true },
    interactive: true,
  };
}
