import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBoxOpen} from "@fortawesome/free-solid-svg-icons";
import {useBasket} from "@/components/store/BasketContext.tsx";
import {combinedPackageStock} from "@/scripts/packageLimits.ts";
import styles from "./StockBadge.module.scss";

export default function StockBadge({packageIds, compact = false}: {packageIds: number[]; compact?: boolean}) {
    const {configuredLimits} = useBasket();
    const stock = combinedPackageStock(packageIds.map(id => configuredLimits[id]));
    if (!stock) return null;
    return <span className={`${styles.stockBadge} ${compact ? styles.compact : ""} ${stock.remaining === 0 ? styles.empty : ""}`}
                 title={packageIds.length > 1 ? "Combined stock across package options" : undefined}>
        <FontAwesomeIcon icon={faBoxOpen} aria-hidden="true"/>
        <span>Stock: <strong>{stock.remaining}</strong><span className={styles.total}>/{stock.total}</span></span>
    </span>;
}
