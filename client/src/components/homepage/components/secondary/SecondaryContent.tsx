import styles from "./SecondaryContent.module.scss";
import generalStyles from "../HeaderSector.module.scss";
import backgroundImage from "@/assets/MainpageBg.png";


function SecondSection() {
    return (
        <section className={styles.contentBackground}>
            <img src={backgroundImage} alt="Main Background" className={generalStyles.contentImage} />
        </section>
    );
}

export default SecondSection;
