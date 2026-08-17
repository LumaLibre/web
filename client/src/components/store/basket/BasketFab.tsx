import styles from "./BasketFab.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBasketShopping} from "@fortawesome/free-solid-svg-icons";
import {useBasket} from "@/components/store/BasketContext.tsx";
import {formatPrice} from "@/scripts/tebex.ts";

function BasketFab({onOpen, hidden}: { onOpen: () => void, hidden?: boolean }) {
    const {basket, itemCount} = useBasket();

    if (itemCount === 0) {
        return null;
    }

    return (
        <button
            className={`${styles.fab} ${hidden ? styles.fabHidden : ""}`}
            onClick={onOpen}
            aria-label={`Open basket, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        >
            <span className={styles.iconWrap}>
                <FontAwesomeIcon icon={faBasketShopping}/>
                <span className={styles.count}>{itemCount}</span>
            </span>
            <span className={styles.label}>
                {basket ? formatPrice(basket.total_price, basket.currency) : "Basket"}
            </span>
        </button>
    );
}

export default BasketFab;
