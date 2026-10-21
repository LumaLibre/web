import type {StoreCategory, StorePackage} from "./model/Tebex.ts";

export function isSidebarCategory(category: StoreCategory): boolean {
    const hidden = category.hidden === true || category.hidden === 1 ||
        category.hidden === "true" || category.hidden === "1";
    // Tebex does not always include its navigation visibility flag in Headless.
    // The dedicated offers section should stay out of navigation in either form.
    const isLimitedOffers = [category.slug, category.name].some(value => {
        const normalized = value?.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normalized === "lto" || normalized === "limitedtimeoffers";
    });
    return !category.parent && !hidden && !isLimitedOffers;
}

export function limitedOfferPackages(category?: StoreCategory | null): StorePackage[] {
    return [...(category?.packages ?? [])].sort((a, b) => a.order - b.order || a.id - b.id).slice(0, 3);
}
