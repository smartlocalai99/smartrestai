import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeAddressSheet from "@/components/customer/HomeAddressSheet";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  setDefault: vi.fn(),
  onClose: vi.fn(),
  auth: { isLoggedIn: true },
  addresses: {
    addresses: [
      { id: "home-1", label: "Home", line: "10 Main Road, Kadapa", isDefault: true },
      { id: "work-1", label: "Work", line: "20 Market Road", isDefault: false },
    ],
    defaultAddress: { id: "home-1", label: "Home", line: "10 Main Road, Kadapa", isDefault: true },
    isLoadingAddresses: false,
    isMutatingAddress: false,
    addressError: "",
  },
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mocks.auth,
}));

vi.mock("@/context/AddressContext", () => ({
  useAddresses: () => ({ ...mocks.addresses, setDefault: mocks.setDefault }),
}));

describe("HomeAddressSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.isLoggedIn = true;
    Object.assign(mocks.addresses, {
      addresses: [
        { id: "home-1", label: "Home", line: "10 Main Road, Kadapa", isDefault: true },
        { id: "work-1", label: "Work", line: "20 Market Road", isDefault: false },
      ],
      defaultAddress: {
        id: "home-1",
        label: "Home",
        line: "10 Main Road, Kadapa",
        isDefault: true,
      },
      isLoadingAddresses: false,
      isMutatingAddress: false,
      addressError: "",
    });
    mocks.setDefault.mockResolvedValue(undefined);
  });

  it("shows saved addresses and selects a new default before closing", async () => {
    render(<HomeAddressSheet onClose={mocks.onClose} />);

    expect(screen.getByText("10 Main Road, Kadapa")).toBeInTheDocument();
    const workAddress = screen.getByRole("radio", {
      name: "Work, 20 Market Road",
    });
    expect(workAddress).toHaveAttribute("aria-checked", "false");

    fireEvent.click(workAddress);

    await waitFor(() => expect(mocks.setDefault).toHaveBeenCalledWith("work-1"));
    await waitFor(() => expect(mocks.onClose).toHaveBeenCalledOnce());
  });

  it("shows Kadapa when no saved address is available", () => {
    mocks.addresses.addresses = [];
    mocks.addresses.defaultAddress = null;

    render(<HomeAddressSheet onClose={mocks.onClose} />);

    expect(screen.getByText("Kadapa")).toBeInTheDocument();
  });

  it("opens full address management only from the sheet action", async () => {
    render(<HomeAddressSheet onClose={mocks.onClose} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Add or manage addresses" })
    );

    expect(mocks.push).toHaveBeenCalledWith("/addresses");
    expect(mocks.onClose).toHaveBeenCalledOnce();
  });

  it("stays open when changing the default address fails", async () => {
    mocks.setDefault.mockRejectedValue(new Error("failed"));

    render(<HomeAddressSheet onClose={mocks.onClose} />);
    fireEvent.click(
      screen.getByRole("radio", { name: "Work, 20 Market Road" })
    );

    await waitFor(() => expect(mocks.setDefault).toHaveBeenCalledWith("work-1"));
    expect(mocks.onClose).not.toHaveBeenCalled();
  });
});
