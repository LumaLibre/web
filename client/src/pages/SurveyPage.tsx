import Footer from "@/components/footer/Footer.tsx";
import Navbar from "@/components/navbar/Navbar.tsx";
import SurveyPageContent from "@/components/forms/SurveyPageContent.tsx";
import styles from "@/components/forms/SurveyPageContent.module.scss";

function SurveyPage() {
    return (
        <div className={styles.surveyPage}>
            <Navbar/>
            <SurveyPageContent/>
            <Footer/>
        </div>
    );
}

export default SurveyPage;
