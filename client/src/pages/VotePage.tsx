import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import VoteContent from "@/components/vote/VoteContent.tsx";
import {setTitle} from "@/App.tsx";


function VotePage() {
    setTitle('Vote')

    return (
        <div>
            <Navbar />
            <VoteContent />
            <Footer />
        </div>
    );
}

export default VotePage;