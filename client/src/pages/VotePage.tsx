import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import VoteContent from "@/components/vote/VoteContent.tsx";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({
    title: "Vote",
    description: "Vote for LumaMC, help the community grow, and earn in-game rewards.",
    path: "/vote",
});


function VotePage() {
    return (
        <div>
            <Navbar />
            <VoteContent />
            <Footer />
        </div>
    );
}

export default VotePage;
