import styles from "./StoreCompleteContent.module.scss";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStore} from "@fortawesome/free-solid-svg-icons";
import Label from "@/components/label/Label.tsx";
import {LUMA_IP_ADDRESS} from "@/constants.ts";
import {BASKET_IDENT_KEY} from "@/components/store/BasketContext.tsx";

const CELEBRATION_LUMA = "/CelebrationLuma.webp"; // TODO: move me

function StoreCompleteContent() {
    const [artworkMissing, setArtworkMissing] = useState(false);

    useEffect(() => {
        try {
            window.localStorage.removeItem(BASKET_IDENT_KEY);
        } catch { /* empty */ }
    }, []);

    return (
        <section className={styles.completeBackground}>
            <Label/>
            <div className={styles.card}>
                {!artworkMissing && (
                    <img
                        className={styles.celebrationLuma}
                        src={CELEBRATION_LUMA}
                        alt=""
                        aria-hidden="true"
                        onError={() => setArtworkMissing(true)}
                    />
                )}

                <h1>Thank you!</h1>
                <p>
                    Your order is being processed. Rewards are usually delivered within a
                    minute. Once the account these packages were purchased for is online on{" "}
                    <strong>{LUMA_IP_ADDRESS}</strong>, these will appear in-game.
                </p>
                <p className={styles.small}>
                    If something hasn't arrived after a few minutes, open a ticket in our
                    Discord with your transaction ID and we'll sort it out.
                </p>
                <div className={styles.actions}>
                    <Link to="/store">
                        <FontAwesomeIcon icon={faStore} aria-hidden="true"/>
                        Back to store
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default StoreCompleteContent;
