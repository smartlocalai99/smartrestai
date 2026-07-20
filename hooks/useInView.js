import { useEffect, useRef, useState } from "react";

export function getScrollParent(node) {
  let parent = node?.parentElement ?? null;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return null;
}

export default function useInView({ rootMargin = "600px", once = true } = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return undefined;
    }

    // The app shell scrolls inside a nested container, not the window, so
    // the default (viewport) root would clip everything below its own
    // fold regardless of rootMargin. Anchor to the real scroll ancestor.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { root: getScrollParent(el), rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return [ref, isInView];
}
