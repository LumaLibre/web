import styles from "./SupporterCard.module.scss";
import {useState} from "react";
import {RecentPayment} from "@/scripts/model/Tebex.ts";
import {playerBodyRenderUrl} from "@/scripts/playerRender.ts";

function SupporterCard({payment, index}: { payment: RecentPayment, index: number }) {
    const [renderState, setRenderState] = useState<"loading" | "loaded" | "failed">("loading");

    return (
        <div className={styles.supporter}>
            <div className={styles.renderSlot}>
                {/* Stays underneath: if the render fails, this is what remains. */}
                <img
                    className={`${styles.face} ${renderState === "loaded" ? styles.faceHidden : ""}`}
                    src={payment.avatar_url}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                />

                {renderState !== "failed" && (
                    <img
                        className={`${styles.render} ${renderState === "loaded" ? styles.renderVisible : ""}`}
                        src={playerBodyRenderUrl(payment.username_id, index)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        onLoad={() => setRenderState("loaded")}
                        onError={() => setRenderState("failed")}
                    />
                )}
            </div>

            <span className={styles.name}>{payment.username}</span>
        </div>
    );
}

export default SupporterCard;
