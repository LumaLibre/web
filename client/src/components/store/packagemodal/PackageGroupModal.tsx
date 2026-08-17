import styles from "./PackageGroupModal.module.scss";
import {useEffect} from "react";
import {PackageGroup} from "@/scripts/packageGroups.ts";
import {StorePackage} from "@/scripts/model/Tebex.ts";
import PackageCard from "@/components/store/packagecard/PackageCard.tsx";
import {useScrollLock} from "@/components/ui/UseScrollLock.ts";
import {usePresence} from "@/components/ui/UsePresence.ts";

function PackageGroupModal(
    {group, onClose, onSelectPackage, escapeEnabled = true}: {
        group: PackageGroup | null,
        onClose: () => void,
        onSelectPackage: (storePackage: StorePackage) => void,
        escapeEnabled?: boolean
    }
) {
    const {rendered, closing} = usePresence(group);

    useScrollLock(rendered !== null);

    useEffect(() => {
        if (!group || !escapeEnabled) {
            return;
        }
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [group, escapeEnabled, onClose]);

    if (!rendered) {
        return null;
    }

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
                aria-label={`Choose a ${rendered.name} option`}
            >
                <header className={styles.header}>
                    <div>
                        {rendered.prefix && <span className={styles.prefix}>{rendered.prefix}</span>}
                        <h2>{rendered.name}</h2>
                        <p>Choose the bundle you'd like.</p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </header>

                <div className={styles.options}>
                    {rendered.packages.map(storePackage => (
                        <PackageCard
                            key={storePackage.id}
                            storePackage={storePackage}
                            onSelect={() => onSelectPackage(storePackage)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PackageGroupModal;
