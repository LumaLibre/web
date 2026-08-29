import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import StoreCompleteContent from "@/components/store/complete/StoreCompleteContent.tsx";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({title: "Thank you", path: "/store/complete", noIndex: true});

function StoreCompletePage() {
    return (
        <div>
            <Navbar />
            <StoreCompleteContent />
            <Footer />
        </div>
    );
}

export default StoreCompletePage;
