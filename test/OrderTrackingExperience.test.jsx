import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OrderTrackingExperience from "@/components/customer/OrderTrackingExperience";

vi.mock("next/image", () => ({
  default: ({ fill, alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));
vi.mock("next/router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/customer/OrderTrackingMap", () => ({
  default: ({ destination, restaurant }) => (
    <div aria-label={`map from ${restaurant?.name} to ${destination?.line}`} />
  ),
}));

const makeOrder = (id, placedAt, title, address, status = "preparing") => ({
  id,
  placedAt,
  status,
  orderedAt: placedAt,
  pickedUpAt: null,
  deliveredAt: null,
  totalItems: 2,
  total: 560,
  deliveryAddress: { line: address, phone: "9876543210" },
  items: [
    {
      quantity: 2,
      sectionTitle: "Mandi",
      item: { id, title, price: 260, imageUrl: `/${id.toLowerCase()}.webp` },
    },
  ],
});

describe("OrderTrackingExperience", () => {
  it("shows current tracking by default and switches to detailed previous orders", () => {
    render(
      <OrderTrackingExperience
        accountPhone="9000000000"
        restaurantProfile={{ name: "Mandi Kings", lat: 14.48, lng: 78.82 }}
        orders={[
          makeOrder(
            "OLD",
            "2026-07-14T10:00:00.000Z",
            "Old Mandi",
            "Old address",
            "delivered"
          ),
          makeOrder(
            "NEW",
            "2026-07-15T10:00:00.000Z",
            "Chicken Mandi",
            "Customer home"
          ),
        ]}
      />
    );

    expect(screen.getByText("Ravi Kumar")).toBeInTheDocument();
    expect(
      screen.getByLabelText("map from Mandi Kings to Customer home")
    ).toBeInTheDocument();
    expect(screen.getByText("2 Chicken Mandi")).toBeInTheDocument();
    expect(screen.getByText("₹520")).toBeInTheDocument();
    expect(screen.getByText("Delivery charges")).toBeInTheDocument();
    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(screen.getByText("Ordered")).toBeInTheDocument();
    expect(screen.getByText("Picked up")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getAllByText("Pending")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "Current Order" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.queryByText("Order #OLD")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Previous Orders" }));

    expect(screen.getByRole("tabpanel")).toHaveClass("bg-[#f5f5f5]");

    const history = screen.getByRole("region", { name: "Previous Orders" });
    expect(within(history).getByText("Old Mandi")).toBeInTheDocument();
    expect(within(history).getByText("Order #OLD")).toBeInTheDocument();
    expect(within(history).getByAltText("Old Mandi")).toHaveAttribute("src", "/old.webp");
    expect(within(history).getByText("Bill amount")).toBeInTheDocument();
    expect(within(history).getByText("₹560")).toBeInTheDocument();
    expect(screen.queryByText("Ravi Kumar")).not.toBeInTheDocument();
  });

  it("keeps the previous tab visible and shows the plate state without history", () => {
    render(
      <OrderTrackingExperience
        orders={[
          makeOrder("NEW", "2026-07-15T10:00:00.000Z", "Chicken Mandi", "Home")
        ]}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: "Previous Orders" }));

    expect(screen.getByAltText("Empty MANDI KING serving plate")).toHaveAttribute(
      "src",
      "/emptyplate.webp"
    );
    expect(screen.getByText("No previous orders yet")).toBeInTheDocument();
  });

  it("shows previous orders directly without tabs when there is no current order", () => {
    render(
      <OrderTrackingExperience
        orders={[
          makeOrder(
            "PAST-24",
            "2026-07-14T10:00:00.000Z",
            "Mutton Mandi",
            "Old address",
            "delivered"
          ),
        ]}
      />
    );

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByTestId("previous-orders-surface")).toHaveClass("bg-[#f5f5f5]");
    expect(screen.getByRole("heading", { name: "Previous Orders" })).toBeInTheDocument();
    expect(screen.getByText("Order #PAST-24")).toBeInTheDocument();
  });
});
