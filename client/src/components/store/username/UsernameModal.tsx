import styles from "./UsernameModal.module.scss";
import {useEffect, useState} from "react";
import {useBasket} from "@/components/store/BasketContext.tsx";
import {useScrollLock} from "@/components/ui/UseScrollLock.ts";

function UsernameModal() {
    const {awaitingUsername, setUsername, cancelUsernamePrompt, username, itemCount} = useBasket();
    const [value, setValue] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSwitching = username !== null;

    useEffect(() => {
        if (awaitingUsername) {
            setValue(username ?? "");
            setError(null);
        }
    }, [awaitingUsername, username]);

    useScrollLock(awaitingUsername);

    useEffect(() => {
        if (!awaitingUsername) {
            return;
        }
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && cancelUsernamePrompt();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [awaitingUsername, cancelUsernamePrompt]);

    if (!awaitingUsername) {
        return null;
    }

    const submit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            await setUsername(value);
            setValue("");
        } catch (e) {
            const message = e instanceof Error ? e.message : "";
            setError(
                /invalid username/i.test(message)
                    ? "We couldn't find that Minecraft account. Check the spelling and try again."
                    : message || "Something went wrong."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.scrim} onClick={cancelUsernamePrompt} role="presentation">
            <div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Enter your Minecraft username"
            >
                <h2>{"Who is this for?"}</h2>
                <p>
                    Enter the Minecraft username that should receive this purchase. We'll
                    link your basket to that account.
                </p>

                {isSwitching && itemCount > 0 && (
                    <p className={styles.warning}>
                        Switching accounts starts a new basket. The {itemCount}{" "}
                        item{itemCount === 1 ? "" : "s"} you've added won't carry over! {">.<"}
                    </p>
                )}

                <input
                    type="text"
                    value={value}
                    autoFocus
                    placeholder="Minecraft username"
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !submitting && submit()}
                    aria-invalid={error !== null}
                />

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.actions}>
                    <button className={styles.cancel} onClick={cancelUsernamePrompt}>
                        Cancel
                    </button>
                    <button
                        className={styles.confirm}
                        onClick={submit}
                        disabled={submitting || value.trim().length === 0}
                    >
                        {submitting ? "Checking…" : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UsernameModal;
