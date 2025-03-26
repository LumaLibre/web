import styles from "./PrivacyPageContent.module.scss";
import Label from "@/components/label/Label.tsx";

function PrivacyPageContent() {
    return (
        <section className={styles.background}>
            <Label />
            <div className={styles.card}>
                <div className={styles.cardContent}>
                    <h1 className={styles.cardTitle}>
                        Privacy Policy
                    </h1>
                    <p className={styles.cardText}>
                        This website does not collect, store, or process any personal data.
                        We do not use cookies, analytics, tracking, or any third-party services
                        that collect user information.
                    </p>
                </div>
            </div>
        </section>
    );
}



export default PrivacyPageContent;