import {
    TEBEX_BASKETS_ENDPOINT,
    TEBEX_HEADLESS_ENDPOINT,
    TEBEX_PUBLIC_TOKEN,
    STORE_CANCEL_URL,
    STORE_COMPLETE_URL
} from "@/constants.ts";
import {
    Basket,
    BasketAuthOption,
    CreateBasketOptions,
    SidebarModule,
    StoreCategory,
    StorePackage,
    Webstore
} from "@/scripts/model/Tebex.ts";

export const isStoreConfigured = (): boolean => TEBEX_PUBLIC_TOKEN.length > 0;

interface Envelope<T> {
    data: T;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    if (!isStoreConfigured()) {
        throw new Error("Tebex public token is missing.");
    }

    const response = await fetch(url, {
        ...init,
        headers: {
            Accept: "application/json",
            ...(init?.body ? {"Content-Type": "application/json"} : {}),
            ...init?.headers
        }
    });

    if (!response.ok) {
        let detail = "";
        try {
            const body = await response.json();
            detail = body?.title ?? body?.detail ?? body?.message ?? "";
        } catch {
        }
        const status = [response.status, response.statusText].filter(Boolean).join(" ");
        throw new Error(
            `Tebex request failed: ${status}${detail ? ` — ${detail}` : ""}`
        );
    }

    const json = (await response.json()) as Envelope<T>;
    return json.data;
}

export async function fetchWebstore(): Promise<Webstore> {
    return request<Webstore>(`${TEBEX_HEADLESS_ENDPOINT}/`);
}

export async function fetchSidebar(): Promise<SidebarModule[]> {
    return request<SidebarModule[]>(`${TEBEX_HEADLESS_ENDPOINT}/sidebar`);
}

export async function fetchCategories(basketIdent?: string): Promise<StoreCategory[]> {
    const params = new URLSearchParams({includePackages: "1"});
    if (basketIdent) {
        params.set("basketIdent", basketIdent);
    }
    return request<StoreCategory[]>(`${TEBEX_HEADLESS_ENDPOINT}/categories?${params}`);
}

export async function fetchCategory(
    categoryId: number,
    basketIdent?: string
): Promise<StoreCategory> {
    const params = new URLSearchParams({includePackages: "1"});
    if (basketIdent) {
        params.set("basketIdent", basketIdent);
    }
    return request<StoreCategory>(
        `${TEBEX_HEADLESS_ENDPOINT}/categories/${categoryId}?${params}`
    );
}

export async function fetchPackages(basketIdent?: string): Promise<StorePackage[]> {
    const params = new URLSearchParams();
    if (basketIdent) {
        params.set("basketIdent", basketIdent);
    }
    const query = params.toString();
    return request<StorePackage[]>(
        `${TEBEX_HEADLESS_ENDPOINT}/packages${query ? `?${query}` : ""}`
    );
}

export async function fetchPackage(
    packageId: number,
    basketIdent?: string
): Promise<StorePackage> {
    const params = new URLSearchParams();
    if (basketIdent) {
        params.set("basketIdent", basketIdent);
    }
    const query = params.toString();
    return request<StorePackage>(
        `${TEBEX_HEADLESS_ENDPOINT}/packages/${packageId}${query ? `?${query}` : ""}`
    );
}

/**
 * Creates a basket for checkout.
 * @param options Minecraft stores require `username`; Tebex rejects unknown Mojang names.
 */
export async function createBasket(options: CreateBasketOptions = {}): Promise<Basket> {
    return request<Basket>(`${TEBEX_HEADLESS_ENDPOINT}/baskets`, {
        method: "POST",
        body: JSON.stringify({
            complete_url: STORE_COMPLETE_URL,
            cancel_url: STORE_CANCEL_URL,
            complete_auto_redirect: true,
            ...options
        })
    });
}

export async function fetchBasket(ident: string): Promise<Basket> {
    return request<Basket>(`${TEBEX_HEADLESS_ENDPOINT}/baskets/${ident}`);
}

/**
 * Fetches the sign-in providers for a basket. Returns a bare array, not a `data` envelope.
 * @returns An empty array when the store needs no authorization.
 */
export async function fetchBasketAuthOptions(
    ident: string,
    returnUrl: string
): Promise<BasketAuthOption[]> {
    const url =
        `${TEBEX_HEADLESS_ENDPOINT}/baskets/${ident}/auth` +
        `?returnUrl=${encodeURIComponent(returnUrl)}`;

    const response = await fetch(url, {headers: {Accept: "application/json"}});
    if (!response.ok) {
        throw new Error(
            `Failed to fetch basket auth options: ${response.status} ${response.statusText}`
        );
    }
    return (await response.json()) as BasketAuthOption[];
}

/**
 * Adds a package to the basket.
 * @param targetUsername Gifts the package to this player instead of the buyer.
 * @param variableData Values for the package's required options; without them Tebex 400s.
 */
export async function addPackageToBasket(
    ident: string,
    packageId: number,
    quantity = 1,
    targetUsername?: string,
    variableData?: Record<string, string>
): Promise<Basket> {
    return request<Basket>(`${TEBEX_BASKETS_ENDPOINT}/${ident}/packages`, {
        method: "POST",
        body: JSON.stringify({
            package_id: packageId,
            quantity,
            ...(targetUsername ? {target_username: targetUsername} : {}),
            ...(variableData && Object.keys(variableData).length ? {variable_data: variableData} : {})
        })
    });
}

export async function removePackageFromBasket(
    ident: string,
    packageId: number
): Promise<Basket> {
    return request<Basket>(`${TEBEX_BASKETS_ENDPOINT}/${ident}/packages/remove`, {
        method: "POST",
        body: JSON.stringify({package_id: packageId})
    });
}

export async function updateBasketPackageQuantity(
    ident: string,
    packageId: number,
    quantity: number
): Promise<Basket> {
    return request<Basket>(`${TEBEX_BASKETS_ENDPOINT}/${ident}/packages/${packageId}`, {
        method: "PUT",
        body: JSON.stringify({quantity})
    });
}

export async function applyCoupon(ident: string, couponCode: string): Promise<Basket> {
    return request<Basket>(`${TEBEX_HEADLESS_ENDPOINT}/baskets/${ident}/coupons`, {
        method: "POST",
        body: JSON.stringify({coupon_code: couponCode})
    });
}

export async function removeCoupon(ident: string, couponCode: string): Promise<Basket> {
    return request<Basket>(`${TEBEX_HEADLESS_ENDPOINT}/baskets/${ident}/coupons/remove`, {
        method: "POST",
        body: JSON.stringify({coupon_code: couponCode})
    });
}

export async function applyGiftCard(ident: string, cardNumber: string): Promise<Basket> {
    return request<Basket>(`${TEBEX_HEADLESS_ENDPOINT}/baskets/${ident}/giftcards`, {
        method: "POST",
        body: JSON.stringify({card_number: cardNumber})
    });
}

export async function removeGiftCard(ident: string, cardNumber: string): Promise<Basket> {
    return request<Basket>(`${TEBEX_HEADLESS_ENDPOINT}/baskets/${ident}/giftcards/remove`, {
        method: "POST",
        body: JSON.stringify({card_number: cardNumber})
    });
}

export function formatPrice(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat(undefined, {style: "currency", currency}).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
}
