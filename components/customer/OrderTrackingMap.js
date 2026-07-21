import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createFallbackMapUrl,
  createMapEndpoints,
  createMapOptions,
  createVisualRoute,
} from "@/lib/orderTrackingMap.mjs";

const HOME_ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M3 11.5L12 4l9 7.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M5.5 10v8.5a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1V10" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
  "</svg>";

function markerElement(className, label, { imageSrc = "", iconSvg = "" } = {}) {
  const marker = document.createElement("div");
  marker.className = className;
  marker.setAttribute("aria-label", label);

  if (imageSrc) {
    const image = document.createElement("img");
    image.src = imageSrc;
    image.alt = label;
    marker.appendChild(image);
  } else if (iconSvg) {
    marker.innerHTML = iconSvg;
  }

  return marker;
}

export default function OrderTrackingMap({ destination = {}, restaurant = {} }) {
  const containerRef = useRef(null);
  const [mapStatus, setMapStatus] = useState("loading");
  // Depend on the primitive fields actually used by createMapEndpoints, not
  // the destination/restaurant object references — those are fresh objects
  // on every menu/order refetch even when nothing relevant changed, which
  // was tearing down and rebuilding the whole map on a timer.
  const endpoints = useMemo(
    () => createMapEndpoints({ destination, restaurant }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      destination.lat,
      destination.lng,
      destination.line,
      destination.label,
      restaurant.lat,
      restaurant.lng,
      restaurant.name,
      restaurant.addressLine,
      restaurant.address,
    ]
  );

  useEffect(() => {
    if (!containerRef.current) return undefined;

    let active = true;
    let map;
    let resizeObserver;
    setMapStatus("loading");

    const loadTimeout = window.setTimeout(() => {
      if (active) setMapStatus("failed");
    }, 4500);

    import("maplibre-gl")
      .then(({ default: maplibregl }) => {
        if (!active || !containerRef.current) return;

        map = new maplibregl.Map(createMapOptions(containerRef.current, endpoints));
        map.on("error", () => {
          if (active && !map.loaded()) setMapStatus("failed");
        });
        map.on("load", () => {
          if (!active) return;

          window.clearTimeout(loadTimeout);
          setMapStatus("ready");

          map.addSource("delivery-route", {
            type: "geojson",
            data: createVisualRoute(endpoints),
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
              `${endpoints.restaurant.name} restaurant`,
              { imageSrc: "/applogo.jpeg" }
            ),
          })
            .setLngLat(endpoints.restaurant.coordinates)
            .addTo(map);

          new maplibregl.Marker({
            element: markerElement(
              "order-map-marker order-map-marker--customer",
              "Customer address",
              { iconSvg: HOME_ICON_SVG }
            ),
          })
            .setLngLat(endpoints.customer.coordinates)
            .addTo(map);

          map.fitBounds(
            [endpoints.restaurant.coordinates, endpoints.customer.coordinates],
            { padding: 54, duration: 0, maxZoom: 15.5 }
          );
        });

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => map?.resize());
          resizeObserver.observe(containerRef.current);
        }
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
  }, [endpoints]);

  const ready = mapStatus === "ready";

  return (
    <div
      className="relative h-[290px] overflow-hidden bg-[#ebe7e2]"
      aria-label={`Delivery map from ${endpoints.restaurant.name} to ${endpoints.customer.label}`}
    >
      <iframe
        title={`OpenStreetMap delivery map to ${endpoints.customer.label}`}
        src={createFallbackMapUrl(endpoints)}
        className="absolute inset-0 h-full w-full border-0"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
      />

      <div
        ref={containerRef}
        className={`absolute inset-0 transition-opacity duration-300 ${
          ready ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {!ready ? (
        <div className="pointer-events-none absolute inset-0">
          <svg
            aria-hidden="true"
            viewBox="0 0 430 290"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
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
          <span className="order-map-fallback-marker order-map-fallback-marker--restaurant">
            <Image
              src="/applogo.jpeg"
              alt={`${endpoints.restaurant.name} restaurant`}
              fill
              sizes="38px"
              className="object-cover"
            />
          </span>
          <span
            className="order-map-fallback-marker order-map-fallback-marker--customer"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: HOME_ICON_SVG }}
          />
        </div>
      ) : null}

      {mapStatus === "loading" ? (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-[#32120d] shadow">
          Loading live map…
        </span>
      ) : null}

      <span className="sr-only">
        Visual route from {endpoints.restaurant.name} to {endpoints.customer.label}. Live rider
        tracking is not available.
      </span>
    </div>
  );
}
