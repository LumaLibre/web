
export interface Webstore {
    id: number;
    name: string;
    description: string;
    webstore_url: string;
    currency: string;
    lang: string;
    logo: string | null;
    platform_type: string;
    platform_type_id: string;
    created_at: string;
    disabled: boolean | string;
    supports_usernames: boolean | string;
    supports_gifting: boolean | string;
}

export interface RecentPayment {
    username: string;
    username_id: string;
    avatar_url: string;
}

export interface SidebarModule {
    id: number;
    type: string;
    start_time: string | null;
    end_time: string | null;
    data: {
        header?: string;
        payments?: RecentPayment[];
    };
}

export interface PackageOption {
    name: string;
    description: string;
    type: string;
    required: boolean;
}

export interface PackageMedia {
    type: "video" | "image";
    name: string | null;
    url: string;
    featured: boolean;
    primary: boolean;
}

export interface StorePackage {
    id: number;
    name: string;
    description: string;
    image: string | null;
    type: "single" | "subscription";
    category: { id: number; name: string };
    base_price: number;
    sales_tax: number;
    total_price: number;
    currency: string;
    discount: number;
    disable_quantity: boolean;
    disable_gifting: boolean;
    expiration_date: string | null;
    media?: PackageMedia[];
    options?: PackageOption[];
    order: number;
    slug: string;
    user_limit: number;
    created_at: string;
    updated_at: string;
}

export interface StoreCategory {
    id: number;
    name: string;
    slug: string | null;
    parent: StoreCategory | null;
    tiered: boolean;
    description: string;
    packages: StorePackage[] | null;
    order: number;
    display_type: "list" | "grid";
    image_url: string | null;
    dynamic: boolean;
}

export interface BasketPackage {
    id: number;
    name: string;
    description: string;
    image: string;
    slug: string;
    type: "single" | "subscription";
    in_basket: {
        quantity: number;
        price: number;
        gift_username_id: string | null;
        gift_username: string | null;
    };
}

export interface BasketLinks {
    checkout?: string;
    payment?: string;
}

export interface Basket {
    id: string;
    ident: string;
    complete: boolean;
    email: string | null;
    username: string | null;
    username_id: number | null;
    coupons: { code: string }[];
    giftcards: { card_number: string }[];
    creator_code: string;
    cancel_url: string;
    complete_url: string | null;
    complete_auto_redirect: boolean;
    country: string;
    ip: string;
    base_price: number;
    sales_tax: number;
    total_price: number;
    currency: string;
    packages: BasketPackage[];
    custom: Record<string, unknown> | null;
    links: BasketLinks;
}

export interface BasketAuthOption {
    name: string;
    url: string;
}

export interface CreateBasketOptions {
    username?: string;
    complete_url?: string;
    cancel_url?: string;
    custom?: Record<string, unknown>;
    complete_auto_redirect?: boolean;
}
