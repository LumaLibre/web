import styles from "./VoteContent.module.scss";
import VoteLinkButton from "@/components/vote/components/votelink/VoteLinkButton.tsx";
import Label from "@/components/label/Label.tsx";
import TopVoters from "@/components/vote/components/topvoter/TopVoters.tsx";
import {DATE} from "@/constants.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faGift, faRankingStar, faTrophy} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";

const voteSites = [
    {label: 'MinecraftServers.org', href: 'https://minecraftservers.org/vote/658337'},
    {label: 'Minecraft Server List', href: 'https://minecraft-server-list.com/server/501583/vote'},
    {label: 'Minecraft.Buzz', href: 'https://minecraft.buzz/vote/9490'},
    {label: 'Play Minecraft Servers', href: 'https://play-minecraft-servers.com/minecraft-servers/lumamc/?tab=vote'},
    {label: 'Minecraft Menu', href: 'https://minecraft.menu/server-lumamc.4697/vote'},
    {label: 'MineRank', href: 'https://www.minerank.com/lumamc/vote'},
];

const VOTE_PROGRESS_STORAGE_KEY = 'luma-vote-progress';
const VOTE_PROGRESS_RESET_MS = 16 * 60 * 60 * 1000;

interface VoteProgress {
    openedSites: string[];
    resetAt: number | null;
}

const emptyVoteProgress = (): VoteProgress => ({openedSites: [], resetAt: null});

const loadVoteProgress = (): VoteProgress => {
    if (typeof window === 'undefined') return emptyVoteProgress();

    try {
        const savedProgress = window.localStorage.getItem(VOTE_PROGRESS_STORAGE_KEY);
        if (!savedProgress) return emptyVoteProgress();

        const parsedProgress = JSON.parse(savedProgress) as Partial<VoteProgress>;
        if (!Array.isArray(parsedProgress.openedSites) || typeof parsedProgress.resetAt !== 'number') {
            window.localStorage.removeItem(VOTE_PROGRESS_STORAGE_KEY);
            return emptyVoteProgress();
        }

        if (parsedProgress.resetAt <= Date.now()) {
            window.localStorage.removeItem(VOTE_PROGRESS_STORAGE_KEY);
            return emptyVoteProgress();
        }

        const validSiteUrls = new Set(voteSites.map(site => site.href));
        return {
            openedSites: [...new Set(parsedProgress.openedSites.filter(
                (siteUrl): siteUrl is string => typeof siteUrl === 'string' && validSiteUrls.has(siteUrl)
            ))],
            resetAt: parsedProgress.resetAt,
        };
    } catch {
        return emptyVoteProgress();
    }
};

const saveVoteProgress = (progress: VoteProgress) => {
    if (typeof window === 'undefined') return;

    try {
        if (progress.resetAt === null) {
            window.localStorage.removeItem(VOTE_PROGRESS_STORAGE_KEY);
        } else {
            window.localStorage.setItem(VOTE_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
        }
    } catch {
        // Voting still works when local storage is unavailable; only persistence is skipped.
    }
};

function VoteContent() {
    const month = DATE.toLocaleString('en-US', { month: 'long' });
    const [voteProgress, setVoteProgress] = useState<VoteProgress>(loadVoteProgress);
    const openedSites = new Set(voteProgress.openedSites);
    const remainingSites = voteSites.length - openedSites.size;

    useEffect(() => {
        if (voteProgress.resetAt === null) return;

        const timeUntilReset = voteProgress.resetAt - Date.now();
        if (timeUntilReset <= 0) {
            const emptyProgress = emptyVoteProgress();
            saveVoteProgress(emptyProgress);
            setVoteProgress(emptyProgress);
            return;
        }

        const resetTimer = window.setTimeout(() => {
            const emptyProgress = emptyVoteProgress();
            saveVoteProgress(emptyProgress);
            setVoteProgress(emptyProgress);
        }, timeUntilReset);

        return () => window.clearTimeout(resetTimer);
    }, [voteProgress.resetAt]);

    const handleVoteSiteOpen = (siteUrl: string) => {
        setVoteProgress(currentProgress => {
            const now = Date.now();
            const activeProgress = currentProgress.resetAt !== null && currentProgress.resetAt > now
                ? currentProgress
                : emptyVoteProgress();

            if (activeProgress.openedSites.includes(siteUrl)) return activeProgress;

            const nextProgress: VoteProgress = {
                openedSites: [...activeProgress.openedSites, siteUrl],
                resetAt: activeProgress.resetAt ?? now + VOTE_PROGRESS_RESET_MS,
            };
            saveVoteProgress(nextProgress);
            return nextProgress;
        });
    };

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
                            <span className={styles.siteCount} aria-live="polite">
                                {remainingSites} vote {remainingSites === 1 ? 'site' : 'sites'} left
                            </span>
                        </div>

                        <div className={styles.voteLinks}>
                            {voteSites.map((site, index) => (
                                <VoteLinkButton
                                    key={site.href}
                                    href={site.href}
                                    label={site.label}
                                    index={index + 1}
                                    opened={openedSites.has(site.href)}
                                    onOpen={() => handleVoteSiteOpen(site.href)}
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
