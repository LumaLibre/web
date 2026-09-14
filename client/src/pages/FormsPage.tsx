import {setTitle} from "@/App.tsx";
import FormsPageContent from "@/components/forms/FormsPageContent.tsx";
import styles from "@/components/forms/FormsPageContent.module.scss";
import Footer from "@/components/footer/Footer.tsx";
import Navbar from "@/components/navbar/Navbar.tsx";

function FormsPage() {
    setTitle("Forms");

    return (
        <div className={styles.formsPage}>
            <Navbar/>
            <FormsPageContent/>
            <Footer/>
        </div>
    );
}

export default FormsPage;
