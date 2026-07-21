import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VegModeToggle from "@/components/customer/VegModeToggle";

vi.mock("next/image", () => ({
  default: ({ fill, unoptimized, alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      data-fill={String(fill)}
      data-unoptimized={String(unoptimized)}
      {...props}
    />
  ),
}));

describe("VegModeToggle", () => {
  it("shows only the non-veg image and label, and requests veg mode when tapped", () => {
    const onChange = vi.fn();
    render(<VegModeToggle vegOnly={false} onChange={onChange} />);

    const toggle = screen.getByRole("switch", { name: "Switch to vegetarian menu" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByAltText("Non-veg menu")).toHaveAttribute("src", "/nonveg.webp");
    expect(screen.queryByAltText("Vegetarian menu")).not.toBeInTheDocument();
    expect(screen.getByText("Non-veg")).toBeInTheDocument();
    expect(screen.getByTestId("veg-toggle-selector")).toHaveAttribute(
      "data-position",
      "left"
    );

    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("shows only the veg image and label, and requests the full menu when tapped", () => {
    const onChange = vi.fn();
    render(<VegModeToggle vegOnly onChange={onChange} />);

    const toggle = screen.getByRole("switch", { name: "Switch to full menu" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(screen.getByAltText("Vegetarian menu")).toHaveAttribute("src", "/veg.webp");
    expect(screen.queryByAltText("Non-veg menu")).not.toBeInTheDocument();
    expect(screen.getByText("Veg")).toBeInTheDocument();
    expect(screen.getByTestId("veg-toggle-selector")).toHaveAttribute(
      "data-position",
      "right"
    );

    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
