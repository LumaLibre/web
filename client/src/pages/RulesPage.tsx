import RulesContent from "@/components/rules/RulesContent.tsx";
import Footer from "@/components/footer/Footer.tsx";
import Navbar from "@/components/navbar/Navbar.tsx";
import {setTitle} from "@/App.tsx";

function RulesPage() {
    setTitle('Rules');

    return (
        <div>
            <Navbar />
            <RulesContent />
            <Footer />
        </div>

    );
}

export default RulesPage;