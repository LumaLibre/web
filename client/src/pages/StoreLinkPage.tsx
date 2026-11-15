import {useEffect, useRef, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import {BasketProvider, useBasket} from "@/components/store/BasketContext.tsx";
import UsernameModal from "@/components/store/username/UsernameModal.tsx";
import PackageModal from "@/components/store/packagemodal/PackageModal.tsx";
import BasketDrawer from "@/components/store/basket/BasketDrawer.tsx";
import {fetchPackage, isStoreConfigured} from "@/scripts/tebex.ts";
import {hasRequiredOptions} from "@/scripts/packageOptions.ts";
import {configuredPackageLimit, fetchKnownPackageLimits, packageLimitMessage} from "@/scripts/packageLimits.ts";
import {StorePackage} from "@/scripts/model/Tebex.ts";
import {parseStoreLink, storeLinkReturnPath, StoreLink} from "@/scripts/storeLinks.ts";
import {consumePendingPackage} from "@/scripts/discordAuth.ts";
import {setTitle} from "@/App.tsx";
import styles from "./StoreLinkPage.module.scss";

type Step = {type: "start" | "username" | "queued" | "packages" | "options" | "done" | "failed"};

type StoreLinkRequest = {link: StoreLink | null; error: string | null};

function StoreLinkContent({request}: {request: StoreLinkRequest}) {
    const location = useLocation();
    const navigate = useNavigate();
    const {basket, username, loading, awaitingUsername, setUsername, changeUsername, addPackage, addedCount, error} = useBasket();
    const [step, setStep] = useState<Step>({type: "start"});
    const [message, setMessage] = useState<string | null>(request.error);
    const [retryStep, setRetryStep] = useState<Step | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<StorePackage | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [autoCheckout, setAutoCheckout] = useState(false);
    const [quantityDisabledIds, setQuantityDisabledIds] = useState<Set<number>>(new Set());
    const nextPackage = useRef(0);
    const previousAddedCount = useRef(0);
    const runningStep = useRef<Step | null>(null);
    const consumed = useRef(false);

    useEffect(() => {
        if (consumed.current) return;
        consumed.current = true;
        consumePendingPackage();
        // Keep the non-mutating override on refresh, while consuming additions and account changes.
        navigate(`${location.pathname}${request.link?.overrideNotForSale ? "?override=true" : ""}`, {replace: true});
    }, [location.pathname, navigate, request]);

    useEffect(() => {
        if (loading || !request.link || step.type === "done" || step.type === "failed") return;
        if (step.type === "username" || step.type === "queued") {
            if (awaitingUsername) return;
            if (step.type === "queued" && addedCount > previousAddedCount.current) {
                nextPackage.current++;
                setStep({type: "packages"});
            } else if (step.type === "username" && basket) {
                setStep({type: "packages"});
            } else {
                setMessage(error ?? "The store link was cancelled.");
                setStep({type: "done"});
            }
            return;
        }
        if (step.type === "options") {
            if (addedCount > previousAddedCount.current) {
                nextPackage.current++;
                setSelectedPackage(null);
                setStep({type: "packages"});
            }
            return;
        }

        if (runningStep.current === step) return;
        runningStep.current = step;
        const link = request.link;
        let canRetry = step.type === "packages";
        const run = async () => {
            if (!isStoreConfigured()) throw new Error("The store isn't connected yet.");
            if (step.type === "start") {
                const name = link.username ?? username;
                if (name && (!basket || basket.username?.toLowerCase() !== name.toLowerCase())) {
                    await setUsername(name);
                } else if (!name && (link.packageIds.length > 0 || link.promptUsername)) {
                    changeUsername();
                    setStep({type: "username"});
                    return;
                }
                setStep({type: "packages"});
                return;
            }
            const id = link.packageIds[nextPackage.current];
            if (id === undefined) {
                const details = await Promise.all((basket?.packages ?? []).map(item => fetchPackage(item.id, basket?.ident)));
                setQuantityDisabledIds(new Set(details.filter(item => item.disable_quantity).map(item => item.id)));
                setDrawerOpen(link.packageIds.length > 0 || link.checkout);
                setAutoCheckout(link.checkout);
                setStep({type: "done"});
                return;
            }
            const detail = await fetchPackage(id, basket?.ident);
            const availability = await fetchKnownPackageLimits();
            canRetry = false;
            const limit = configuredPackageLimit(availability[id], link.overrideNotForSale);
            if (limit) throw new Error(`${detail.name}: ${packageLimitMessage(limit)}`);
            if (detail.disable_quantity) {
                setQuantityDisabledIds(ids => new Set([...ids, id]));
                if (link.quantity !== 1) throw new Error(`${detail.name} only supports a quantity of 1.`);
            }
            if (hasRequiredOptions(detail)) {
                previousAddedCount.current = addedCount;
                setSelectedPackage(detail);
                setStep({type: "options"});
                return;
            }
            previousAddedCount.current = addedCount;
            // A failed mutation can have an ambiguous result; only offer retries for reads.
            canRetry = false;
            const result = await addPackage(id, link.quantity);
            if (result === "failed") {
                setMessage("This package could not be added. Check the basket error below.");
                setDrawerOpen(true);
                setStep({type: "failed"});
            } else if (result === "queued") {

                setStep({type: "queued"});
            } else {
                nextPackage.current++;
                setStep({type: "packages"});
            }
        };
        void run().catch(e => {
            setMessage(e instanceof Error ? e.message : "Could not process this store link.");
            setRetryStep(canRetry ? step : null);
            setStep({type: "failed"});
        });
    }, [loading, request, step, awaitingUsername, basket, username, setUsername, changeUsername, addPackage, addedCount, error]);

    return <>
        <main className={styles.screen}>
            <h1>{request.link?.checkout ? "Checkout" : "Your basket"}</h1>
            {message ? <p role="alert">{message}</p> : <p role="status">
                {step.type === "done" ? "Your basket is ready." : step.type === "options"
                    ? "Complete the package details to continue." : step.type === "username"
                        ? "Enter your Minecraft username to continue." : "Preparing your basket…"}
            </p>}
            {error && <p role="alert">{error}</p>}
            {basket && <p>Purchasing as <strong>{basket.username ?? username}</strong></p>}
            <div className={styles.actions}>
                {retryStep && <button onClick={() => {
                    setMessage(null);
                    setStep({...retryStep});
                    setRetryStep(null);
                }}>Retry</button>}
                <Link to="/store">Continue shopping</Link>
                <button onClick={() => setDrawerOpen(true)}>View basket</button>
            </div>
        </main>
        <UsernameModal/>
        <PackageModal storePackage={selectedPackage} quantity={request.link?.quantity}
            discordReturnTo={request.link ? storeLinkReturnPath(request.link, nextPackage.current) : undefined}
            onClose={() => {
                setSelectedPackage(null);
                setMessage("The store link was cancelled. Packages already added are still in your basket.");
                setStep({type: "done"});
            }}/>
        <BasketDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
            quantityDisabledPackageIds={quantityDisabledIds} autoCheckout={autoCheckout}/>
    </>;
}

export default function StoreLinkPage() {
    setTitle("Checkout");
    const location = useLocation();
    const [request] = useState<StoreLinkRequest>(() => {
        try { return {link: parseStoreLink(location.pathname, location.search), error: null}; }
        catch (e) { return {link: null, error: e instanceof Error ? e.message : "Invalid store link."}; }
    });
    return <BasketProvider overrideNotForSale={request.link?.overrideNotForSale}>
        <Navbar/><StoreLinkContent request={request}/><Footer/>
    </BasketProvider>;
}
