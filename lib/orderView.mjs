const titleCaseStatus = (value) =>
  String(value || "preparing")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const finiteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export function formatRupees(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    finiteNumber(value)
  );
}

export function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function splitOrders(orders) {
  const sorted = Array.isArray(orders)
    ? [...orders].sort(
        (left, right) => new Date(right?.placedAt || 0) - new Date(left?.placedAt || 0)
      )
    : [];

  return {
    activeOrder: sorted[0] ?? null,
    previousOrders: sorted.slice(1),
  };
}

export function createOrderView(order = {}, accountPhone = "") {
  const itemRows = (Array.isArray(order.items) ? order.items : []).map((entry, index) => {
    const quantity = Math.max(0, finiteNumber(entry?.quantity));
    const unitPrice = finiteNumber(entry?.item?.price);

    return {
      key: entry?.item?.id ?? `${order.id || "order"}-${index}`,
      item: entry?.item ?? {},
      sectionTitle: entry?.sectionTitle ?? "",
      quantity,
      title: entry?.item?.title || "Item unavailable",
      unitPrice,
      lineTotal: quantity * unitPrice,
    };
  });
  const deliveryAddress = order.deliveryAddress || {};

  return {
    id: order.id || "Order",
    statusLabel: titleCaseStatus(order.status),
    placedAtLabel: formatOrderDate(order.placedAt),
    address: String(deliveryAddress.line || "").trim() || "Delivery address unavailable",
    contact:
      String(deliveryAddress.phone || "").trim() ||
      String(accountPhone || "").trim() ||
      "Contact unavailable",
    totalItems: finiteNumber(order.totalItems),
    total: finiteNumber(order.total),
    itemRows,
  };
}
