import { IoHeartOutline } from "react-icons/io5";
import AppShell from "@/components/customer/AppShell";
import EmptyState from "@/components/customer/EmptyState";
import PageHead from "@/components/customer/PageHead";
import { ProductCard } from "@/components/customer/ShopByCategories";
import TabPageHeader from "@/components/customer/TabPageHeader";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function Favorites() {
  const { isReady } = useRequireAuth();
  const { items } = useFavorites();
  const { cart, changeQuantity } = useCart();

  if (!isReady) return null;

  return (
    <>
      <PageHead title="Favourites - SmartRest" />

      <AppShell>
        <div className="min-h-full bg-white">
          <TabPageHeader title="Favourites" subtitle="Dishes you've saved for later" />

          {items.length === 0 ? (
            <EmptyState
              icon={IoHeartOutline}
              title="No favourites yet"
              message="Tap the heart on any dish while browsing the menu to save it here."
              ctaLabel="Explore the menu"
              ctaHref="/"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 px-4 pb-10 pt-2">
              {items.map(({ item, sectionTitle }) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  sectionTitle={sectionTitle}
                  quantity={cart[item.id]?.quantity || 0}
                  onIncrement={() =>
                    changeQuantity(item, (cart[item.id]?.quantity || 0) + 1, sectionTitle)
                  }
                  onDecrement={() =>
                    changeQuantity(item, (cart[item.id]?.quantity || 0) - 1, sectionTitle)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </>
  );
}
