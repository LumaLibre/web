import styles from "./LoadingPageContent.module.scss";
import fullLuma from "@/assets/lumas/FullLuma.webp";
// import blackLumaAlert from "@/assets/lumas/BlackLumaAlert.webp";
// import breweryLuma from "@/assets/lumas/LumaBrewery.webp";
// import fishingLuma from "@/assets/lumas/LumaFishing.webp";
// import hungryLuma from "@/assets/lumas/HungryLuma.webp";
// import {getRandomElement} from "@/utils.ts";

// const lumaImages = [
//     fullLuma,
//     hungryLuma,
//     blackLumaAlert,
//     breweryLuma,
//     fishingLuma
// ];

function LoadingPageContent() {
    return (
        <div className={styles.background}>
            <div className={styles.loadingLumaImageContainer}>
                <img src={fullLuma} alt="Loading..." className={styles.loadingLumaImage} />
            </div>
        </div>
    );
}

export default LoadingPageContent;