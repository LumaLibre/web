import RulesContent from "@/components/rules/RulesContent.tsx";
import Footer from "@/components/footer/Footer.tsx";
import Navbar from "@/components/navbar/Navbar.tsx";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({
    title: "Rules",
    description: "Read LumaMC's community, gameplay, store, and conduct rules.",
    path: "/rules",
});

function RulesPage() {
    return (
        <div>
            <Navbar />
            <RulesContent />
            <Footer />
        </div>

    );
}

export default RulesPage;
