import styles from "./PackageCard.module.scss";
import {StorePackage} from "@/scripts/model/Tebex.ts";
import {fetchPackage, formatPrice} from "@/scripts/tebex.ts";
import {pricingOf} from "@/scripts/pricing.ts";
import {storedDiscordIdentity} from "@/scripts/discordAuth.ts";
import {useBasket} from "@/components/store/BasketContext.tsx";
import React, {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {requiredOptions} from "@/scripts/packageOptions.ts";
import {packageLabel} from "@/scripts/packageGroups.ts";
import SoldOutStamp from "./SoldOutStamp.tsx";
import PackageLimitDetails from "./PackageLimitDetails.tsx";

function PackageCard(
    {storePackage, onSelect}: { storePackage: StorePackage, onSelect: () => void }
) {
    const {addPackage, basket, packageLimit} = useBasket();
    const limit = packageLimit(storePackage.id);
    const soldOut = limit !== null;
    const queryClient = useQueryClient();
    const [adding, setAdding] = useState(false);

    const pricing = pricingOf(storePackage);
    const label = packageLabel(storePackage.name);
    const image = storePackage.image
        ?? storePackage.media?.find(m => m.primary && m.type === "image")?.url
        ?? null;

    const handleAdd = async (event: React.MouseEvent) => {
        event.stopPropagation();
        if (soldOut || adding) return;
        setAdding(true);
        try {
            // Category responses omit package options. Resolve the full package
            // before using this shortcut so required fields cannot be bypassed.
            const packageDetail = await queryClient.fetchQuery<StorePackage>({
                queryKey: ["storePackage", storePackage.id, basket?.ident],
                queryFn: () => fetchPackage(storePackage.id, basket?.ident),
                staleTime: 0
            });
            const options = requiredOptions(packageDetail);
            const discordOptions = options.filter(option => option.type === "discord_id");

            if (options.length !== discordOptions.length) {
                onSelect();
                return;
            }

            const identity = storedDiscordIdentity();
            if (discordOptions.length > 0 && !identity) {
                onSelect();
                return;
            }

            const variableData = identity && discordOptions.length > 0
                ? Object.fromEntries(discordOptions.map(option => [option.name, identity.id]))
                : undefined;
            const result = await addPackage(storePackage.id, 1, undefined, variableData);

            if (result === "failed") {
                onSelect();
            }
        } catch {
            // The modal has its own loading and error states, so it is the safe
            // fallback if package details could not be checked here.
            onSelect();
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
                {soldOut && <SoldOutStamp/>}
                {image
                    ? <img src={image} alt={storePackage.name} loading="lazy"/>
                    : <div className={styles.imageFallback} aria-hidden="true"/>}
                {!soldOut && pricing.percentOff !== null && (
                    <span className={styles.saleBadge}>-{pricing.percentOff}%</span>
                )}
                {!soldOut && pricing.percentOff === null && label.prefix && (
                    <span className={styles.prefixBadge}>{label.prefix}</span>
                )}
            </div>

            <div className={styles.body}>
                <h3 className={styles.name}>{label.name}</h3>
                <PackageLimitDetails packageId={storePackage.id}/>
                {limit && (
                    <p className={styles.stockStatus}>
                        {limit === "global" ? "Stock: Sold out" : "Your purchase limit has been reached"}
                    </p>
                )}

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

                    <button className={styles.addButton} onClick={handleAdd} disabled={adding || soldOut}>
                        {soldOut ? "Sold Out!" : adding ? "Adding…" : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PackageCard;
