import styles from "./SecondaryContent.module.scss";
import generalStyles from "../HeaderSector.module.scss";
import spaceImg from "@/assets/SpaceBackground.webp";


function SecondSection() {
    return (
        <section className={generalStyles.contentBackground}>
            <img src={spaceImg} alt="Main Background" className={generalStyles.contentImage} />
        </section>
    );
}

export default SecondSection;
