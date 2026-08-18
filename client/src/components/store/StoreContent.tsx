import styles from "./StoreContent.module.scss";
import {useQuery} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Label from "@/components/label/Label.tsx";
import LoadingPageContent from "@/components/loading/LoadingPageContent.tsx";
import StoreUnavailable from "@/components/store/unavailable/StoreUnavailable.tsx";
import StoreOverview from "@/components/store/overview/StoreOverview.tsx";
import PackageCard from "@/components/store/packagecard/PackageCard.tsx";
import PackageGroupCard from "@/components/store/packagecard/PackageGroupCard.tsx";
import PackageModal from "@/components/store/packagemodal/PackageModal.tsx";
import PackageGroupModal from "@/components/store/packagemodal/PackageGroupModal.tsx";
import BasketDrawer from "@/components/store/basket/BasketDrawer.tsx";
import BasketFab from "@/components/store/basket/BasketFab.tsx";
import UsernameModal from "@/components/store/username/UsernameModal.tsx";
import {useBasket} from "@/components/store/BasketContext.tsx";
import {fetchCategories, isStoreConfigured} from "@/scripts/tebex.ts";
import {StoreCategory, StorePackage} from "@/scripts/model/Tebex.ts";
import {buildStoreEntries, categorySlug, PackageGroup} from "@/scripts/packageGroups.ts";
import {storeHtml} from "@/scripts/storeHtml.ts";
import {faBasketShopping} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {MINOTAR_API} from "@/constants.ts";

function StoreContent() {
    const {basket, itemCount, username, changeUsername, addedCount} = useBasket();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const {categorySlug: activeSlug} = useParams<{ categorySlug: string }>();
    const navigate = useNavigate();
    const [selectedPackage, setSelectedPackage] = useState<StorePackage | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<PackageGroup | null>(null);

    const {data: categories, isLoading, error} = useQuery<StoreCategory[]>({
        queryKey: ["storeCategories", basket?.ident],
        queryFn: () => fetchCategories(basket?.ident),
        enabled: isStoreConfigured()
    });

    useEffect(() => {
        if (addedCount === 0) {
            return;
        }
        setSelectedPackage(null);
        setSelectedGroup(null);
    }, [addedCount]);

    if (!isStoreConfigured()) {
        return (
            <StoreUnavailable
                reason="The store isn't connected yet."
                detail="No public tebex token for me to hook into!"
            />
        );
    }
    if (isLoading) return <LoadingPageContent/>;
    if (error) {
        return <StoreUnavailable reason="We couldn't reach the store." detail={error.message}/>;
    }
    if (!categories || categories.length === 0) {
        return <StoreUnavailable reason="No packages are available right now."/>;
    }

    const topLevel = categories
        .filter(category => !category.parent)
        .sort((a, b) => a.order - b.order);

    const activeCategory = activeSlug
        ? topLevel.find(category => categorySlug(category) === activeSlug) ?? null
        : null;

    if (activeSlug && !activeCategory) {
        return (
            <StoreUnavailable
                reason={`There's no "${activeSlug}" section in our store.`}
                detail="It may have been renamed or removed."
            />
        );
    }

    const selectSection = (category: StoreCategory | null) => {
        navigate(category ? `/store/${categorySlug(category)}` : "/store");
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    return (
        <section className={styles.storeBackground}>
            <Label/>

            <div className={styles.storeLayout}>
                <aside className={styles.sidebar}>
                    <nav className={styles.sectionNav}>
                        <button
                            className={!activeCategory ? styles.sectionActive : ""}
                            onClick={() => selectSection(null)}
                        >
                            Overview
                        </button>
                        {topLevel.map(category => (
                            <button
                                key={category.id}
                                className={activeCategory?.id === category.id ? styles.sectionActive : ""}
                                onClick={() => selectSection(category)}
                            >
                                {category.name}
                                <span className={styles.sectionCount}>
                                    {(category.packages ?? []).length}
                                </span>
                            </button>
                        ))}
                    </nav>

                    <div className={styles.identityBlock}>
                        {username ? (
                            <>
                                <img
                                    src={`${MINOTAR_API}helm/${encodeURIComponent(username)}/32`}
                                    alt=""
                                    aria-hidden="true"
                                />
                                <div className={styles.identityText}>
                                    <span className={styles.identityLabel}>Shopping for</span>
                                    <span className={styles.identityName}>{username}</span>
                                </div>
                                <button onClick={changeUsername}>Change</button>
                            </>
                        ) : (
                            <p className={styles.identityEmpty}>
                                You'll be asked for your Minecraft username when you add
                                something to your basket.
                            </p>
                        )}
                    </div>

                    <button className={styles.sidebarBasket} onClick={() => setDrawerOpen(true)}>
                        <FontAwesomeIcon icon={faBasketShopping}/>
                        View basket
                        {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
                    </button>
                </aside>

                <div className={styles.main}>
                    {!activeCategory && <StoreOverview/>}

                    {activeCategory && (
                        <div className={styles.category}>
                            <h2 className={styles.categoryTitle}>{activeCategory.name}</h2>

                            {activeCategory.description && (
                                <div
                                    className={styles.categoryDescription}
                                    dangerouslySetInnerHTML={storeHtml(activeCategory.description)}
                                />
                            )}

                            <div className={styles.packageGrid}>
                                {buildStoreEntries(
                                    [...(activeCategory.packages ?? [])].sort((a, b) => a.order - b.order)
                                ).map(entry => entry.type === "group"
                                    ? (
                                        <PackageGroupCard
                                            key={`group-${entry.group.key}`}
                                            group={entry.group}
                                            onSelect={() => setSelectedGroup(entry.group)}
                                        />
                                    )
                                    : (
                                        <PackageCard
                                            key={entry.package.id}
                                            storePackage={entry.package}
                                            onSelect={() => setSelectedPackage(entry.package)}
                                        />
                                    ))}
                            </div>

                            {(activeCategory.packages ?? []).length === 0 && (
                                <p className={styles.emptyCategory}>Nothing here yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <PackageGroupModal
                group={selectedGroup}
                onClose={() => setSelectedGroup(null)}
                onSelectPackage={setSelectedPackage}
                escapeEnabled={selectedPackage === null}
            />

            <PackageModal
                storePackage={selectedPackage}
                onClose={() => setSelectedPackage(null)}
            />

            <UsernameModal/>

            <BasketFab onOpen={() => setDrawerOpen(true)} hidden={drawerOpen}/>

            <BasketDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}/>
        </section>
    );
}

export default StoreContent;
