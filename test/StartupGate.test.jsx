import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StartupGate from "@/components/customer/StartupGate";

const readiness = vi.hoisted(() => ({
  menuLoading: true,
  authHydrated: false,
  cartHydrated: false,
  favoritesHydrated: false,
  addressesLoading: true,
  paymentHydrated: false,
}));

vi.mock("@/context/MenuDataContext", () => ({
  useMenuData: () => ({ isLoading: readiness.menuLoading }),
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ isHydrated: readiness.authHydrated }),
}));
vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ isHydrated: readiness.cartHydrated }),
}));
vi.mock("@/context/FavoritesContext", () => ({
  useFavorites: () => ({ isHydrated: readiness.favoritesHydrated }),
}));
vi.mock("@/context/AddressContext", () => ({
  useAddresses: () => ({ isLoadingAddresses: readiness.addressesLoading }),
}));
vi.mock("@/context/PaymentContext", () => ({
  usePayment: () => ({ isHydrated: readiness.paymentHydrated }),
}));
vi.mock("next/image", () => ({
  default: ({ preload, unoptimized, alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      data-preload={String(preload)}
      data-unoptimized={String(unoptimized)}
      {...props}
    />
  ),
}));

const setReady = () =>
  Object.assign(readiness, {
    menuLoading: false,
    authHydrated: true,
    cartHydrated: true,
    favoritesHydrated: true,
    addressesLoading: false,
    paymentHydrated: true,
  });

describe("StartupGate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(readiness, {
      menuLoading: true,
      authHydrated: false,
      cartHydrated: false,
      favoritesHydrated: false,
      addressesLoading: true,
      paymentHydrated: false,
    });
    window.matchMedia = vi.fn(() => ({ matches: false }));
  });

  afterEach(() => vi.useRealTimers());

  it("covers and disables the mounted app while startup is pending", () => {
    render(
      <StartupGate>
        <button>Open menu</button>
      </StartupGate>
    );

    expect(
      screen.getByRole("status", { name: "Loading Mandi Kings" })
    ).toBeInTheDocument();
    expect(screen.getByAltText("Mandi Kings")).toHaveAttribute(
      "src",
      "/applogo.jpeg"
    );
    expect(screen.getByAltText("Mandi Kings")).toHaveAttribute(
      "data-preload",
      "true"
    );
    expect(screen.getByAltText("Mandi Kings")).toHaveAttribute(
      "data-unoptimized",
      "true"
    );
    expect(
      screen.getByRole("button", { name: "Open menu", hidden: true }).parentElement
    ).toHaveAttribute("inert");
  });

  it("keeps the splash until the cached logo paints and the minimum time passes", () => {
    const view = render(
      <StartupGate>
        <button>Open menu</button>
      </StartupGate>
    );
    setReady();
    view.rerender(
      <StartupGate>
        <button>Open menu</button>
      </StartupGate>
    );

    act(() => vi.advanceTimersByTime(900));
    expect(
      screen.getByRole("status", { name: "Loading Mandi Kings" })
    ).not.toHaveClass("startup-splash--exiting");

    fireEvent.load(screen.getByAltText("Mandi Kings"));
    act(() => vi.advanceTimersByTime(0));
    expect(
      screen.getByRole("status", { name: "Loading Mandi Kings" })
    ).toHaveClass("startup-splash--exiting");
  });

  it("fades out after startup and never returns", () => {
    const view = render(
      <StartupGate>
        <button>Open menu</button>
      </StartupGate>
    );
    setReady();
    view.rerender(
      <StartupGate>
        <button>Open menu</button>
      </StartupGate>
    );
    fireEvent.load(screen.getByAltText("Mandi Kings"));
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(0));
    act(() => vi.advanceTimersByTime(250));
    expect(
      screen.queryByRole("status", { name: "Loading Mandi Kings" })
    ).not.toBeInTheDocument();

    readiness.menuLoading = true;
    view.rerender(
      <StartupGate>
        <button>Open menu</button>
      </StartupGate>
    );
    expect(
      screen.queryByRole("status", { name: "Loading Mandi Kings" })
    ).not.toBeInTheDocument();
  });

  it("reveals the app after the eight-second fail-safe", () => {
    render(
      <StartupGate>
        <button>Open menu</button>
      </StartupGate>
    );
    act(() => vi.advanceTimersByTime(8000));
    act(() => vi.advanceTimersByTime(250));
    expect(
      screen.queryByRole("status", { name: "Loading Mandi Kings" })
    ).not.toBeInTheDocument();
  });

  it("skips the exit animation when reduced motion is requested", () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    const view = render(
      <StartupGate>
        <button>Open menu</button>
      </StartupGate>
    );
    setReady();
    view.rerender(
      <StartupGate>
        <button>Open menu</button>
      </StartupGate>
    );
    fireEvent.load(screen.getByAltText("Mandi Kings"));
    act(() => vi.advanceTimersByTime(900));
    act(() => vi.advanceTimersByTime(0));
    expect(
      screen.queryByRole("status", { name: "Loading Mandi Kings" })
    ).not.toBeInTheDocument();
  });
});
