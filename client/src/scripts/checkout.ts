import Tebex from "@tebexio/tebex.js";
import {Basket, BasketAuthOption} from "@/scripts/model/Tebex.ts";
import {fetchBasketAuthOptions} from "@/scripts/tebex.ts";
import {HOST} from "@/constants.ts";

export const authReturnUrl = (): string => `${HOST}store?authed=1`;

export const isBasketAuthorized = (basket: Basket): boolean => basket.username !== null;

export async function getAuthOptions(basket: Basket): Promise<BasketAuthOption[]> {
    if (isBasketAuthorized(basket)) {
        return [];
    }
    return fetchBasketAuthOptions(basket.ident, authReturnUrl());
}

export function beginAuth(option: BasketAuthOption): void {
    window.location.href = option.url;
}

export interface LaunchOptions {
    onComplete?: () => void;
    onError?: (event: Event) => void;
    onClose?: () => void;
}

/**
 * Opens the Tebex.js payment panel.
 * Note: `payment:complete` is a UI signal only — the webhook is what confirms payment.
 */
export function launchCheckout(basket: Basket, options: LaunchOptions = {}): void {
    Tebex.checkout.init({
        ident: basket.ident,
        theme: "dark",
        colors: [
            {name: "primary", color: "#911AB0"},
            {name: "secondary", color: "#cdb8d0"}
        ],
        closeOnEsc: true,
        closeOnClickOutside: false
    });

    if (options.onComplete) {
        Tebex.checkout.on("payment:complete", options.onComplete);
    }
    if (options.onError) {
        Tebex.checkout.on("payment:error", options.onError);
    }
    if (options.onClose) {
        Tebex.checkout.on("close", options.onClose);
    }

    void Tebex.checkout.launch();
}
