import styles from "./TopSupporter.module.scss";
import {useState} from "react";
import {TopCustomer} from "@/scripts/model/Tebex.ts";
import {topSupporterRenderUrl} from "@/scripts/playerRender.ts";

function TopSupporter(
    {customer, header, className}: { customer: TopCustomer, header?: string, className?: string }
) {
    const [renderState, setRenderState] = useState<"loading" | "loaded" | "failed">("loading");

    return (
        <section className={`${className ?? ""} ${styles.topSupporter}`}>
            <h3 className={styles.header}>{header ?? "Top Supporter"}</h3>

            <div className={styles.renderSlot}>
                <img
                    className={`${styles.face} ${renderState === "loaded" ? styles.faceHidden : ""}`}
                    src={customer.avatar_url}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                />

                {renderState !== "failed" && (
                    <img
                        className={`${styles.render} ${renderState === "loaded" ? styles.renderVisible : ""}`}
                        src={topSupporterRenderUrl(customer.username_id)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        onLoad={() => setRenderState("loaded")}
                        onError={() => setRenderState("failed")}
                    />
                )}
            </div>

            <span className={styles.name}>{customer.username}</span>
        </section>
    );
}

export default TopSupporter;
