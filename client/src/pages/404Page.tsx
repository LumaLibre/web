import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import NotFoundPageContent from "@/components/etc/404/404PageContent.tsx";
import {data} from "react-router";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({title: "Page not found", noIndex: true});
export const loader = () => data(null, {status: 404});

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
