import {useEffect, useState} from "react";

// Keeps a value mounted after it is cleared so an exit animation can play.
export function usePresence<T>(value: T | null, duration = 180): {
    rendered: T | null;
    closing: boolean;
} {
    const [rendered, setRendered] = useState<T | null>(value);

    useEffect(() => {
        if (value !== null) {
            setRendered(value);
            return;
        }
        const timer = window.setTimeout(() => setRendered(null), duration);
        return () => window.clearTimeout(timer);
    }, [value, duration]);

    return {rendered, closing: value === null && rendered !== null};
}
