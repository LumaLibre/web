import styles from "./DiscordCallback.module.scss";
import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import discordIcon from "@/assets/icons/DiscordIcon.webp";
import {fetchCategories} from "@/scripts/tebex.ts";
import {completeDiscordLogin, consumePendingPackage, consumeReturnPath} from "@/scripts/discordAuth.ts";

const LUMA_LOGO = "/LumaLogoMin.webp";

function DiscordCallback() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const started = useRef(false);

    useEffect(() => {
        if (started.current) {
            return;
        }
        started.current = true;

        completeDiscordLogin()
            .then(async () => {
                // Warm up the store
                await Promise.allSettled([
                    import("@/pages/StorePage.tsx"),
                    queryClient.prefetchQuery({
                        queryKey: ["storeCategories", undefined],
                        queryFn: () => fetchCategories(undefined)
                    })
                ]);
                navigate(consumeReturnPath(), {replace: true});
            })
            .catch(e => setError(e instanceof Error ? e.message : "Discord login failed."));
    }, [navigate, queryClient]);

    const leave = () => {
        consumePendingPackage();
        navigate(consumeReturnPath(), {replace: true});
    };

    return (
        <section className={styles.screen}>
            <div className={styles.marks}>
                <img
                    className={styles.logo}
                    src={LUMA_LOGO}
                    alt=""
                    aria-hidden="true"
                    onError={event => {
                        event.currentTarget.style.visibility = "hidden";
                    }}
                />
                <span className={styles.cross} aria-hidden="true">✕</span>
                <img className={styles.logo} src={discordIcon} alt="" aria-hidden="true"/>
            </div>

            {error && (
                <div className={styles.failure}>
                    <p>{error}</p>
                    <button onClick={leave}>Back to store</button>
                </div>
            )}
        </section>
    );
}

export default DiscordCallback;
