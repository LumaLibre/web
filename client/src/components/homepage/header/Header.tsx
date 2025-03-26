import styles from "./Header.module.scss";
import logo from "@/assets/LumaLogoBig.webp";
import littleLuma from "@/assets/lumas/LumaMainLuma.webp";
import SmallTextLogo from "@/assets/LumaText.webp";
import Button from "@/components/ui/Button";
import Navbar from "@/components/navbar/Navbar.tsx";
import Carousel from "@/components/homepage/carousel/Carousel.tsx";
import {DISCORD_INV, LUMA_IP_ADDRESS} from "@/constants.ts";
import {useEffect, useState} from "react";
import LatestNews from "@/components/homepage/latest/LatestNews.tsx";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {useQuery} from "@tanstack/react-query";
import {fetchDiscordStatus, fetchServerStatus} from "@/scripts/serverStatuses.ts";
import {INVIS_CHAR} from "@/utils.ts";
import useIsMobile from "@/components/ui/UseIsMobile.tsx";

function Header() {
    const isMobile = useIsMobile();
    const { data: mcStatus, isLoading: mcStatusIsLoading, isError: mcStatusError } = useQuery<string>({
        queryKey: ["mcServerStatus"],
        queryFn: fetchServerStatus,
    });

    const { data: discordStatus, isLoading: discordStatusIsLoading, isError: discordStatusError } = useQuery<string>({
        queryKey: ["discordServerStatus"],
        queryFn: fetchDiscordStatus
    });

    const safeMcStatus = mcStatusIsLoading || mcStatusError || !mcStatus ? "Loading..." : (isMobile ? mcStatus : `Join ${mcStatus}!`);
    const safeDiscordStatus = discordStatusIsLoading || discordStatusError || !discordStatus ? "Loading..." : discordStatus;

    const [playButtonText, setPlayButtonText] = useState(safeMcStatus);

    // Update playButtonText when mcStatus changes
    useEffect(() => {
        setPlayButtonText(safeMcStatus);
    }, [safeMcStatus]);

    return (
        <section className={styles.headerBackground}>
            <Navbar
                beforeNavbarList={<img src={SmallTextLogo} alt="Luma Logo" className={styles.miniLumaLogo} />}
                afterNavbarList={
                    <Button
                        href={DISCORD_INV} newTab
                        text={<><FontAwesomeIcon icon={faDiscord} /><span> {safeDiscordStatus}</span></>}
                        className={styles.navbarDiscordButton}
                    />
                }
            />
            <img src={logo} alt="Luma Logo" className={styles.logo} />
            <div className={styles.titleTextContainer}>
                <h1 className={styles.welcomeText}>
                    Welcome To <span className={styles.welcomeTextUnderlying}>Luma!</span>
                </h1>
                <img src={littleLuma} alt="Little Luma" className={styles.littleLumaIcon} />
            </div>
            <div className={styles.descriptionContainer}>
                We're a TownySMP server focused on high-quality gameplay and a vibrant, welcoming community.
            </div>

            <Button
                className={styles.playButton}
                buttonContentClassName={styles.playButtonContent}
                text={
                    <>
                        <FontAwesomeIcon icon={faPlay} className={styles.playButtonIcon} />
                        <span>{INVIS_CHAR(1)} {playButtonText}</span>
                    </>
                }
                onClick={() => {
                    navigator.clipboard.writeText(LUMA_IP_ADDRESS);
                    setPlayButtonText(`${INVIS_CHAR(9)}Copied!${INVIS_CHAR(9)}`);
                }}
                onMouseEnter={() => setPlayButtonText(`${INVIS_CHAR(1)}Click to Copy!${INVIS_CHAR(1)}`)}
                onMouseLeave={() => setPlayButtonText(safeMcStatus)}
            />
            <Button
                text={<><FontAwesomeIcon icon={faDiscord} /><span> {safeDiscordStatus}</span></>}
                href={DISCORD_INV}
                className={styles.discordButtonMobile}
                buttonContentClassName={styles.discordButtonMobileContent}
            />
            <Carousel/>
            <LatestNews/>
        </section>
    );
}

export default Header;
