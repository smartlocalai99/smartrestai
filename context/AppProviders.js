import { AddressProvider } from "@/context/AddressContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { PaymentProvider } from "@/context/PaymentContext";

const providers = [
  AuthProvider,
  CartProvider,
  FavoritesProvider,
  OrdersProvider,
  AddressProvider,
  PaymentProvider,
];

export default function AppProviders({ children }) {
  return providers.reduceRight((tree, Provider) => <Provider>{tree}</Provider>, children);
}
