import styles from "./StoreOverview.module.scss";
import {useQuery} from "@tanstack/react-query";
import {fetchSidebar, fetchWebstore} from "@/scripts/tebex.ts";
import {SidebarModule, Webstore} from "@/scripts/model/Tebex.ts";
import {DISCORD_INV} from "@/constants.ts";
import SupporterCard from "@/components/store/overview/SupporterCard.tsx";
import PaymentMethods from "@/components/store/overview/PaymentMethods.tsx";

function StoreOverview() {
    const {data: webstore} = useQuery<Webstore>({
        queryKey: ["storeWebstore"],
        queryFn: fetchWebstore
    });

    const {data: sidebar} = useQuery<SidebarModule[]>({
        queryKey: ["storeSidebar"],
        queryFn: fetchSidebar
    });

    const supporters = sidebar
        ?.find(module => module.type === "recent_payments")
        ?.data;

    const uniqueSupporters = supporters?.payments
        ?.filter((payment, index, all) =>
            all.findIndex(other => other.username_id === payment.username_id) === index)
        .slice(0, 12) ?? [];

    return (
        <div className={styles.overview}>
            <div className={styles.intro}>
                {webstore?.logo && (
                    <img className={styles.logo} src={webstore.logo} alt="" aria-hidden="true"/>
                )}

                <h2>LumaMC's Store</h2>

                <div className={styles.description}>
                    <p>
                        We're a friendly-community Minecraft server focused on fun and
                        quality gameplay.
                        <br/>
                        Here you can find ranks, keys, tags, boosters, and much more! All
                        purchases here will go to the further development and upkeep of
                        LumaMC's websites and server.
                    </p>
                    <p>
                        <strong>Please Note:</strong> If you are having issues with the
                        purchases not coming through, make sure to let our staff team know
                        on our{" "}
                        <a href={DISCORD_INV} target="_blank" rel="noopener noreferrer">
                            Discord
                        </a>{" "}
                        server or <strong>in-game</strong>.
                        For other concerns, please contact us at{" "}
                        <a href="mailto:stars@lumamc.net">stars@lumamc.net</a>.
                    </p>
                    <p>
                        <strong>Disclaimer:</strong> LumaMC and its store is operated by the
                        LumaMC admin team. This store is <strong>NOT</strong> operated or
                        affiliated by or with Mojang AB/Microsoft. Likewise, none of LumaMC's
                        servers or websites are either.
                    </p>
                </div>

                <PaymentMethods/>
            </div>

            <div className={styles.panels}>
                <section className={styles.panel}>
                    <h3>How it works</h3>
                    <ol className={styles.steps}>
                        <li>Pick a package and add it to your basket.</li>
                        <li>Enter your Minecraft username.</li>
                        <li>Pay through Tebex, we never see your card details!</li>
                        <li>Rewards arrive in-game on Luma, usually within a minute.</li>
                        <li>Support Luma and enjoy your packages!</li>
                    </ol>
                </section>

                {uniqueSupporters.length > 0 && (
                    <section className={styles.panel}>
                        <h3>{supporters?.header ?? "Recent supporters"}</h3>
                        <div className={styles.supporterList}>
                            {uniqueSupporters.slice(0, 5).map((payment, index) => (
                                <SupporterCard
                                    key={payment.username_id}
                                    payment={payment}
                                    index={index}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default StoreOverview;
