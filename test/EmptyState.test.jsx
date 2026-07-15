import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IoHeartOutline } from "react-icons/io5";
import EmptyState from "@/components/customer/EmptyState";

const push = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("next/image", () => ({
  default: ({ fill, priority, alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe("EmptyState", () => {
  it("renders branded artwork and follows the CTA destination", () => {
    render(
      <EmptyState
        imageSrc="/emptyplate.webp"
        imageAlt="Empty MANDI KING serving plate"
        title="Your first feast awaits"
        message="Place your first order and follow every delicious detail from our kitchen to your doorstep."
        ctaLabel="Start your order"
        ctaHref="/"
      />
    );

    const plate = screen.getByAltText("Empty MANDI KING serving plate");
    const artwork = plate.parentElement;
    const emptyState = artwork.parentElement;

    expect(plate).toHaveAttribute("src", "/emptyplate.webp");
    expect(emptyState).toHaveClass("bg-[#f6f6f6]");
    expect(artwork.className).not.toMatch(/border|shadow|blur|before:/);
    expect(screen.getByText("Your first feast awaits")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start your order" }));
    expect(push).toHaveBeenCalledWith("/");
  });

  it("keeps the existing icon variant for non-food empty states", () => {
    render(
      <EmptyState icon={IoHeartOutline} title="No addresses" message="Add an address." />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("No addresses")).toBeInTheDocument();
  });
});
