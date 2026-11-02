import styles from "./SoldOutStamp.module.scss";

export default function SoldOutStamp({belowBadge = false, label = "Sold Out!"}: {belowBadge?: boolean; label?: string}) {
    return <span className={`${styles.stamp} ${belowBadge ? styles.belowBadge : ""}`}>{label}</span>;
}
