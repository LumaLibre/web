import { useState, useEffect } from "react";

const useIsMobile = () => {
    // The server and the browser must produce the same first render. The actual
    // viewport is applied immediately after hydration.
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
};

export default useIsMobile;
