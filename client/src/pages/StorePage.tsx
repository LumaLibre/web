import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import StoreContent from "@/components/store/StoreContent.tsx";
import {BasketProvider} from "@/components/store/BasketContext.tsx";
import {setTitle} from "@/App.tsx";
import {Navigate, useLocation} from "react-router-dom";
import {storeLinkRedirect} from "@/scripts/storeLinks.ts";

function StorePage() {
    setTitle('Store')
    const location = useLocation();
    const redirect = location.pathname.replace(/\/+$/, "") === "/store"
        ? storeLinkRedirect(location.search)
        : null;
    if (redirect) return <Navigate to={redirect} replace/>;

    return (
        <BasketProvider>
            <div>
                <Navbar />
                <StoreContent />
                <Footer />
            </div>
        </BasketProvider>
    );
}

export default StorePage;
