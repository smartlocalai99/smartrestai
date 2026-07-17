import { useRouter } from "next/router";
import AppShell from "@/components/customer/AppShell";
import EmptyState from "@/components/customer/EmptyState";
import PageHead from "@/components/customer/PageHead";
import { ProductCard } from "@/components/customer/ShopByCategories";
import TabPageHeader from "@/components/customer/TabPageHeader";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";

export default function Favorites() {
  const router = useRouter();
  const { isLoggedIn, isHydrated } = useAuth();
  const { items } = useFavorites();
  const { cart, changeQuantity } = useCart();
  const isEmpty = items.length === 0;

  if (!isHydrated) return null;

  if (!isLoggedIn) {
    return (
      <>
        <PageHead title="Favourites - SmartRest" />
        <AppShell contentClassName="bg-[#f6f6f6]">
          <div className="flex min-h-full flex-col bg-[#f6f6f6]">
            <TabPageHeader title="Favourites" subtitle="Dishes you've saved for later" />
            <EmptyState
              imageSrc="/emptyplate.webp"
              imageAlt="Empty serving plate"
              title="You haven't logged in"
              message="Please log in to view your favourites."
              ctaLabel="Log in with Mobile Number"
              ctaHref={`/login?redirect=${encodeURIComponent(router.asPath)}`}
            />
          </div>
        </AppShell>
      </>
    );
  }

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
