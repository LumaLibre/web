import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import PrivacyPageContent from "@/components/etc/privacy/PrivacyPageContent.tsx";

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