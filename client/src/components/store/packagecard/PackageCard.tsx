import styles from "./PackageCard.module.scss";
import {StorePackage} from "@/scripts/model/Tebex.ts";
import {formatPrice} from "@/scripts/tebex.ts";
import {pricingOf} from "@/scripts/pricing.ts";
import {storedDiscordIdentity} from "@/scripts/discordAuth.ts";
import {useBasket} from "@/components/store/BasketContext.tsx";
import React, {useState} from "react";

function PackageCard(
    {storePackage, onSelect}: { storePackage: StorePackage, onSelect: () => void }
) {
    const {addPackage} = useBasket();
    const [adding, setAdding] = useState(false);

    const pricing = pricingOf(storePackage);
    const image = storePackage.image
        ?? storePackage.media?.find(m => m.primary && m.type === "image")?.url
        ?? null;

    const handleAdd = async (event: React.MouseEvent) => {
        event.stopPropagation();
        setAdding(true);
        try {
            let result = await addPackage(storePackage.id);

            if (result === "failed") {
                const identity = storedDiscordIdentity();
                if (identity) {
                    result = await addPackage(storePackage.id, 1, undefined, {
                        discord_id: identity.id
                    });
                }
            }

            if (result === "failed") {
                onSelect();
            }
        } finally {
            setAdding(false);
        }
    };

    return (
        <div
            className={styles.packageCard}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelect()}
        >
            <div className={styles.imageWrapper}>
                {image
                    ? <img src={image} alt={storePackage.name} loading="lazy"/>
                    : <div className={styles.imageFallback} aria-hidden="true"/>}
                {pricing.percentOff !== null && (
                    <span className={styles.saleBadge}>-{pricing.percentOff}%</span>
                )}
            </div>

            <div className={styles.body}>
                <h3 className={styles.name}>{storePackage.name}</h3>

                <div className={styles.footer}>
                    <div className={styles.pricing}>
                        {pricing.original !== null && (
                            <span className={styles.basePrice}>
                                {formatPrice(pricing.original, pricing.currency)}
                            </span>
                        )}
                        <span className={pricing.original !== null ? styles.priceSale : styles.price}>
                            {formatPrice(pricing.current, pricing.currency)}
                        </span>
                        {storePackage.type === "subscription" && (
                            <span className={styles.subscription}>/ mo</span>
                        )}
                    </div>

                    <button className={styles.addButton} onClick={handleAdd} disabled={adding}>
                        {adding ? "Adding…" : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PackageCard;
