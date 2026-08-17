import styles from "./PackageGroupCard.module.scss";
import React from "react";
import {PackageGroup} from "@/scripts/packageGroups.ts";
import {formatPrice} from "@/scripts/tebex.ts";
import {pricingOf} from "@/scripts/pricing.ts";
import {StorePackage} from "@/scripts/model/Tebex.ts";

const imageOf = (pkg: StorePackage): string | null =>
    pkg.image ?? pkg.media?.find(m => m.primary && m.type === "image")?.url ?? null;

function PackageGroupCard({group, onSelect}: { group: PackageGroup, onSelect: () => void }) {
    const [front, ...rest] = group.packages;
    const frontImage = imageOf(front);

    const behind = rest.slice(0, 3);

    const cheapestPricing = pricingOf(group.cheapest);
    const bestPercentOff = group.packages
        .map(pkg => pricingOf(pkg).percentOff ?? 0)
        .reduce((best, percent) => Math.max(best, percent), 0);

    return (
        <div className={styles.stack}>
            {/* Deepest first so the nearest card paints closest to the front. */}
            {[...behind].reverse().map((pkg, index) => {
                const depth = behind.length - index;
                const image = imageOf(pkg);
                return (
                    <span
                        key={pkg.id}
                        className={styles.layer}
                        style={{"--depth": depth} as React.CSSProperties}
                        aria-hidden="true"
                    >
                        {/* Mirrors the front card's image panel so the fanned
                            cards read as real cards rather than blank slabs. */}
                        <span className={styles.layerImage}>
                            {image && <img src={image} alt="" loading="lazy"/>}
                        </span>
                        <span className={styles.layerBody}/>
                    </span>
                );
            })}

            <div
                className={styles.card}
                onClick={onSelect}
                role="button"
                tabIndex={0}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelect()}
            >
                <div className={styles.imageWrapper}>
                    {frontImage
                        ? <img src={frontImage} alt={group.name} loading="lazy"/>
                        : <div className={styles.imageFallback} aria-hidden="true"/>}
                    <span className={styles.optionBadge}>
                        {group.packages.length} options
                    </span>
                    {bestPercentOff > 0
                        ? <span className={styles.salePrefixBadge}>-{bestPercentOff}%</span>
                        : group.prefix && <span className={styles.prefixBadge}>{group.prefix}</span>}
                </div>

                <div className={styles.body}>
                    <h3 className={styles.name}>{group.name}</h3>

                    <div className={styles.footer}>
                        <div className={styles.pricing}>
                            <span className={styles.fromLabel}>from</span>
                            {cheapestPricing.original !== null && (
                                <span className={styles.basePrice}>
                                    {formatPrice(cheapestPricing.original, cheapestPricing.currency)}
                                </span>
                            )}
                            <span className={cheapestPricing.original !== null
                                ? styles.priceSale
                                : styles.price}>
                                {formatPrice(cheapestPricing.current, cheapestPricing.currency)}
                            </span>
                        </div>
                        <span className={styles.chooseButton}>Choose</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PackageGroupCard;
