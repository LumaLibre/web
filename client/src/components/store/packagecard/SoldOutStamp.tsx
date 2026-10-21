import styles from "./SoldOutStamp.module.scss";

export default function SoldOutStamp({belowBadge = false}: {belowBadge?: boolean}) {
    return <span className={`${styles.stamp} ${belowBadge ? styles.belowBadge : ""}`}>Sold Out!</span>;
}
