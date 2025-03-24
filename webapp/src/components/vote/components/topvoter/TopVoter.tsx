import { useEffect, useState } from "react";
import { RecordedVoter } from "@/scripts/model/RecordedVoter.ts";
import styles from "./TopVoter.module.scss";

const isSmallDisplay = () => {
    return window.innerWidth <= 468;
};
const isMobile = () => {
    return window.innerWidth <= 768;
}

const TopVoter = ({ recordedVoter, index }: { recordedVoter: RecordedVoter, index: number }) => {
    const [smallDisplay, setSmallDisplay] = useState(isSmallDisplay());

    useEffect(() => {
        const handleResize = () => {
            setSmallDisplay(isSmallDisplay());
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const name = recordedVoter.name || "Voter";
    const truncatedName = (name.length > 10 && isMobile()) ? `${name.substring(0, 10)}...` : name;
    const votes = recordedVoter.votes;
    const imageUrl = smallDisplay ? recordedVoter.getHeadRenderURL() : recordedVoter.getBodyRenderURL();

    return (
        <div className={styles.topVoterContainer}>
            <div className={styles.bodyRenderContainer}>
                <img src={imageUrl} alt={name} className={styles.bodyRenderImage} />
            </div>
            <div className={styles.textContainer}>
                <div className={styles.textStyling}>
                    <h5>#{index}<br/>{truncatedName}</h5>
                    <h4>{votes} Votes</h4>
                </div>
            </div>
        </div>
    );
};

export default TopVoter;