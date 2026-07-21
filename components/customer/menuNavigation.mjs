export const sectionId = (heading) =>
  `section-${heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;

export const createMenuNavigatorEntries = (recommendedItems, sections) => [
  { title: "Recommended", count: recommendedItems.length, badgeText: "" },
  ...sections.map((section) => ({
    title: section.heading,
    count: section.items.length,
    badgeText: section.badgeText || "",
  })),
];

export const createInitialOpenSections = (entries) =>
  Object.fromEntries(entries.map((entry) => [entry.title, true]));

export const expandSection = (openSections, title) => ({
  ...openSections,
  [title]: true,
});
