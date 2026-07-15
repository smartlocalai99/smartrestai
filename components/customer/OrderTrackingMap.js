import { useEffect, useRef, useState } from "react";
import {
  CUSTOMER_POINT,
  RESTAURANT,
  createFallbackMapUrl,
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
  const [mapStatus, setMapStatus] = useState("loading");

  useEffect(() => {
    if (!containerRef.current) return undefined;

    let active = true;
    let map;
    let resizeObserver;
    const loadTimeout = window.setTimeout(() => {
      if (active) setMapStatus("failed");
    }, 8000);

    import("maplibre-gl")
      .then(({ default: maplibregl }) => {
        if (!active || !containerRef.current) return;

        map = new maplibregl.Map(createMapOptions(containerRef.current));
        map.on("error", () => {
          if (active && !map.loaded()) setMapStatus("failed");
        });
        map.on("load", () => {
          if (!active) return;

          window.clearTimeout(loadTimeout);
          setMapStatus("ready");

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

          map.fitBounds([RESTAURANT.coordinates, CUSTOMER_POINT], {
            padding: 54,
            duration: 0,
            maxZoom: 15.5,
          });
        });

        resizeObserver = new ResizeObserver(() => map?.resize());
        resizeObserver.observe(containerRef.current);
      })
      .catch(() => {
        if (active) setMapStatus("failed");
      });

    return () => {
      active = false;
      window.clearTimeout(loadTimeout);
      resizeObserver?.disconnect();
      map?.remove();
    };
  }, []);

  const failed = mapStatus === "failed";

  return (
    <div
      className="relative h-[290px] overflow-hidden bg-[#ebe7e2]"
      aria-label={`Delivery map from ${RESTAURANT.name} to ${destinationLabel}`}
    >
      <div
        ref={containerRef}
        className={`absolute inset-0 ${failed ? "invisible" : ""}`}
        aria-hidden="true"
      />

      {failed ? (
        <>
          <iframe
            title={`OpenStreetMap delivery map to ${destinationLabel}`}
            src={createFallbackMapUrl()}
            className="absolute inset-0 h-full w-full border-0"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 430 290"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <path
              d="M112 210 L164 146 L270 152 L326 82"
              fill="none"
              stroke="white"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M112 210 L164 146 L270 152 L326 82"
              fill="none"
              stroke="#b63b2d"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      ) : null}

      {mapStatus === "loading" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#ebe7e2]">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#32120d]/20 border-t-[#32120d]" />
        </div>
      ) : null}

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
