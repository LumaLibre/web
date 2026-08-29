import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import NotFoundPageContent from "@/components/etc/404/404PageContent.tsx";

function NotFoundPage() {
    return (
        <div>
            <Navbar />
            <NotFoundPageContent />
            <Footer />
        </div>
    );
}

export default NotFoundPage;