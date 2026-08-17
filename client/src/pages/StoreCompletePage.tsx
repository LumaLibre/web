import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import StoreCompleteContent from "@/components/store/complete/StoreCompleteContent.tsx";
import {setTitle} from "@/App.tsx";

function StoreCompletePage() {
    setTitle('Thank you')

    return (
        <div>
            <Navbar />
            <StoreCompleteContent />
            <Footer />
        </div>
    );
}

export default StoreCompletePage;
