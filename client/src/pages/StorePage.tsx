import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import StoreContent from "@/components/store/StoreContent.tsx";
import {BasketProvider} from "@/components/store/BasketContext.tsx";
import {setTitle} from "@/App.tsx";

function StorePage() {
    setTitle('Store')

    return (
        <BasketProvider>
            <div>
                <Navbar />
                <StoreContent />
                <Footer />
            </div>
        </BasketProvider>
    );
}

export default StorePage;
