import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OrderTrackingExperience from "@/components/customer/OrderTrackingExperience";

vi.mock("next/image", () => ({
  default: ({ fill, alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));
vi.mock("@/components/customer/OrderTrackingMap", () => ({
  default: ({ destinationLabel }) => <div aria-label={`map to ${destinationLabel}`} />,
}));

const makeOrder = (id, placedAt, title, address) => ({
  id,
  placedAt,
  status: "preparing",
  totalItems: 2,
  total: 560,
  deliveryAddress: { line: address, phone: "9876543210" },
  items: [
    {
      quantity: 2,
      sectionTitle: "Mandi",
      item: { id, title, price: 260 },
    },
  ],
});

describe("OrderTrackingExperience", () => {
  it("renders newest order details and older orders separately", () => {
    render(
      <OrderTrackingExperience
        accountPhone="9000000000"
        orders={[
          makeOrder("OLD", "2026-07-14T10:00:00.000Z", "Old Mandi", "Old address"),
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
    expect(screen.getByLabelText("map to Customer home")).toBeInTheDocument();
    expect(screen.getByText("2 Chicken Mandi")).toBeInTheDocument();
    expect(screen.getByText("₹520")).toBeInTheDocument();

    const history = screen.getByRole("region", { name: "Previous Orders" });
    expect(within(history).getByText("Old Mandi")).toBeInTheDocument();
    expect(within(history).queryByText("Chicken Mandi")).not.toBeInTheDocument();
  });
});
