import Header from "@/components/homepage/header/Header.tsx";
import Footer from "@/components/footer/Footer.tsx";
import {setTitle} from "@/App.tsx";

function MainPage() {
    setTitle('Home');

    return (
        <div>
            <Header />
            <Footer />
        </div>
    );
}

export default MainPage;