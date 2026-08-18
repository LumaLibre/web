import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Basket} from "@/scripts/model/Tebex.ts";
import {
    addPackageToBasket,
    createBasket,
    fetchBasket,
    isStoreConfigured,
    removePackageFromBasket,
    updateBasketPackageQuantity,
    applyCoupon as applyCouponRequest,
    removeCoupon as removeCouponRequest
} from "@/scripts/tebex.ts";

export const BASKET_IDENT_KEY = "luma.store.basketIdent";
const USERNAME_KEY = "luma.store.username";

interface PendingAdd {
    packageId: number;
    quantity: number;
    targetUsername?: string;
    variableData?: Record<string, string>;
}

interface BasketContextValue {
    basket: Basket | null;
    username: string | null;
    loading: boolean;
    error: string | null;
    itemCount: number;
    awaitingUsername: boolean;
    setUsername: (username: string) => Promise<void>;
    changeUsername: () => void;
    cancelUsernamePrompt: () => void;
    completeBasket: () => void;
    addPackage: (
        packageId: number,
        quantity?: number,
        targetUsername?: string,
        variableData?: Record<string, string>
    ) => Promise<"added" | "queued" | "failed">;
    addedCount: number;
    removePackage: (packageId: number) => Promise<void>;
    setQuantity: (packageId: number, quantity: number) => Promise<void>;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: (code: string) => Promise<void>;
    refresh: () => Promise<void>;
}

const BasketContext = createContext<BasketContextValue | null>(null);

const readStored = (key: string): string | null => {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

const writeStored = (key: string, value: string | null) => {
    try {
        if (value) {
            window.localStorage.setItem(key, value);
        } else {
            window.localStorage.removeItem(key);
        }
    } catch {
    }
};

export function BasketProvider({children}: { children: React.ReactNode }) {
    const [basket, setBasket] = useState<Basket | null>(null);
    const [username, setUsernameState] = useState<string | null>(() => readStored(USERNAME_KEY));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);
    const [promptOpen, setPromptOpen] = useState(false);
    const [addedCount, setAddedCount] = useState(0);

    const adopt = useCallback((next: Basket) => {
        setBasket(next);
        writeStored(BASKET_IDENT_KEY, next.ident);
    }, []);

    useEffect(() => {
        if (!isStoreConfigured()) {
            setError("Store is not configured.");
            setLoading(false);
            return;
        }

        let cancelled = false;
        const restore = async () => {
            const storedIdent = readStored(BASKET_IDENT_KEY);
            if (storedIdent && username) {
                try {
                    const existing = await fetchBasket(storedIdent);
                    if (!cancelled && !existing.complete) {
                        adopt(existing);
                        setLoading(false);
                        return;
                    }
                } catch {
                }
                writeStored(BASKET_IDENT_KEY, null);
            }
            if (!cancelled) {
                setLoading(false);
            }
        };

        void restore();
        return () => {
            cancelled = true;
        };
    }, []);

    const setUsername = useCallback(async (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) {
            throw new Error("Enter your Minecraft username.");
        }

        setError(null);
        const created = await createBasket({username: trimmed});

        setUsernameState(trimmed);
        writeStored(USERNAME_KEY, trimmed);
        adopt(created);
        setPromptOpen(false);

        if (pendingAdd) {
            try {
                adopt(await addPackageToBasket(
                    created.ident,
                    pendingAdd.packageId,
                    pendingAdd.quantity,
                    pendingAdd.targetUsername,
                    pendingAdd.variableData
                ));
                setAddedCount(count => count + 1);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Could not add that package.");
            }
            setPendingAdd(null);
        }
    }, [adopt, pendingAdd]);

    const changeUsername = useCallback(() => {
        setError(null);
        setPromptOpen(true);
    }, []);

    // A paid basket still returns its packages, so it is dropped rather than refetched.
    const completeBasket = useCallback(() => {
        writeStored(BASKET_IDENT_KEY, null);
        setBasket(null);
        setPendingAdd(null);
        setError(null);
    }, []);

    const cancelUsernamePrompt = useCallback(() => {
        setPendingAdd(null);
        setPromptOpen(false);
    }, []);

    const mutate = useCallback(
        async (fn: (ident: string) => Promise<Basket>): Promise<boolean> => {
            if (!basket) {
                return false;
            }
            setError(null);
            try {
                adopt(await fn(basket.ident));
                return true;
            } catch (e) {
                setError(e instanceof Error ? e.message : "Something went wrong.");
                return false;
            }
        },
        [basket, adopt]
    );

    // A Minecraft basket is bound to a username at creation, so one is opened lazily.
    const addPackage = useCallback(async (
        packageId: number,
        quantity = 1,
        targetUsername?: string,
        variableData?: Record<string, string>
    ): Promise<"added" | "queued" | "failed"> => {
        let ident = basket?.ident ?? null;

        if (!ident) {
            if (!username) {
                setPendingAdd({packageId, quantity, targetUsername, variableData});
                return "queued";
            }

            setError(null);
            try {
                const created = await createBasket({username});
                adopt(created);
                ident = created.ident;
            } catch (e) {
                const message = e instanceof Error ? e.message : "";
                if (/invalid username/i.test(message)) {
                    writeStored(USERNAME_KEY, null);
                    setUsernameState(null);
                    setPendingAdd({packageId, quantity, targetUsername, variableData});
                    return "queued";
                }
                setError(message || "Could not open a basket.");
                return "failed";
            }
        }

        setError(null);
        try {
            adopt(await addPackageToBasket(ident, packageId, quantity, targetUsername, variableData));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
            return "failed";
        }
        setAddedCount(count => count + 1);
        return "added";
    }, [basket, username, adopt]);

    const value = useMemo<BasketContextValue>(() => ({
        basket,
        username,
        loading,
        error,
        itemCount: basket?.packages.reduce((sum, p) => sum + p.in_basket.quantity, 0) ?? 0,
        awaitingUsername: pendingAdd !== null || promptOpen,
        setUsername,
        changeUsername,
        cancelUsernamePrompt,
        completeBasket,
        addPackage,
        addedCount,
        removePackage: async packageId => {
            await mutate(ident => removePackageFromBasket(ident, packageId));
        },
        setQuantity: async (packageId, quantity) => {
            await mutate(ident => updateBasketPackageQuantity(ident, packageId, quantity));
        },
        applyCoupon: async code => {
            await mutate(ident => applyCouponRequest(ident, code));
        },
        removeCoupon: async code => {
            await mutate(ident => removeCouponRequest(ident, code));
        },
        refresh: async () => {
            await mutate(ident => fetchBasket(ident));
        }
    }), [
        basket, username, loading, error, pendingAdd, promptOpen, addedCount,
        setUsername, changeUsername, cancelUsernamePrompt, completeBasket, addPackage, mutate
    ]);

    return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket(): BasketContextValue {
    const context = useContext(BasketContext);
    if (!context) {
        throw new Error("useBasket must be used within a BasketProvider");
    }
    return context;
}
