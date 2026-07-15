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
  const isEmpty = items.length === 0;

  if (!isReady) return null;

  return (
    <>
      <PageHead title="Favourites - SmartRest" />

      <AppShell contentClassName={isEmpty ? "bg-[#f6f6f6]" : ""}>
        <div
          className={`flex min-h-full flex-col ${
            items.length === 0 ? "bg-[#f6f6f6]" : "bg-white"
          }`}
        >
          <TabPageHeader title="Favourites" subtitle="Dishes you've saved for later" />

          {isEmpty ? (
            <EmptyState
              imageSrc="/emptyplate.webp"
              imageAlt="Empty MANDI KING serving plate"
              title="Save room for your favourites"
              message="Tap the heart on dishes you love and they’ll be waiting for you here."
              ctaLabel="Discover dishes"
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
