export function getCurrentCoords() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Location isn't available on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location access was denied. Enter your address manually."));
        } else {
          reject(new Error("Couldn't get your location. Enter it manually."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw new Error("Couldn't resolve that location to an address.");
  }

  const data = await response.json();
  if (!data?.display_name) {
    throw new Error("Couldn't resolve that location to an address.");
  }

  const address = data.address ?? {};
  const road = /^[A-Z]{2,4}\d+$/.test(address.road ?? "") ? "" : address.road;
  const landmark =
    address.suburb || address.neighbourhood || address.village || address.town || road || "";

  return { line: data.display_name, landmark };
}
