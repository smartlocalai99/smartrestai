import { AddressProvider } from "@/context/AddressContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MenuDataProvider } from "@/context/MenuDataContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { PaymentProvider } from "@/context/PaymentContext";
import StartupGate from "@/components/customer/StartupGate";

const providers = [
  MenuDataProvider,
  AuthProvider,
  CartProvider,
  FavoritesProvider,
  OrdersProvider,
  AddressProvider,
  PaymentProvider,
];

export default function AppProviders({ children }) {
  return providers.reduceRight(
    (tree, Provider) => <Provider>{tree}</Provider>,
    <StartupGate>{children}</StartupGate>
  );
}
