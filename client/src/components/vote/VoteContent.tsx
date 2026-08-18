import styles from "./VoteContent.module.scss";
import VoteLinkButton from "@/components/vote/components/votelink/VoteLinkButton.tsx";
import Label from "@/components/label/Label.tsx";
import TopVoters from "@/components/vote/components/topvoter/TopVoters.tsx";
import {DATE} from "@/constants.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faGift, faRankingStar, faTrophy} from "@fortawesome/free-solid-svg-icons";

const voteSites = [
    {label: 'MinecraftServers.org', href: 'https://minecraftservers.org/vote/658337'},
    {label: 'Minecraft Server List', href: 'https://minecraft-server-list.com/server/501583/vote'},
    {label: 'Minecraft.Buzz', href: 'https://minecraft.buzz/vote/9490'},
    {label: 'Play Minecraft Servers', href: 'https://play-minecraft-servers.com/minecraft-servers/lumamc/?tab=vote'},
    {label: 'Minecraft Menu', href: 'https://minecraft.menu/server-lumamc.4697/vote'},
    {label: 'MineRank', href: 'https://www.minerank.com/lumamc/vote#vote-now'},
];

function VoteContent() {
    const month = DATE.toLocaleString('en-US', { month: 'long' });

    return (
        <main className={styles.background}>
            <Label/>

            <div className={styles.content}>
                <header className={styles.pageIntro}>
                    <span className={styles.eyebrow}>
                        <FontAwesomeIcon icon={faGift}/>
                        Vote daily
                    </span>
                    <h1>Vote for Luma</h1>
                    <p>
                        Help more players discover our community and collect an in-game
                        reward from every site you vote on.
                    </p>
                </header>

                <div className={styles.panelGrid}>
                    <section className={styles.votePanel}>
                        <div className={styles.panelHeading}>
                            <div>
                                <span className={styles.panelIcon}>
                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                                </span>
                                <div>
                                    <h2>Voting sites</h2>
                                    <p>Each site counts as a separate vote.</p>
                                </div>
                            </div>
                            {/* <span className={styles.siteCount}>{voteSites.length}</span> */}
                        </div>

                        <div className={styles.voteLinks}>
                            {voteSites.map((site, index) => (
                                <VoteLinkButton
                                    key={site.href}
                                    href={site.href}
                                    label={site.label}
                                    index={index + 1}
                                />
                            ))}
                        </div>
                        <div className={styles.rewardCallout}>
                            <span className={styles.rewardIcon}>
                                <FontAwesomeIcon icon={faTrophy}/>
                            </span>
                            <p>
                                <strong>Monthly bonus</strong>
                                Top voters earn special rewards at the beginning of the
                                next month!
                            </p>
                        </div>
                    </section>

                    <section className={styles.topVotersPanel}>
                        <div className={styles.panelHeading}>
                            <div>
                                <span className={styles.panelIcon}>
                                    <FontAwesomeIcon icon={faRankingStar}/>
                                </span>
                                <div>
                                    <h2>Top voters</h2>
                                    <p>{month}'s lead voters</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.topVotersContainer}>
                            <TopVoters from={1} to={3}/>
                        </div>

                        <p className={styles.leaderboardNote}>
                            Rankings update as votes are recorded throughout the month!
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default VoteContent;
