import styles from "./PackageModal.module.scss";
import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {StorePackage, Webstore} from "@/scripts/model/Tebex.ts";
import {fetchWebstore, formatPrice} from "@/scripts/tebex.ts";
import {pricingOf} from "@/scripts/pricing.ts";
import {storeHtml} from "@/scripts/storeHtml.ts";
import {useBasket} from "@/components/store/BasketContext.tsx";
import {useScrollLock} from "@/components/ui/UseScrollLock.ts";
import {usePresence} from "@/components/ui/UsePresence.ts";

function PackageModal(
    {storePackage: selected, onClose}: { storePackage: StorePackage | null, onClose: () => void }
) {
    const {addPackage, error} = useBasket();
    const [adding, setAdding] = useState(false);
    const [giftOpen, setGiftOpen] = useState(false);
    const [giftTo, setGiftTo] = useState("");

    const {data: webstore} = useQuery<Webstore>({
        queryKey: ["storeWebstore"],
        queryFn: fetchWebstore
    });

    const {rendered: storePackage, closing} = usePresence(selected);

    useScrollLock(storePackage !== null);

    useEffect(() => {
        if (!selected) {
            return;
        }
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selected, onClose]);

    if (!storePackage) {
        return null;
    }

    const pricing = pricingOf(storePackage);
    const image = storePackage.image
        ?? storePackage.media?.find(m => m.primary && m.type === "image")?.url
        ?? null;

    const canGift = String(webstore?.supports_gifting) === "true"
        && !storePackage.disable_gifting;

    const handleAdd = async (targetUsername?: string) => {
        setAdding(true);
        try {
            const result = await addPackage(storePackage.id, 1, targetUsername);
            if (result === "added") {
                setGiftTo("");
                setGiftOpen(false);
            }
        } finally {
            setAdding(false);
        }
    };

    return (
        <div
            className={`${styles.scrim} ${closing ? styles.closing : ""}`}
            onClick={onClose}
            role="presentation"
        >
            <div
                className={`${styles.modal} ${closing ? styles.closing : ""}`}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={storePackage.name}
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>

                <div className={styles.content}>
                    {image && (
                        <div className={styles.imagePanel}>
                            <img src={image} alt={storePackage.name}/>
                        </div>
                    )}

                    <div className={styles.details}>
                        <h2 className={styles.name}>{storePackage.name}</h2>

                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={storeHtml(storePackage.description)}
                        />
                    </div>
                </div>

                {/* Outside the scrolling area so price and CTA stay visible no
                    matter how long the description is. */}
                <div className={styles.actionBar}>
                    <div className={styles.pricing}>
                        {pricing.original !== null && (
                            <span className={styles.basePrice}>
                                {formatPrice(pricing.original, pricing.currency)}
                            </span>
                        )}
                        <span className={pricing.original !== null ? styles.priceSale : styles.price}>
                            {formatPrice(pricing.current, pricing.currency)}
                        </span>
                        {pricing.percentOff !== null && (
                            <span className={styles.saleTag}>-{pricing.percentOff}%</span>
                        )}
                        {storePackage.type === "subscription" && (
                            <span className={styles.subscription}>per month</span>
                        )}
                    </div>

                    <div className={styles.actionButtons}>
                        <button
                            className={styles.addButton}
                            onClick={() => handleAdd()}
                            disabled={adding}
                        >
                            {adding ? "Adding…" : "Add to basket"}
                        </button>

                        {canGift && (
                            <button
                                className={styles.giftToggle}
                                onClick={() => setGiftOpen(open => !open)}
                                aria-expanded={giftOpen}
                            >
                                Gift this package
                                <span className={giftOpen ? styles.chevronUp : styles.chevron}>
                                    ⌃
                                </span>
                            </button>
                        )}
                    </div>

                    {canGift && giftOpen && (
                        <div className={styles.giftRow}>
                            <input
                                type="text"
                                value={giftTo}
                                autoFocus
                                placeholder="Enter a username to gift this package to"
                                spellCheck={false}
                                autoCapitalize="none"
                                autoCorrect="off"
                                onChange={e => setGiftTo(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter" && giftTo.trim() && !adding) {
                                        void handleAdd(giftTo.trim());
                                    }
                                }}
                            />
                            <button
                                onClick={() => handleAdd(giftTo.trim())}
                                disabled={adding || giftTo.trim().length === 0}
                            >
                                Gift
                            </button>
                        </div>
                    )}

                    {/* Tebex resolves the recipient on the add call, so an
                        unknown name is reported here rather than at checkout. */}
                    {error && (
                        <p className={styles.actionError}>
                            {/receive the gift is invalid/i.test(error)
                                ? "We couldn't find that Minecraft account. Check the spelling and try again."
                                : error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PackageModal;
