import styles from "./Header.module.scss";
import newLogo from "@/assets/LumaLogoBig.png";
import welcomeText from "@/assets/LumaText.png";
import ipButton from "@/assets/Button.webp";
import { LUMA_IP_ADDRESS } from "@/constants.ts";
import littleLuma from "@/assets/lumas/LumaMainLuma.png";
import SmallTextLogo from "@/assets/LumaText.webp";
import DiscordBtnNav from "@/assets/DiscordButtonImg.png";
import PlayButton from "@/assets/PlayButtonImg.png";
import Button from "@/components/ui/Button";

function Header() {
  return (
    <section className={styles.headerBackground}>
      <div className={styles.welcomeText}>
        <h1>Welcome To</h1>
        <h1>Luma</h1>
      </div>

      <img src={newLogo} alt="Luma Logo" className={styles.newLogo} />
      <img
        src={SmallTextLogo}
        alt="Luma Logo"
        className={styles.miniLumaLogo}
      />
      <div className={styles.discordButton}>
        <Button text="Test" />
      </div>
      <img src={PlayButton} alt="Play Button" className={styles.playButton} />
      <img
        src={littleLuma}
        alt="Little Luma"
        className={styles.littleLumaIcon}
      />

      <div className={styles.descriptionContainer}>
        We're a TownySMP server focused on high-quality gameplay and a vibrant,
        welcoming community. Join us to enjoy unique features like custom items,
        a seasonal world, item wraps, mcMMO, and Towny!
      </div>

      {/*<div className={styles.IPButtonSection}>*/}
      {/*    <div className={styles.IPButtonContainer}>*/}
      {/*        <img src={ipButton} alt="IP Button" className={styles.IPButtonImg} />*/}
      {/*        <h1 className={styles.IPText}>{LUMA_IP_ADDRESS}</h1>*/}
      {/*    </div>*/}
      {/*</div>*/}
    </section>
  );
}

export default Header;
