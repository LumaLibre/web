import Header from "@/components/homepage/header/Header.tsx";
import Carousel from "@/components/homepage/components/carousel/Carousel.tsx";
import Footer from "@/components/footer/Footer.tsx";
import {setTitle} from "@/App.tsx";
import SecondaryContent from "@/components/homepage/components/secondary/SecondaryContent.tsx";

function MainPage() {
    setTitle('Home');

    return (
        <div>
            <Header />
            {/*<SecondaryContent />*/}
            <Footer />
        </div>
    );
}

export default MainPage;