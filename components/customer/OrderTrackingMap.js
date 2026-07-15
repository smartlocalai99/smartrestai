import { useEffect, useRef, useState } from "react";
import {
  CUSTOMER_POINT,
  RESTAURANT,
  createMapOptions,
  createVisualRoute,
} from "@/lib/orderTrackingMap.mjs";

function markerElement(className, label) {
  const marker = document.createElement("div");
  marker.className = className;
  marker.setAttribute("aria-label", label);
  return marker;
}

export default function OrderTrackingMap({ destinationLabel }) {
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    let active = true;
    let map;

    import("maplibre-gl")
      .then(({ default: maplibregl }) => {
        if (!active || !containerRef.current) return;

        map = new maplibregl.Map(createMapOptions(containerRef.current));
        map.on("error", () => {
          if (active) setFailed(true);
        });
        map.on("load", () => {
          if (!active) return;

          map.addSource("delivery-route", {
            type: "geojson",
            data: createVisualRoute(),
          });
          map.addLayer({
            id: "delivery-route-outline",
            type: "line",
            source: "delivery-route",
            paint: {
              "line-color": "#ffffff",
              "line-width": 8,
              "line-opacity": 0.85,
            },
          });
          map.addLayer({
            id: "delivery-route",
            type: "line",
            source: "delivery-route",
            paint: {
              "line-color": "#b63b2d",
              "line-width": 5,
            },
          });

          new maplibregl.Marker({
            element: markerElement(
              "order-map-marker order-map-marker--restaurant",
              RESTAURANT.name
            ),
          })
            .setLngLat(RESTAURANT.coordinates)
            .addTo(map);

          new maplibregl.Marker({
            element: markerElement(
              "order-map-marker order-map-marker--customer",
              "Customer address"
            ),
          })
            .setLngLat(CUSTOMER_POINT)
            .addTo(map);
        });
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      map?.remove();
    };
  }, []);

  return (
    <div
      className={`relative h-[290px] overflow-hidden bg-[#ebe7e2] ${
        failed ? "order-map-fallback" : ""
      }`}
      aria-label={`Delivery map from ${RESTAURANT.name} to ${destinationLabel}`}
    >
      <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between gap-3 text-[10px] font-black">
        <span className="max-w-[46%] rounded-full bg-white/95 px-3 py-2 shadow">
          MANDI KING
        </span>
        <span className="max-w-[46%] truncate rounded-full bg-white/95 px-3 py-2 shadow">
          {destinationLabel}
        </span>
      </div>
      <span className="sr-only">Visual route only. Live rider tracking is not available.</span>
    </div>
  );
}
