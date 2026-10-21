import styles from "./PackageModal.module.scss";
import {CSSProperties, useEffect, useRef, useState} from "react";
import offerStyles from "@/components/store/overview/OfferPreview.module.scss";
import StockBadge from "@/components/store/packagecard/StockBadge.tsx";
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
import {packageLabel} from "@/scripts/packageGroups.ts";
import {packageLimitMessage} from "@/scripts/packageLimits.ts";
import SoldOutStamp from "@/components/store/packagecard/SoldOutStamp.tsx";
import PackageLimitDetails from "@/components/store/packagecard/PackageLimitDetails.tsx";

function PackageModal(
    {storePackage: selected, onClose, hideDescription = false, offerOrigin}: {
        storePackage: StorePackage | null;
        onClose: () => void;
        hideDescription?: boolean;
        offerOrigin?: {left: number; top: number; width: number; height: number};
    }
) {
    const {addPackage, error, basket, packageLimit, awaitingUsername} = useBasket();
    const modalRef = useRef<HTMLDivElement>(null);
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

    const {data: packageDetail, isLoading: packageDetailLoading, error: packageDetailError} = useQuery<StorePackage>({
        queryKey: ["storePackage", storePackage?.id, basket?.ident],
        queryFn: () => fetchPackage(storePackage!.id, basket?.ident),
        enabled: storePackage !== null
    });

    useScrollLock(storePackage !== null);

    useEffect(() => {
        if (!selected || awaitingUsername) {
            return;
        }
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selected, onClose, awaitingUsername]);

    useEffect(() => {
        if (!storePackage || !offerOrigin) return;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        return () => { if (previous?.isConnected) previous.focus({preventScroll: true}); };
    }, [storePackage?.id, Boolean(offerOrigin)]);

    useEffect(() => {
        if (!storePackage || !offerOrigin || awaitingUsername) return;
        const modal = modalRef.current;
        modal?.querySelector<HTMLButtonElement>("button")?.focus({preventScroll: true});
        const trap = (event: KeyboardEvent) => {
            if (event.key !== "Tab" || !modal) return;
            const items = [...modal.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]')]
                .filter(item => item.getClientRects().length);
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        modal?.addEventListener("keydown", trap);
        return () => { modal?.removeEventListener("keydown", trap); };
    }, [storePackage?.id, Boolean(offerOrigin), awaitingUsername]);

    if (!storePackage) {
        return null;
    }

    const pricing = pricingOf(storePackage);
    const limit = packageLimit(storePackage.id);
    const giftLimit = giftTo.trim() ? packageLimit(storePackage.id, giftTo.trim()) : null;
    const image = storePackage.image
        ?? storePackage.media?.find(m => m.primary && m.type === "image")?.url
        ?? null;

    const canGift = String(webstore?.supports_gifting) === "true"
        && !storePackage.disable_gifting;

    const options = requiredOptions(packageDetail ?? storePackage);
    const discordOption = options.find(option => option.type === "discord_id") ?? null;
    const textOptions = options.filter(option => option.type !== "discord_id");
    const needsDiscordLogin = discordOption !== null && !discord && DISCORD_PUBLIC_CLIENT_ID !== "";
    const canShowPurchaseActions = !packageDetailLoading && !packageDetailError && !needsDiscordLogin;

    // The grid has no `options` for a package, so its add fails and lands here.
    // That 400 is expected and the option controls already say what is needed.
    const genericAddError = error !== null
        && /adding the package to your basket|options provided is invalid/i.test(error);
    const label = packageLabel(storePackage.name);
    const requiredRank = genericAddError && label.prefix && /\brank$/i.test(label.name)
        ? label.prefix
            .replace(/^[^\p{L}\p{N}]+/u, "")
            .replace(/\s+only$/i, "")
            .trim()
        : null;
    const purchaseError = requiredRank
        ? `You need to own the ${requiredRank} rank before purchasing ${label.name}.`
        : error;
    const isMissingOptionsError = options.length > 0 && genericAddError && !requiredRank;

    const handleAdd = async (targetUsername?: string) => {
        if (adding || packageDetailLoading || packageDetailError || packageLimit(storePackage.id, targetUsername)) return;
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
            className={`${styles.scrim} ${offerOrigin ? offerStyles.scrim : ""} ${closing ? styles.closing : ""}`}
            onClick={onClose}
            role="presentation"
        >
            <div
                ref={modalRef}
                className={`${styles.modal} ${offerOrigin ? offerStyles.modal : ""} ${closing ? styles.closing : ""}`}
                style={offerOrigin ? {
                    "--from-x": `${offerOrigin.left + offerOrigin.width / 2 - window.innerWidth / 2}px`,
                    "--from-y": `${offerOrigin.top + offerOrigin.height / 2 - window.innerHeight / 2}px`,
                    "--from-scale": String(offerOrigin.width / Math.min(680, window.innerWidth - 48))
                } as CSSProperties : undefined}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={storePackage.name}
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>

                <div className={`${styles.content} ${offerOrigin ? offerStyles.content : ""}`}>
                    {image && (
                        <div className={styles.imagePanel}>
                            {limit && <SoldOutStamp/>}
                            <img src={image} alt={storePackage.name}/>
                        </div>
                    )}

                    <div className={styles.details}>
                        {offerOrigin && <span className={offerStyles.eyebrow}>Limited-time offer</span>}
                        <h2 className={`${styles.name} ${offerOrigin ? offerStyles.title : ""}`}>{storePackage.name}</h2>
                        {offerOrigin && <div className={offerStyles.stock}><StockBadge packageIds={[storePackage.id]}/></div>}

                        {!hideDescription && <div
                            className={styles.description}
                            dangerouslySetInnerHTML={storeHtml(storePackage.description)}
                        />}
                    </div>
                </div>

                {/* Outside the scrolling area so price and CTA stay visible no
                    matter how long the description is. */}
                <div className={styles.actionBar}>
                    <div className={styles.priceSummary}>
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
                        <PackageLimitDetails packageId={storePackage.id} showStock={!offerOrigin}/>
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
                        {(canShowPurchaseActions || limit) && (
                            <button
                                className={styles.addButton}
                                onClick={() => handleAdd()}
                                disabled={adding || limit !== null}
                            >
                                {limit ? "Sold Out!" : adding ? "Adding…" : "Add to basket"}
                            </button>
                        )}

                        {canGift && canShowPurchaseActions && limit !== "global" && (
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

                        {needsDiscordLogin && !limit && (
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

                    {canGift && canShowPurchaseActions && limit !== "global" && giftOpen && (
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
                                disabled={adding || giftTo.trim().length === 0 || giftLimit !== null}
                            >
                                {giftLimit ? "Sold Out!" : "Gift"}
                            </button>
                        </div>
                    )}

                    {/* Tebex resolves the recipient on the add call, so an
                        unknown name is reported here rather than at checkout. */}
                    {packageDetailError ? <p className={styles.actionError} role="alert">We couldn't load this package. Please close it and try again.</p> : (limit || giftLimit) ? (
                        <p className={styles.actionHint} role="status">
                            {packageLimitMessage((giftOpen && giftLimit) || limit || giftLimit!)}
                        </p>
                    ) : needsDiscordLogin ? (
                        <p className={styles.actionHint}>
                            You'll need to sign into Discord in order to purchase this package.
                        </p>
                    ) : purchaseError && !isMissingOptionsError ? (
                        <p className={styles.actionError}>
                            {/receive the gift is invalid/i.test(purchaseError)
                                ? "We couldn't find that Minecraft account. Check the spelling and try again."
                                : purchaseError}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default PackageModal;
