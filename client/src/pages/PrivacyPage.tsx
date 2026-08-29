import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import PrivacyPageContent from "@/components/etc/privacy/PrivacyPageContent.tsx";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({
    title: "Privacy",
    description: "LumaMC's privacy policy and information about how website data is handled.",
    path: "/privacy",
});

function PrivacyPage() {
    return (
        <div>
            <Navbar />
            <PrivacyPageContent />
            <Footer />
        </div>
    );
}

export default PrivacyPage;
