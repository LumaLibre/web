import styles from "@/components/rules/RulesContent.module.scss";
import {DISCORD_INV} from "@/constants.ts";
import {quickLink} from "@/components/rules/RulesContent.tsx";

const OverviewRules = () => {
    return (
        <>
            <h1 className={styles.rulesTitleText}>
                LumaMC's Rules
            </h1>
            <div className={styles.rulesBodyText}>
                <strong>
                    Here are Luma's rules! Players are encouraged to read and stay up-to-date with
                    our rules to avoid any issues within gameplay or communication between players!
                    <br/>
                    <br/>
                    Please be aware,
                </strong>
                <br/>
                <p>
                    These rules are subject to change at any time. LumaMC staff reserve the right to administer
                    punishments based on any grounds they deem necessary to maintain a healthy and enjoyable
                    community environment.
                    <br/>
                    <br/>
                    Again, players and community members are encouraged to stay informed about any updates or
                    modifications to the rules.
                </p>
                <h2>Punishment Policy</h2>
                <ul>
                    <li>
                        Punishments are handled on a case-by-case basis, and no two instances of rule-breaking will
                        necessarily receive the same punishment.
                    </li>
                    <li>
                        Previous punishments (including warnings) may be considered when determining consequences,
                        especially if there is a lack of behavioral improvement.
                    </li>
                    <li>
                        Any attempt to evade punishments is strictly against the rules.
                    </li>
                    <li>
                        Staff members reserve the right to administer punishments based on any grounds they deem
                        necessary. If you feel a punishment is made unfairly, make a ticket on our {quickLink('discord', DISCORD_INV)} to
                        appeal or directly message an admin to report a staff member.
                    </li>
                </ul>
                <strong>
                    Conversations with other players, regardless of the setting related to the server, are subject to the
                    same rules. This includes:
                </strong>
                <ul>
                    <li>
                        Direct messages (DMs) between two LumaMC players.
                    </li>
                    <li>
                        Discord channels created specifically for any Town in-game.
                    </li>
                </ul>
            </div>
        </>
    );
};

export default OverviewRules;