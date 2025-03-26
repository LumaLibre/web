import styles from "./LoadingPageContent.module.scss";
import blackLumaAlert from "@/assets/lumas/BlackLumaAlert.webp";
import breweryLuma from "@/assets/lumas/LumaBrewery.webp";
import fishingLuma from "@/assets/lumas/LumaFishing.webp";
import {getRandomElement} from "@/utils.ts";

const lumaImages = [
    blackLumaAlert,
    breweryLuma,
    fishingLuma
];

function LoadingPageContent() {
    return (
        <div className={styles.background}>
            <div className={styles.loadingLumaImageContainer}>
                <img src={getRandomElement(lumaImages)} alt="Loading Luma" className={styles.loadingLumaImage} />
            </div>
        </div>
    );
}

export default LoadingPageContent;