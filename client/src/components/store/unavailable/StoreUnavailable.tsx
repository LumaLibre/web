import styles from "./StoreUnavailable.module.scss";
import Label from "@/components/label/Label.tsx";
import {STORE} from "@/constants.ts";

function StoreUnavailable({reason, detail}: { reason: string, detail?: string }) {
    return (
        <section className={styles.background}>
            <Label/>
            <div className={styles.card}>
                <h1>Store unavailable</h1>
                <p>{reason}</p>
                {detail && <p className={styles.detail}>{detail}</p>}
                <div className={styles.actions}>
                    <a href={STORE} target="_blank" rel="noopener noreferrer">
                        Open our Tebex store
                    </a>
                </div>
            </div>
        </section>
    );
}

export default StoreUnavailable;
