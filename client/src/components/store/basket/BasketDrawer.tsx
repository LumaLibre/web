import styles from "./BasketDrawer.module.scss";
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useBasket} from "@/components/store/BasketContext.tsx";
import {formatPrice} from "@/scripts/tebex.ts";
import {beginAuth, getAuthOptions, isBasketAuthorized, launchCheckout} from "@/scripts/checkout.ts";
import {BasketAuthOption} from "@/scripts/model/Tebex.ts";

function BasketDrawer({open, onClose}: { open: boolean, onClose: () => void }) {
    const {basket, error, setQuantity, removePackage, applyCoupon, completeBasket} = useBasket();
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState("");
    const [authOptions, setAuthOptions] = useState<BasketAuthOption[] | null>(null);
    const [busy, setBusy] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    // TODO: Change this
    // Swallow errors for packages that need discord integration
    const basketError = error && /adding the package to your basket|options provided is invalid/i.test(error)
        ? null
        : error;

    const currency = basket?.currency ?? "USD";
    const isEmpty = !basket || basket.packages.length === 0;

    const handleCheckout = async () => {
        if (!basket || isEmpty) {
            return;
        }
        setBusy(true);
        setCheckoutError(null);
        try {
            if (!isBasketAuthorized(basket)) {
                const options = await getAuthOptions(basket);
                if (options.length > 0) {
                    if (options.length === 1) {
                        beginAuth(options[0]);
                    } else {
                        setAuthOptions(options);
                    }
                    return;
                }
            }
            // Tebex.js pays in a popup, so the page underneath has to navigate itself.
            launchCheckout(basket, {
                onComplete: () => {
                    completeBasket();
                    onClose();
                    navigate("/store/complete");
                },
                onError: () => setCheckoutError("Payment could not be completed.")
            });
        } catch (e) {
            setCheckoutError(e instanceof Error ? e.message : "Could not start checkout.");
        } finally {
            setBusy(false);
        }
    };

    const handleApplyCoupon = async () => {
        const code = couponCode.trim();
        if (!code) {
            return;
        }
        await applyCoupon(code);
        setCouponCode("");
    };

    return (
        <>
            <div
                className={`${styles.scrim} ${open ? styles.scrimOpen : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}>
                <header className={styles.header}>
                    <h2>Your basket</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close basket">
                        ×
                    </button>
                </header>

                <div className={styles.items}>
                    {isEmpty && (
                        <p className={styles.empty}>
                            Your basket is empty.
                            <p className={styles.authedAs}>
                                See the <Link to="/news/supporting-luma">breakdown</Link>
                            </p>
                        </p>
                    )}

                    {basket?.packages.map(item => (
                        <div className={styles.item} key={item.id}>
                            {item.image && <img src={item.image} alt={item.name}/>}
                            <div className={styles.itemBody}>
                                <span className={styles.itemName}>{item.name}</span>
                                {/* Gifts go to someone else, so say so before payment. */}
                                {item.in_basket.gift_username && (
                                    <span className={styles.giftTo}>
                                        Gift for {item.in_basket.gift_username}
                                    </span>
                                )}
                                <span className={styles.itemPrice}>
                                    {formatPrice(item.in_basket.price, currency)}
                                </span>
                                <div className={styles.quantityRow}>
                                    <button
                                        onClick={() => setQuantity(item.id, item.in_basket.quantity - 1)}
                                        aria-label={`Decrease quantity of ${item.name}`}
                                    >
                                        −
                                    </button>
                                    <span>{item.in_basket.quantity}</span>
                                    <button
                                        onClick={() => setQuantity(item.id, item.in_basket.quantity + 1)}
                                        aria-label={`Increase quantity of ${item.name}`}
                                    >
                                        +
                                    </button>
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => removePackage(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!isEmpty && (
                    <div className={styles.summary}>
                        <div className={styles.couponRow}>
                            <input
                                type="text"
                                value={couponCode}
                                placeholder="Coupon code"
                                onChange={e => setCouponCode(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                            />
                            <button onClick={handleApplyCoupon}>Apply</button>
                        </div>

                        {basket && basket.coupons.length > 0 && (
                            <p className={styles.appliedCoupon}>
                                Coupon applied: {basket.coupons.map(c => c.code).join(", ")}
                            </p>
                        )}

                        {/* Totals come straight from Tebex — tax and discounts are
                            computed server-side and must not be recalculated here. */}
                        <div className={styles.totalRow}>
                            <span>Subtotal</span>
                            <span>{formatPrice(basket!.base_price, currency)}</span>
                        </div>
                        {basket!.sales_tax > 0 && (
                            <div className={styles.totalRow}>
                                <span>Tax</span>
                                <span>{formatPrice(basket!.sales_tax, currency)}</span>
                            </div>
                        )}
                        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                            <span>Total</span>
                            <span>{formatPrice(basket!.total_price, currency)}</span>
                        </div>

                        {authOptions && (
                            <div className={styles.authOptions}>
                                <p>Sign in to link this purchase to your account:</p>
                                {authOptions.map(option => (
                                    <button key={option.name} onClick={() => beginAuth(option)}>
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {basket?.username && (
                            <p className={styles.authedAs}>
                                Purchasing as {basket.username} — <Link to="/news/supporting-luma">Breakdown</Link>
                            </p>
                        )}

                        <button
                            className={styles.checkoutButton}
                            onClick={handleCheckout}
                            disabled={busy}
                        >
                            {busy ? "Please wait…" : isBasketAuthorized(basket!) ? "Checkout" : "Sign in & checkout"}
                        </button>
                    </div>
                )}

                {(basketError || checkoutError) && (
                    <p className={styles.error}>{checkoutError ?? basketError}</p>
                )}
            </aside>
        </>
    );
}

export default BasketDrawer;
