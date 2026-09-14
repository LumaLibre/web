import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {GoogleFormSummary, inferGoogleFormKind} from "@/scripts/googleForms.ts";
import {
    fetchGoogleForm,
    fetchGoogleFormsCatalog,
    getCachedGoogleFormsCatalog,
} from "@/scripts/googleFormsSync.ts";
import styles from "./FormsPageContent.module.scss";

const PAGE_SIZE = 3;

function FormsPageContent() {
    const initialCatalog = getCachedGoogleFormsCatalog();
    const [currentPage, setCurrentPage] = useState(0);
    const [catalog, setCatalog] = useState<GoogleFormSummary[] | null>(initialCatalog);
    const [isLoading, setIsLoading] = useState(!initialCatalog);
    const [syncWarning, setSyncWarning] = useState("");
    useEffect(() => {
        let active = true;
        const cached = getCachedGoogleFormsCatalog();
        if (cached) {
            setCatalog(cached);
            setIsLoading(false);
        } else {
            setCatalog(null);
            setIsLoading(true);
        }

        fetchGoogleFormsCatalog()
            .then((result) => {
                if (!active) return;
                setCatalog(result);
                setSyncWarning("");
            })
            .catch(() => {
                if (!active) return;
                if (!cached) setCatalog([]);
                setSyncWarning(cached
                    ? "Some forms may be out of date while we reconnect."
                    : "The latest forms could not be loaded. Please try again shortly.");
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => { active = false; };
    }, []);

    const totalPages = Math.max(1, Math.ceil((catalog?.length ?? 0) / PAGE_SIZE));
    const forms = catalog?.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE) ?? [];

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages - 1));
    }, [totalPages]);

    useEffect(() => {
        const formIds = catalog
            ?.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
            .map((form) => form.id) ?? [];
        if (isLoading || formIds.length === 0) return;
        let active = true;
        const timer = window.setTimeout(() => {
            void (async () => {
                for (const id of formIds) {
                    if (!active) return;
                    try {
                        await fetchGoogleForm(id);
                    } catch {
                        // Preloading is an optional speed optimization.
                    }
                }
            })();
        }, 350);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [catalog, currentPage, isLoading]);

    return (
        <main className={styles.page}>
                <section className={styles.hero}>
                    <p>LumaMC Forms</p>
                    <h1>Let's Jump In.</h1>
                    <span>Applications, surveys, & more. Welcome to our new forms site!</span>
                </section>

                {syncWarning && <p className={styles.syncWarning}>{syncWarning}</p>}

                <section className={styles.carousel} aria-label="Available forms" aria-live="polite">
                    <div className={styles.grid} key={currentPage}>
                        {isLoading && Array.from({length: PAGE_SIZE}, (_, index) => <div className={styles.loadingCard} key={index}/>) }
                        {!isLoading && forms.map((form) => (
                            <Link
                                className={`${styles.formCard} ${!form.acceptingResponses ? styles.closed : ""}`}
                                to={`/forms/${form.id}`}
                                key={form.id}
                                onMouseEnter={() => void fetchGoogleForm(form.id).catch(() => undefined)}
                                onFocus={() => void fetchGoogleForm(form.id).catch(() => undefined)}
                                onTouchStart={() => void fetchGoogleForm(form.id).catch(() => undefined)}
                            >
                                {!form.acceptingResponses && <strong className={styles.closedStamp}>Closed</strong>}
                                <p>{inferGoogleFormKind(form.title)}</p>
                                <h2>{form.title}</h2>
                                <span>{form.description.split("\n")[0]}</span>
                                <footer>
                                    <small>{form.questionCount} questions · About {form.estimatedMinutes} min</small>
                                    <strong>Open form</strong>
                                </footer>
                            </Link>
                        ))}
                        {!isLoading && forms.length === 0 && <div className={styles.emptyState}>No forms are available right now.</div>}
                    </div>

                    {totalPages > 1 && (
                        <nav className={styles.carouselNav} aria-label="Forms pages">
                            <button
                                className={styles.carouselNavBack}
                                type="button"
                                aria-label="Previous forms page"
                                onClick={() => setCurrentPage((page) => page - 1)}
                                disabled={currentPage === 0 || isLoading}
                            >
                                <span className={styles.carouselArrow}/>
                            </button>
                            {Array.from({length: totalPages}, (_, page) => (
                                <button
                                    type="button"
                                    key={page}
                                    className={`${styles.carouselNavDot} ${page === currentPage ? styles.activeDot : ""}`}
                                    aria-label={`Show forms page ${page + 1}`}
                                    aria-current={page === currentPage ? "page" : undefined}
                                    onClick={() => setCurrentPage(page)}
                                    disabled={isLoading}
                                />
                            ))}
                            <button
                                className={styles.carouselNavForward}
                                type="button"
                                aria-label="Next forms page"
                                onClick={() => setCurrentPage((page) => page + 1)}
                                disabled={currentPage >= totalPages - 1 || isLoading}
                            >
                                <span className={styles.carouselArrow}/>
                            </button>
                        </nav>
                    )}
                </section>
        </main>
    );
}

export default FormsPageContent;
