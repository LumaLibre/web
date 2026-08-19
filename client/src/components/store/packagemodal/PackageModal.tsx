import styles from "./PackageModal.module.scss";
import {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";
import {useQuery} from "@tanstack/react-query";
import {StorePackage, Webstore} from "@/scripts/model/Tebex.ts";
import {fetchPackage, fetchWebstore, formatPrice} from "@/scripts/tebex.ts";
import {pricingOf} from "@/scripts/pricing.ts";
import {optionLabel, requiredOptions, validateOption} from "@/scripts/packageOptions.ts";
import {DISCORD_PUBLIC_CLIENT_ID} from "@/constants.ts";
import {
    beginDiscordLogin,
    forgetDiscordIdentity,
    storedDiscordIdentity
} from "@/scripts/discordAuth.ts";
import {storeHtml} from "@/scripts/storeHtml.ts";
import {useBasket} from "@/components/store/BasketContext.tsx";
import {useScrollLock} from "@/components/ui/UseScrollLock.ts";
import {usePresence} from "@/components/ui/UsePresence.ts";

function PackageModal(
    {storePackage: selected, onClose}: { storePackage: StorePackage | null, onClose: () => void }
) {
    const {addPackage, error} = useBasket();
    const [adding, setAdding] = useState(false);
    const [giftOpen, setGiftOpen] = useState(false);
    const [giftTo, setGiftTo] = useState("");
    const [optionValues, setOptionValues] = useState<Record<string, string>>({});
    const [optionErrors, setOptionErrors] = useState<Record<string, string>>({});
    const [discord, setDiscord] = useState(() => storedDiscordIdentity());

    const {data: webstore} = useQuery<Webstore>({
        queryKey: ["storeWebstore"],
        queryFn: fetchWebstore
    });

    const {rendered: storePackage, closing} = usePresence(selected);

    const {data: packageDetail, isLoading: packageDetailLoading} = useQuery<StorePackage>({
        queryKey: ["storePackage", storePackage?.id],
        queryFn: () => fetchPackage(storePackage!.id),
        enabled: storePackage !== null
    });

    useScrollLock(storePackage !== null);

    useEffect(() => {
        if (!selected) {
            return;
        }
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selected, onClose]);

    if (!storePackage) {
        return null;
    }

    const pricing = pricingOf(storePackage);
    const image = storePackage.image
        ?? storePackage.media?.find(m => m.primary && m.type === "image")?.url
        ?? null;

    const canGift = String(webstore?.supports_gifting) === "true"
        && !storePackage.disable_gifting;

    const options = requiredOptions(packageDetail ?? storePackage);
    const discordOption = options.find(option => option.type === "discord_id") ?? null;
    const textOptions = options.filter(option => option.type !== "discord_id");
    const needsDiscordLogin = discordOption !== null && !discord && DISCORD_PUBLIC_CLIENT_ID !== "";
    const canShowPurchaseActions = !packageDetailLoading && !needsDiscordLogin;

    // The grid has no `options` for a package, so its add fails and lands here.
    // That 400 is expected and the option controls already say what is needed.
    const isMissingOptionsError = options.length > 0 && error !== null
        && /adding the package to your basket|options provided is invalid/i.test(error);

    const handleAdd = async (targetUsername?: string) => {
        if (discordOption && DISCORD_PUBLIC_CLIENT_ID && !discord) {
            setGiftOpen(false);
            return;
        }

        const valueFor = (name: string, type: string) =>
            type === "discord_id" && discord ? discord.id : (optionValues[name] ?? "");

        const errors: Record<string, string> = {};
        for (const option of options) {
            const error = validateOption(option, valueFor(option.name, option.type));
            if (error) {
                errors[option.name] = error;
            }
        }
        setOptionErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        const variableData = Object.fromEntries(
            options.map(option => [option.name, valueFor(option.name, option.type).trim()])
        );

        setAdding(true);
        try {
            const result = await addPackage(storePackage.id, 1, targetUsername, variableData);
            if (result === "added") {
                setGiftTo("");
                setGiftOpen(false);
                setOptionValues({});
            }
        } finally {
            setAdding(false);
        }
    };

    return (
        <div
            className={`${styles.scrim} ${closing ? styles.closing : ""}`}
            onClick={onClose}
            role="presentation"
        >
            <div
                className={`${styles.modal} ${closing ? styles.closing : ""}`}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={storePackage.name}
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>

                <div className={styles.content}>
                    {image && (
                        <div className={styles.imagePanel}>
                            <img src={image} alt={storePackage.name}/>
                        </div>
                    )}

                    <div className={styles.details}>
                        <h2 className={styles.name}>{storePackage.name}</h2>

                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={storeHtml(storePackage.description)}
                        />
                    </div>
                </div>

                {/* Outside the scrolling area so price and CTA stay visible no
                    matter how long the description is. */}
                <div className={styles.actionBar}>
                    <div className={styles.pricing}>
                        {pricing.original !== null && (
                            <span className={styles.basePrice}>
                                {formatPrice(pricing.original, pricing.currency)}
                            </span>
                        )}
                        <span className={pricing.original !== null ? styles.priceSale : styles.price}>
                            {formatPrice(pricing.current, pricing.currency)}
                        </span>
                        {pricing.percentOff !== null && (
                            <span className={styles.saleTag}>-{pricing.percentOff}%</span>
                        )}
                        {storePackage.type === "subscription" && (
                            <span className={styles.subscription}>per month</span>
                        )}
                    </div>

                    {textOptions.length > 0 && (
                        <div className={styles.optionFields}>
                            {textOptions.map(option => (
                                <label key={option.name} className={styles.optionField}>
                                    <span className={styles.optionLabel}>{optionLabel(option)}</span>
                                    <span className={styles.optionHint}>{option.description}</span>
                                    <input
                                        type="text"
                                        value={optionValues[option.name] ?? ""}
                                        placeholder={optionLabel(option)}
                                        spellCheck={false}
                                        autoComplete="off"
                                        aria-invalid={Boolean(optionErrors[option.name])}
                                        onChange={e => setOptionValues(v => ({...v, [option.name]: e.target.value}))}
                                    />
                                    {optionErrors[option.name] && (
                                        <span className={styles.optionError}>{optionErrors[option.name]}</span>
                                    )}
                                </label>
                            ))}
                        </div>
                    )}

                    {discordOption && !DISCORD_PUBLIC_CLIENT_ID && (
                        <label className={styles.optionField}>
                            <span className={styles.optionLabel}>{optionLabel(discordOption)}</span>
                            <span className={styles.optionHint}>{discordOption.description}</span>
                            <input
                                type="text"
                                value={optionValues[discordOption.name] ?? ""}
                                placeholder={optionLabel(discordOption)}
                                spellCheck={false}
                                autoComplete="off"
                                aria-invalid={Boolean(optionErrors[discordOption.name])}
                                onChange={e => setOptionValues(v => ({...v, [discordOption.name]: e.target.value}))}
                            />
                            {optionErrors[discordOption.name] && (
                                <span className={styles.optionError}>{optionErrors[discordOption.name]}</span>
                            )}
                        </label>
                    )}

                    <div className={styles.actionButtons}>
                        {canShowPurchaseActions && (
                            <button
                                className={styles.addButton}
                                onClick={() => handleAdd()}
                                disabled={adding}
                            >
                                {adding ? "Adding…" : "Add to basket"}
                            </button>
                        )}

                        {canGift && canShowPurchaseActions && (
                            <button
                                className={styles.giftToggle}
                                onClick={() => setGiftOpen(open => !open)}
                                aria-expanded={giftOpen}
                            >
                                Gift this package
                                <span className={giftOpen ? styles.chevronUp : styles.chevron}>
                                    ⌃
                                </span>
                            </button>
                        )}

                        {discordOption && discord && (
                            <span className={styles.discordLinked}>
                                <FontAwesomeIcon icon={faDiscord} aria-hidden="true"/>
                                <strong>{discord.username}</strong>
                                <button onClick={() => {
                                    forgetDiscordIdentity();
                                    setDiscord(null);
                                    setGiftOpen(false);
                                }}>
                                    Change
                                </button>
                            </span>
                        )}

                        {needsDiscordLogin && (
                            <button
                                className={styles.discordLogin}
                                onClick={() => beginDiscordLogin(
                                    DISCORD_PUBLIC_CLIENT_ID,
                                    window.location.pathname,
                                    storePackage.id
                                )}
                            >
                                <FontAwesomeIcon icon={faDiscord} aria-hidden="true"/>
                                Login with Discord
                            </button>
                        )}
                    </div>

                    {canGift && canShowPurchaseActions && giftOpen && (
                        <div className={styles.giftRow}>
                            <input
                                type="text"
                                value={giftTo}
                                autoFocus
                                placeholder="Enter a username to gift this package to"
                                spellCheck={false}
                                autoCapitalize="none"
                                autoCorrect="off"
                                onChange={e => setGiftTo(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter" && giftTo.trim() && !adding) {
                                        void handleAdd(giftTo.trim());
                                    }
                                }}
                            />
                            <button
                                onClick={() => handleAdd(giftTo.trim())}
                                disabled={adding || giftTo.trim().length === 0}
                            >
                                Gift
                            </button>
                        </div>
                    )}

                    {/* Tebex resolves the recipient on the add call, so an
                        unknown name is reported here rather than at checkout. */}
                    {needsDiscordLogin ? (
                        <p className={styles.actionHint}>
                            You'll need to sign into Discord in order to purchase this package.
                        </p>
                    ) : error && !isMissingOptionsError ? (
                        <p className={styles.actionError}>
                            {/receive the gift is invalid/i.test(error)
                                ? "We couldn't find that Minecraft account. Check the spelling and try again."
                                : error}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default PackageModal;
