import {useBasket} from "@/components/store/BasketContext.tsx";
import {configuredLimitLabels} from "@/scripts/packageLimits.ts";
import styles from "./PackageCard.module.scss";

export default function PackageLimitDetails({packageId, showStock = true}: {packageId: number; showStock?: boolean}) {
    const {configuredLimits} = useBasket();
    const labels = configuredLimitLabels(configuredLimits[packageId], showStock);
    if (!labels.length) return null;
    return <div className={styles.limitDetails}>
        {labels.map(label => <p className={styles.stockStatus} key={label}>{label}</p>)}
    </div>;
}
