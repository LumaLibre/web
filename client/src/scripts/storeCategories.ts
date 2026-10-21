import type {StoreCategory, StorePackage} from "./model/Tebex.ts";

export function isSidebarCategory(category: StoreCategory): boolean {
    const hidden = category.hidden === true || category.hidden === 1 ||
        category.hidden === "true" || category.hidden === "1";
    return !category.parent && !hidden && category.slug?.replace(/^\/+|\/+$/g, "").toLowerCase() !== "lto";
}

export function limitedOfferPackages(category?: StoreCategory | null): StorePackage[] {
    return [...(category?.packages ?? [])].sort((a, b) => a.order - b.order || a.id - b.id).slice(0, 3);
}
