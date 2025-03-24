import styles from "./Footer.module.scss"
import lumaLogo from "@/assets/LogoSmall.webp"
import {useQuery} from "@tanstack/react-query";
import {fetchServerStatus} from "@/scripts/serverStatuses.ts";
import {DATE, DISCORD_INV, LUMA_IP_ADDRESS, STORE, WIKI} from "@/constants.ts";
import {JSX, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import sourceCodeIcon from "@/assets/icons/SourceCodeIcon.webp";
import wikiIcon from "@/assets/icons/WikiIcon.webp";
import tiktokIcon from "@/assets/icons/TikTokIcon.webp";
import storeIcon from "@/assets/icons/StoreIcon.webp";
import discordIcon from "@/assets/icons/DiscordIcon.webp";

const linkElement = (link: string, element: JSX.Element) => {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer">
            {element}
        </a>
    );
};

function Footer() {
    const currentYear = DATE.getFullYear();
    let { data: rawStatus, isLoading, isError } = useQuery<string>({
        queryKey: ["mcServerStatus"],
        queryFn: fetchServerStatus,
    });
    const snapshotLoading = isLoading || isError || !rawStatus;
    rawStatus = snapshotLoading ? "Loading..." : rawStatus;

    const statusText = snapshotLoading ? rawStatus : `Join ${rawStatus}!`;

    const [hoverText, setHoverText] = useState(statusText);
    useEffect(() => {
        setHoverText(statusText);
    }, [statusText]);

    return (
        <footer className={styles.footerContainer}>
            <div className={styles.footerTopContainer}>
                <div className={styles.footerTopItems}>
                    <img src={lumaLogo} alt="Luma Logo" className={styles.logoSmall}/>
                    <div className={styles.serverCount}
                         onMouseEnter={() => setHoverText("Click to copy!")}
                         onMouseLeave={() => setHoverText(statusText)}
                         onClick={() => {
                             navigator.clipboard.writeText(LUMA_IP_ADDRESS);
                             setHoverText("Copied, see you there!");
                         }}
                    >
                        <h4>{LUMA_IP_ADDRESS}</h4>
                        <h5>{hoverText}</h5>
                    </div>
                </div>
                <div className={styles.footerTopLinksContainer}>
                    {linkElement(DISCORD_INV, <img src={discordIcon} alt="Discord" className={styles.discordIcon}/>)}
                    {linkElement(STORE, <img src={storeIcon} alt="Store" className={styles.storeIcon}/>)}
                    {linkElement("https://www.tiktok.com/@playlumamc", <img src={tiktokIcon} alt="Tiktok" className={styles.tiktokIcon}/>)}
                    {linkElement(WIKI, <img src={wikiIcon} alt="Wiki" className={styles.wikiIcon}/>)}
                </div>
            </div>
            <div className={styles.footerBottomContainer}>
                <div className={styles.footerBottomTextContainer}>
                <h3>© {currentYear} LumaMC. All rights reserved.</h3>
                    <p>We are not affiliated with Mojang AB.</p>
                </div>
                <div className={styles.footerBottomItems}>
                    <a href="https://github.com/LumaLibre/web" target="_blank" rel="noopener noreferrer">
                        <img src={sourceCodeIcon} alt="Source Code" className={styles.sourceCodeIcon}/>
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;