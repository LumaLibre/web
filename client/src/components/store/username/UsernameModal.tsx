import styles from "./UsernameModal.module.scss";
import {useEffect, useState} from "react";
import {useBasket} from "@/components/store/BasketContext.tsx";
import {useScrollLock} from "@/components/ui/UseScrollLock.ts";
import {isBedrockUsername, MinecraftEdition, normalizeMinecraftUsername} from "@/scripts/minecraftUsername.ts";

function UsernameModal() {
    const {awaitingUsername, setUsername, cancelUsernamePrompt, username, itemCount} = useBasket();
    const [value, setValue] = useState("");
    const [edition, setEdition] = useState<MinecraftEdition>("java");
    const [detectedBedrock, setDetectedBedrock] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSwitching = username !== null;

    useEffect(() => {
        if (awaitingUsername) {
            setValue(username ?? "");
            setEdition(username && isBedrockUsername(username) ? "bedrock" : "java");
            setDetectedBedrock(false);
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
        const normalized = normalizeMinecraftUsername(value, edition);
        if (submitting || !normalized) return;
        setSubmitting(true);
        setError(null);
        try {
            await setUsername(normalized);
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
                    {edition === "java"
                        ? "Enter the Minecraft username that should receive this purchase. We'll link your basket to that account."
                        : "Enter your Xbox gamertag or your username as it appears in-game. We'll link your basket to that account."}
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
                    placeholder={edition === "java" ? "Minecraft username" : "Xbox gamertag"}
                    aria-label={edition === "java" ? "Minecraft username" : "Xbox gamertag"}
                    disabled={submitting}
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    onChange={e => {
                        const next = e.target.value;
                        setValue(next);
                        setError(null);
                        if (edition === "java" && isBedrockUsername(next)) {
                            setEdition("bedrock");
                            setDetectedBedrock(true);
                        }
                    }}
                    onKeyDown={e => e.key === "Enter" && !submitting && submit()}
                    aria-invalid={error !== null}
                />
                {edition === "bedrock" && value.trim() !== "" && (
                    <p className={styles.namePreview}>
                        In-game: {normalizeMinecraftUsername(value, "bedrock") || ".Steve"}
                    </p>
                )}

                {detectedBedrock && <p className={styles.notice} role="status">This looks like a Bedrock username!</p>}
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.footer}>
                    <div className={styles.editions} role="group" aria-label="Minecraft edition">
                        {(["java", "bedrock"] as const).map(option => (
                            <button key={option} type="button" aria-pressed={edition === option}
                                    disabled={submitting} onClick={() => {
                                setEdition(option);
                                setDetectedBedrock(false);
                                setError(null);
                                if (option === "java") setValue(current => current.replace(/^\s*\./, ""));
                            }}>
                                {option === "java" ? "Java" : "Bedrock"}
                            </button>
                        ))}
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.cancel} onClick={cancelUsernamePrompt}>
                            Cancel
                        </button>
                        <button
                            className={styles.confirm}
                            onClick={submit}
                            disabled={submitting || !normalizeMinecraftUsername(value, edition)}
                        >
                            {submitting ? "Checking…" : "Continue"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UsernameModal;
