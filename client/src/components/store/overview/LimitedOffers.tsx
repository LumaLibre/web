import {CSSProperties, useEffect, useState} from "react";
import type {StorePackage} from "@/scripts/model/Tebex.ts";
import {formatPrice} from "@/scripts/tebex.ts";
import {pricingOf} from "@/scripts/pricing.ts";
import {packageLabel} from "@/scripts/packageGroups.ts";
import {useBasket} from "@/components/store/BasketContext.tsx";
import StockBadge from "@/components/store/packagecard/StockBadge.tsx";
import fallbackImage from "@/assets/icons/StoreIcon.webp";
import PackageModal from "@/components/store/packagemodal/PackageModal.tsx";
import styles from "./LimitedOffers.module.scss";

export default function LimitedOffers({packages, loading, error}: {
    packages: StorePackage[];
    loading?: boolean;
    error?: string;
}) {
    const [selected, setSelected] = useState<StorePackage | null>(null);
    const {packageLimit, addedCount} = useBasket();
    const visibleOffers = packages.slice(0, 3);
    useEffect(() => { setSelected(null); }, [addedCount]);

    return (
        <section className={styles.offers} aria-labelledby="limited-offers-title">
            <header className={styles.heading}>
                <h3 id="limited-offers-title">Limited-time Offers</h3>
            </header>
            {visibleOffers.length === 0 ? (
                <p className={styles.empty} role="status">
                    {loading ? "Loading offers…" : error ?? "No limited-time offers right now. Check back soon!"}
                </p>
            ) : (
                <div className={styles.rack} data-count={visibleOffers.length} aria-label="Limited-time packages">
                    {visibleOffers.map(offer => {
                        const pricing = pricingOf(offer);
                        const name = packageLabel(offer.name).name;
                        const limit = packageLimit(offer.id);
                        const image = offer.image ?? offer.media?.find(media => media.primary && media.type === "image")?.url;
                        return (
                            <article className={styles.card} key={offer.id}
                                     style={{"--offer-accent": "#dcb0ef"} as CSSProperties}>
                                <button type="button" className={styles.cardTrigger}
                                        aria-label={`View ${name}${limit === "global" ? " — Sold Out!" : ""}`} aria-haspopup="dialog"
                                        onClick={() => setSelected(offer)}/>
                                <svg className={styles.hanger} viewBox="0 0 240 48" preserveAspectRatio="none" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16 0H224Q240 0 240 16V48H0V16Q0 0 16 0Z M91 20H105C110 20 110 12 120 12C130 12 130 20 135 20H149A6 6 0 0 1 149 32H91A6 6 0 0 1 91 20Z"/>
                                </svg>
                                <div className={styles.cardContent}>
                                    <div className={styles.art}>
                                        <img src={image ?? fallbackImage} alt="" loading="lazy"/>
                                        <div className={styles.stock}><StockBadge packageIds={[offer.id]} compact/></div>
                                        {limit && <span className={styles.soldOut}>{limit === "global" ? "Sold Out!" : "Limit reached"}</span>}
                                    </div>
                                    <div className={styles.details}>
                                        <h4>{name}</h4>
                                        <div className={styles.price}>
                                            <strong>{formatPrice(pricing.current, pricing.currency)}</strong>
                                            {pricing.original !== null && <s>{formatPrice(pricing.original, pricing.currency)}</s>}
                                            {offer.type === "subscription" && <span className={styles.recurring}>/ mo</span>}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
            <PackageModal storePackage={selected} onClose={() => setSelected(null)}/>
        </section>
    );
}
