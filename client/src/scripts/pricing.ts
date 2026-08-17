import {StorePackage} from "@/scripts/model/Tebex.ts";

export interface PackagePricing {
    current: number;
    original: number | null;
    percentOff: number | null;
    currency: string;
}

/**
 * Tebex does not document whether `base_price` is pre- or post-sale, so the
 * original is derived from what is paid plus the reported saving.
 * @returns `original` is null when the package is not discounted.
 */
export function pricingOf(storePackage: StorePackage): PackagePricing {
    const current = storePackage.total_price;
    const currency = storePackage.currency;
    const discount = storePackage.discount ?? 0;

    if (discount <= 0) {
        return {current, original: null, percentOff: null, currency};
    }

    const derived = +(current + discount).toFixed(2);
    const original = storePackage.base_price > derived ? storePackage.base_price : derived;

    if (!(original > current)) {
        return {current, original: null, percentOff: null, currency};
    }

    return {
        current,
        original,
        percentOff: Math.round(((original - current) / original) * 100),
        currency
    };
}
